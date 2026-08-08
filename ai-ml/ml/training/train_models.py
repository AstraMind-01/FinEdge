"""
FinEdge ML Pipeline — Step 12: Model Training Orchestrator

Trains three fraud detection models in sequence:
  1. Logistic Regression  — linear baseline, class_weight='balanced'
  2. Random Forest        — tree ensemble, class_weight='balanced_subsample'
  3. XGBoost              — gradient boosted trees, scale_pos_weight (graceful fallback if not installed)

Class Imbalance Strategy (Why NOT SMOTE):
=========================================
The dataset has ~3.5% fraud (confirmed in Step 11 EDA). We handle imbalance via:
  - LR:  class_weight='balanced'          — sklearn rescales loss function weights
  - RF:  class_weight='balanced_subsample' — rebalances per bootstrap sample; better
         than plain 'balanced' for bagged ensembles because each tree sees a balanced
         bootstrap sample rather than the full-dataset class ratio
  - XGB: scale_pos_weight = n_negative / n_positive — native XGBoost imbalance handling

Why NOT SMOTE/oversampling as the default:
  1. SMOTE must be applied INSIDE each CV fold to avoid data leakage; doing it
     naively on the entire training set before splitting inflates validation metrics.
  2. Synthetic minority samples may not capture the true distribution of fraud.
  3. The three weighting approaches above are simpler, leakage-free, and well-proven.
  4. imbalanced-learn remains in requirements.txt as an optional future experiment.

Dataset Fallback:
=================
If ml/data/raw/train_transaction.csv is missing (Kaggle CSVs not downloaded),
the script falls back to a synthetic dataset of similar shape and 3.5% fraud rate.
ALL outputs are clearly labelled SYNTHETIC when this occurs.

Run:
    python -m ml.training.train_models
(from the project root directory)
"""

import json
import logging
import os
import sys
import time
import warnings
from datetime import datetime

import joblib
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# XGBoost — graceful fallback if not installed
# ---------------------------------------------------------------------------
XGBOOST_AVAILABLE = False
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    print(
        "\n[WARNING] xgboost is not installed. "
        "XGBoost model will be skipped.\n"
        "Install with: pip install xgboost>=2.0.0\n"
    )

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Path constants (relative to project root — run from there)
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, "ml", "artifacts")
DATA_RAW_DIR = os.path.join(PROJECT_ROOT, "ml", "data", "raw")

os.makedirs(ARTIFACTS_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Synthetic dataset fallback
# ---------------------------------------------------------------------------
USING_SYNTHETIC_DATA = False


def _generate_synthetic_dataset(n_samples: int = 10_000) -> pd.DataFrame:
    """
    Generates a synthetic fraud dataset that mirrors the IEEE-CIS schema.

    Shape: ~10,000 rows, ~3.5% fraud rate, mix of numeric/categorical columns.
    This allows full end-to-end pipeline demonstration without Kaggle CSVs.

    *** SYNTHETIC DATA — NOT REAL RESULTS ***
    """
    rng = np.random.default_rng(42)
    n_fraud = int(n_samples * 0.035)
    n_legit = n_samples - n_fraud

    labels = np.array([0] * n_legit + [1] * n_fraud)
    rng.shuffle(labels)

    # Fraud transactions tend to be higher amounts
    amounts_legit = rng.exponential(scale=80.0, size=n_legit)
    amounts_fraud = rng.exponential(scale=220.0, size=n_fraud)
    amounts = np.where(labels == 0,
                       rng.exponential(scale=80.0, size=n_samples),
                       rng.exponential(scale=220.0, size=n_samples))

    # TransactionDT — seconds offset, 90 days range
    transaction_dt = rng.integers(86400, 86400 * 90, size=n_samples)

    df = pd.DataFrame({
        "TransactionID": np.arange(2_900_000, 2_900_000 + n_samples),
        "isFraud": labels.astype(int),
        "TransactionAmt": amounts,
        "TransactionDT": transaction_dt,
        "ProductCD": rng.choice(["W", "C", "R", "H", "S"], size=n_samples),
        "card1": rng.integers(1000, 18396, size=n_samples).astype(float),
        "card2": rng.choice([100.0, 200.0, 300.0, 400.0, 500.0, np.nan], size=n_samples),
        "card4": rng.choice(["visa", "mastercard", "american express", "discover"], size=n_samples),
        "card6": rng.choice(["debit", "credit", "debit or credit", "charge card"], size=n_samples),
        "addr1": rng.integers(100, 540, size=n_samples).astype(float),
        "addr2": rng.integers(10, 102, size=n_samples).astype(float),
        "dist1": rng.exponential(50, size=n_samples),
        "dist2": rng.choice(
            [np.nan] * 6 + list(rng.exponential(50, size=4)), size=n_samples
        ),
        "P_emaildomain": rng.choice(
            ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", np.nan], size=n_samples
        ),
        "R_emaildomain": rng.choice(
            ["gmail.com", "yahoo.com", np.nan], size=n_samples
        ),
        "C1":  rng.integers(0, 10, size=n_samples).astype(float),
        "C2":  rng.integers(0, 10, size=n_samples).astype(float),
        "C6":  rng.integers(0, 10, size=n_samples).astype(float),
        "C11": rng.integers(0, 10, size=n_samples).astype(float),
        "M1": rng.choice(["T", "F", np.nan], size=n_samples),
        "M4": rng.choice(["M0", "M1", "M2", np.nan], size=n_samples),
        "V1":  rng.normal(size=n_samples),
        "V2":  rng.normal(size=n_samples),
        "V3":  rng.normal(size=n_samples),
        "V4":  rng.normal(size=n_samples),
        "V12": rng.normal(size=n_samples),
        "V13": rng.normal(size=n_samples),
        "id_30": rng.choice(["Windows 10", "iOS 13.2", "Android 9.0", np.nan], size=n_samples),
        "id_31": rng.choice(["chrome 76.0", "firefox 69.0", "safari 12.0", np.nan], size=n_samples),
        "DeviceType": rng.choice(["desktop", "mobile", np.nan], size=n_samples),
    })

    return df


# ---------------------------------------------------------------------------
# Pipeline helpers
# ---------------------------------------------------------------------------

def _load_data() -> tuple[pd.DataFrame, bool]:
    """
    Returns (dataframe, using_synthetic).
    Attempts real data first; falls back to synthetic on FileNotFoundError.
    """
    global USING_SYNTHETIC_DATA
    sys.path.insert(0, PROJECT_ROOT)

    try:
        from ml.preprocessing.load_data import load_raw_data
        df = load_raw_data(data_dir=DATA_RAW_DIR)
        USING_SYNTHETIC_DATA = False
        logger.info("✓ Real Kaggle IEEE-CIS dataset loaded.")
        return df, False
    except FileNotFoundError:
        logger.warning(
            "\n" + "=" * 70 + "\n"
            "⚠  SYNTHETIC DATA MODE — Kaggle CSVs not found in ml/data/raw/\n"
            "   Results are for PIPELINE VALIDATION ONLY — not real fraud metrics.\n"
            "   Download dataset from Kaggle to get meaningful numbers.\n"
            + "=" * 70
        )
        df = _generate_synthetic_dataset(n_samples=10_000)
        USING_SYNTHETIC_DATA = True
        return df, True


def _run_preprocessing_pipeline(df: pd.DataFrame):
    """
    Runs clean → feature_engineering → split pipeline from Step 11.
    Returns: X_train, X_val, y_train, y_val, X_train_raw, X_val_raw
    where *_raw are pre-LR-preprocessing DataFrames for the LR path.
    """
    from ml.preprocessing.clean_data import clean_dataset
    from ml.preprocessing.feature_engineering import (
        LeakageSafePreprocessor,
        engineer_features,
        split_train_val,
    )

    logger.info("Step 1/4 — Cleaning dataset...")
    df_clean = clean_dataset(df)

    logger.info("Step 2/4 — Engineering features...")
    df_feat = engineer_features(df_clean)

    logger.info("Step 3/4 — Splitting train/validation (stratified 80/20)...")
    # Drop TransactionID before splitting (not a feature)
    if "TransactionID" in df_feat.columns:
        df_feat = df_feat.drop(columns=["TransactionID"])

    X_train_raw, X_val_raw, y_train, y_val = split_train_val(df_feat)

    logger.info("Step 4/4 — Fitting LeakageSafePreprocessor (tree path)...")
    tree_preprocessor = LeakageSafePreprocessor()
    X_train = tree_preprocessor.fit_transform(X_train_raw)
    X_val = tree_preprocessor.transform(X_val_raw)

    return X_train, X_val, y_train, y_val, X_train_raw, X_val_raw, tree_preprocessor


def _compute_scale_pos_weight(y_train: pd.Series) -> float:
    """Ratio of negative (legit) to positive (fraud) class count — XGBoost imbalance param."""
    n_neg = (y_train == 0).sum()
    n_pos = (y_train == 1).sum()
    ratio = n_neg / n_pos
    logger.info(f"scale_pos_weight = {ratio:.2f}  (neg={n_neg:,}, pos={n_pos:,})")
    return ratio


def _save_artifact(obj, filename: str):
    """Saves a Python object to ml/artifacts/ using joblib."""
    path = os.path.join(ARTIFACTS_DIR, filename)
    joblib.dump(obj, path)
    logger.info(f"✓ Artifact saved: {path}")
    return path


# ---------------------------------------------------------------------------
# Training functions
# ---------------------------------------------------------------------------

def train_logistic_regression(X_train_arr, X_val_arr, y_train, y_val, lr_preprocessor) -> dict:
    """
    Trains Logistic Regression with:
      - class_weight='balanced' (sklearn reweights loss inversely proportional to class freq)
      - solver='lbfgs' (efficient for medium datasets, supports L2 penalty)
      - max_iter=1000 (sufficient for convergence with scaled features)

    Imbalance strategy: class_weight='balanced' — no synthetic data, zero leakage risk.
    """
    from sklearn.linear_model import LogisticRegression

    logger.info("\n" + "─" * 60)
    logger.info("Training Model 1/3: Logistic Regression")
    logger.info("─" * 60)

    t0 = time.time()
    model = LogisticRegression(
        class_weight="balanced",
        solver="lbfgs",
        max_iter=1000,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_arr, y_train)
    elapsed = time.time() - t0
    logger.info(f"✓ Logistic Regression trained in {elapsed:.1f}s")

    _save_artifact(model, "logistic_regression_v1.pkl")
    _save_artifact(lr_preprocessor, "lr_preprocessor_v1.pkl")

    return {
        "model_name": "Logistic Regression",
        "artifact": "logistic_regression_v1.pkl",
        "preprocessor_artifact": "lr_preprocessor_v1.pkl",
        "imbalance_strategy": "class_weight='balanced'",
        "train_time_seconds": round(elapsed, 2),
    }


def train_random_forest(X_train, X_val, y_train, y_val) -> dict:
    """
    Trains Random Forest with:
      - class_weight='balanced_subsample'
        Rationale: 'balanced_subsample' recomputes class weights per bootstrap sample.
        This is preferred over plain 'balanced' for bagged ensembles because each tree
        gets a locally balanced view, which improves sensitivity to the minority class
        without overfitting on resampled full-dataset class ratios.
      - n_estimators=200: Enough trees for stable OOB error; acceptable train time.
      - max_depth=16: Limits overfitting on 590K rows while allowing meaningful splits;
        unconstrained depth would memorise training set.
      - n_jobs=-1: Parallel across all CPU cores.
    """
    from sklearn.ensemble import RandomForestClassifier

    logger.info("\n" + "─" * 60)
    logger.info("Training Model 2/3: Random Forest")
    logger.info("─" * 60)
    logger.info("  class_weight='balanced_subsample' — rebalances per bootstrap sample")
    logger.info("  n_estimators=200, max_depth=16, n_jobs=-1")

    t0 = time.time()
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=16,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1,
        min_samples_leaf=5,  # Prevents tiny leaf nodes; slightly faster + less overfit
    )
    model.fit(X_train, y_train)
    elapsed = time.time() - t0
    logger.info(f"✓ Random Forest trained in {elapsed:.1f}s")

    _save_artifact(model, "random_forest_v1.pkl")

    return {
        "model_name": "Random Forest",
        "artifact": "random_forest_v1.pkl",
        "preprocessor_artifact": "tree_preprocessor_v1.pkl",
        "imbalance_strategy": "class_weight='balanced_subsample'",
        "train_time_seconds": round(elapsed, 2),
    }


def train_xgboost(X_train, X_val, y_train, y_val, scale_pos_weight: float) -> dict:
    """
    Trains XGBoost with:
      - scale_pos_weight = n_negative / n_positive
        Rationale: Native XGBoost imbalance handling. Upweights the positive (fraud)
        class in the gradient computation. Equivalent to cost-sensitive learning.
        Simpler and leakage-free compared to SMOTE.
      - early_stopping_rounds=10: Stops if validation AUC doesn't improve for 10 rounds,
        preventing overfitting without a full hyperparameter search grid.
      - eval_metric='aucpr': Optimises directly on PR-AUC — the right metric for imbalanced data.
    """
    logger.info("\n" + "─" * 60)
    logger.info("Training Model 3/3: XGBoost")
    logger.info("─" * 60)
    logger.info(f"  scale_pos_weight={scale_pos_weight:.2f} (neg/pos ratio)")
    logger.info("  n_estimators=200, max_depth=6, learning_rate=0.1, early_stopping_rounds=10")

    t0 = time.time()
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="aucpr",           # Optimise PR-AUC — correct for imbalanced fraud
        early_stopping_rounds=10,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )

    eval_set = [(X_val, y_val)]
    model.fit(
        X_train,
        y_train,
        eval_set=eval_set,
        verbose=False,
    )
    elapsed = time.time() - t0
    actual_trees = model.best_iteration + 1 if hasattr(model, "best_iteration") else 200
    logger.info(f"✓ XGBoost trained in {elapsed:.1f}s (best iteration: {actual_trees})")

    _save_artifact(model, "xgboost_v1.pkl")

    return {
        "model_name": "XGBoost",
        "artifact": "xgboost_v1.pkl",
        "preprocessor_artifact": "tree_preprocessor_v1.pkl",
        "imbalance_strategy": f"scale_pos_weight={scale_pos_weight:.2f}",
        "train_time_seconds": round(elapsed, 2),
    }


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------

def main():
    logger.info("=" * 70)
    logger.info("FinEdge ML Pipeline — Step 12: Model Training")
    logger.info("=" * 70)

    # ── 1. Load data ─────────────────────────────────────────────────────
    df, using_synthetic = _load_data()

    n_total = len(df)
    fraud_rate = df["isFraud"].mean()
    logger.info(
        f"Dataset: {n_total:,} rows | Fraud rate: {fraud_rate:.4f} "
        f"({'SYNTHETIC' if using_synthetic else 'REAL'})"
    )

    # ── 2. Preprocessing (tree path) ─────────────────────────────────────
    (
        X_train, X_val, y_train, y_val,
        X_train_raw, X_val_raw,
        tree_preprocessor,
    ) = _run_preprocessing_pipeline(df)

    n_train = len(y_train)
    n_val = len(y_val)
    n_features_tree = X_train.shape[1]

    logger.info(f"Train: {n_train:,} | Val: {n_val:,} | Tree features: {n_features_tree}")

    # Save tree preprocessor (shared by RF and XGBoost)
    _save_artifact(tree_preprocessor, "tree_preprocessor_v1.pkl")

    # ── 3. LR-specific preprocessing ─────────────────────────────────────
    logger.info("\nBuilding Logistic Regression preprocessing path...")
    from ml.training.lr_preprocessing import LogisticRegressionPreprocessor

    lr_preprocessor = LogisticRegressionPreprocessor(sentinel_value=-999.0)
    X_train_lr = lr_preprocessor.fit_transform(X_train_raw)
    X_val_lr = lr_preprocessor.transform(X_val_raw)
    n_features_lr = X_train_lr.shape[1]
    logger.info(f"LR feature dimension after OHE: {n_features_lr}")

    # ── 4. Class imbalance info ───────────────────────────────────────────
    scale_pos_weight = _compute_scale_pos_weight(y_train)

    # ── 5. Train all models ───────────────────────────────────────────────
    model_infos = []

    # 5a. Logistic Regression
    lr_info = train_logistic_regression(X_train_lr, X_val_lr, y_train, y_val, lr_preprocessor)
    model_infos.append(lr_info)

    # 5b. Random Forest
    rf_info = train_random_forest(X_train, X_val, y_train, y_val)
    model_infos.append(rf_info)

    # 5c. XGBoost (graceful skip if not installed)
    if XGBOOST_AVAILABLE:
        xgb_info = train_xgboost(X_train, X_val, y_train, y_val, scale_pos_weight)
        model_infos.append(xgb_info)
    else:
        logger.warning("XGBoost skipped — not installed. Train/eval will cover 2 models only.")

    # ── 6. Write model_metadata.json ─────────────────────────────────────
    metadata = {
        "step": "Step 12 — Model Training",
        "training_date_utc": datetime.utcnow().isoformat() + "Z",
        "data_source": "SYNTHETIC — Kaggle CSVs not present" if using_synthetic else "IEEE-CIS Fraud Detection (Kaggle)",
        "n_total_rows": n_total,
        "n_train_rows": n_train,
        "n_val_rows": n_val,
        "fraud_rate_overall": round(fraud_rate, 6),
        "fraud_rate_train": round(float(y_train.mean()), 6),
        "fraud_rate_val": round(float(y_val.mean()), 6),
        "n_features_tree_path": n_features_tree,
        "n_features_lr_path": n_features_lr,
        "smote_used": False,
        "smote_note": (
            "SMOTE intentionally excluded as default strategy. "
            "Reason: must be applied inside CV folds to prevent leakage; "
            "class-weighting approaches used instead (simpler, leakage-free). "
            "imbalanced-learn remains in requirements for optional future experiments."
        ),
        "models": model_infos,
        "hyperparameter_tuning": "None — fixed reasonable defaults used. Grid/random search noted as future enhancement.",
    }

    metadata_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"\n✓ model_metadata.json saved: {metadata_path}")

    # ── 7. Summary ───────────────────────────────────────────────────────
    logger.info("\n" + "=" * 70)
    logger.info("TRAINING COMPLETE")
    logger.info("=" * 70)
    if using_synthetic:
        logger.warning(
            "⚠  SYNTHETIC DATA USED — these artifacts are for pipeline validation only.\n"
            "   Download Kaggle IEEE-CIS CSVs to ml/data/raw/ for real training results."
        )
    logger.info(f"Artifacts saved to: {ARTIFACTS_DIR}")
    for m in model_infos:
        logger.info(f"  → {m['artifact']}  [{m['imbalance_strategy']}]  ({m['train_time_seconds']}s)")
    logger.info("\nNext step: python -m ml.evaluation.evaluate_models")
    logger.info("=" * 70)


if __name__ == "__main__":
    main()
