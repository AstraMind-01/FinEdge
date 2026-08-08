"""
FinEdge ML Pipeline — Step 12: Model Evaluation

Evaluates all three trained models on the held-out validation split and produces:
  1. Per-model metrics: ROC-AUC, PR-AUC, Precision, Recall, F1, FPR, FNR, Latency
  2. Comparison table printed to console and saved as model_comparison.csv
  3. Confusion matrix (text form) per model
  4. Commentary on why PR-AUC/Recall/FNR matter more than accuracy for fraud detection

Run:
    python -m ml.evaluation.evaluate_models
(from the project root directory, AFTER running train_models.py)

WHY ACCURACY IS MISLEADING FOR FRAUD DETECTION:
================================================
With ~3.5% fraud, a naive model that always predicts "legitimate" achieves
96.5% accuracy — yet catches ZERO fraud. This is the "accuracy paradox" for
imbalanced classification.

METRICS THAT ACTUALLY MATTER:
  ★ PR-AUC (Average Precision): Measures precision at every recall threshold.
    Especially informative when the positive class (fraud) is rare. A random
    classifier achieves PR-AUC ≈ 0.035 (the fraud base rate); a good model
    should score 0.5+.

  ★ Recall (Sensitivity / True Positive Rate): Of ALL fraud transactions, what
    fraction did we catch? A missed fraud (False Negative) directly translates
    to financial loss for the bank and customer. Recall must be maximised.

  ★ False Negative Rate (FNR = 1 - Recall): The fraction of fraud we MISS.
    This is the most dangerous failure mode — undetected fraud. Even a 5%
    FNR on a high-volume system means thousands of fraudulent transactions
    slip through daily.

  ROC-AUC is also reported for completeness but is less informative than
  PR-AUC when class imbalance is severe (it can be artificially inflated by
  the large number of true negatives).
"""

import json
import logging
import os
import sys
import time
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

warnings.filterwarnings("ignore")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Path constants
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, "ml", "artifacts")
EVAL_DIR = os.path.join(PROJECT_ROOT, "ml", "evaluation")
DATA_RAW_DIR = os.path.join(PROJECT_ROOT, "ml", "data", "raw")

sys.path.insert(0, PROJECT_ROOT)


# ---------------------------------------------------------------------------
# Reproduce the same data pipeline (same random_state=42 → identical split)
# ---------------------------------------------------------------------------

def _load_and_prepare_data():
    """
    Rebuilds the data pipeline identically to train_models.py.
    Same random_state=42 guarantees the validation split is identical.
    """
    from ml.training.train_models import _generate_synthetic_dataset

    USING_SYNTHETIC = False
    try:
        from ml.preprocessing.load_data import load_raw_data
        df = load_raw_data(data_dir=DATA_RAW_DIR)
        logger.info("✓ Real Kaggle IEEE-CIS dataset loaded for evaluation.")
    except FileNotFoundError:
        logger.warning(
            "\n⚠  SYNTHETIC DATA — evaluation metrics are for PIPELINE VALIDATION only."
        )
        df = _generate_synthetic_dataset(n_samples=10_000)
        USING_SYNTHETIC = True

    from ml.preprocessing.clean_data import clean_dataset
    from ml.preprocessing.feature_engineering import engineer_features, split_train_val

    df_clean = clean_dataset(df)
    df_feat = engineer_features(df_clean)

    if "TransactionID" in df_feat.columns:
        df_feat = df_feat.drop(columns=["TransactionID"])

    X_train_raw, X_val_raw, y_train, y_val = split_train_val(df_feat)

    return X_train_raw, X_val_raw, y_train, y_val, USING_SYNTHETIC


# ---------------------------------------------------------------------------
# Metric computation
# ---------------------------------------------------------------------------

def _compute_metrics(model_name: str, y_true, y_pred_proba, y_pred_binary, inference_ms_per1k: float) -> dict:
    """Computes all 8 evaluation metrics for one model."""
    roc_auc = roc_auc_score(y_true, y_pred_proba)
    pr_auc = average_precision_score(y_true, y_pred_proba)
    precision = precision_score(y_true, y_pred_binary, zero_division=0)
    recall = recall_score(y_true, y_pred_binary, zero_division=0)
    f1 = f1_score(y_true, y_pred_binary, zero_division=0)

    cm = confusion_matrix(y_true, y_pred_binary)
    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0  # False Positive Rate
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0  # False Negative Rate

    return {
        "Model": model_name,
        "ROC-AUC": round(roc_auc, 4),
        "PR-AUC ★": round(pr_auc, 4),
        "Precision": round(precision, 4),
        "Recall ★": round(recall, 4),
        "F1-Score": round(f1, 4),
        "FPR": round(fpr, 4),
        "FNR ★": round(fnr, 4),
        "Latency (ms/1k)": round(inference_ms_per1k, 2),
        # Keep raw confusion matrix for display
        "_cm": cm,
        "_tn": int(tn), "_fp": int(fp), "_fn": int(fn), "_tp": int(tp),
    }


def _predict_with_latency(model, X, n_repeats: int = 3):
    """
    Returns (y_pred_proba, y_pred_binary, ms_per_1000_predictions).
    Times over n_repeats to get a stable estimate.
    """
    n = len(X)
    times = []
    for _ in range(n_repeats):
        t0 = time.perf_counter()
        proba = model.predict_proba(X)[:, 1]
        times.append(time.perf_counter() - t0)

    avg_sec = sum(times) / n_repeats
    ms_per_1k = (avg_sec / n) * 1000 * 1000  # convert to ms per 1000 rows

    threshold = 0.5
    binary = (proba >= threshold).astype(int)
    return proba, binary, ms_per_1k


def _print_confusion_matrix(model_name: str, tn, fp, fn, tp):
    """Prints a text-form confusion matrix."""
    print(f"\n  Confusion Matrix — {model_name}")
    print(f"  {'':20s}  Predicted Legit  Predicted Fraud")
    print(f"  {'Actual Legit':20s}  {tn:>14,}  {fp:>14,}")
    print(f"  {'Actual Fraud':20s}  {fn:>14,}  {tp:>14,}")


def _print_metric_commentary():
    """Prints a short block explaining evaluation philosophy."""
    print("\n" + "=" * 70)
    print("EVALUATION PHILOSOPHY — WHY ACCURACY DOESN'T MATTER HERE")
    print("=" * 70)
    print("""
  Dataset: ~3.5% fraud  →  Naive "always-predict-legit" model = 96.5% accuracy.
  Accuracy is misleading. We prioritise:

  ★ PR-AUC (Precision-Recall AUC)
      Best single metric for imbalanced binary classification.
      Random classifier baseline ≈ 0.035 (the fraud base rate).

  ★ Recall (Sensitivity)
      Fraction of real fraud we detected.
      Every missed fraud = financial loss for customers and the bank.
      A model with high precision but low recall catches fewer fraudsters.

  ★ FNR (False Negative Rate = 1 - Recall)
      The most dangerous failure mode: fraud that slips through undetected.
      Lower is better. Aim for FNR < 0.20 in production.

  ROC-AUC is reported for comparison but can be misleadingly high under
  class imbalance due to the large number of true negatives.
""")


# ---------------------------------------------------------------------------
# Per-model evaluation runners
# ---------------------------------------------------------------------------

def _evaluate_logistic_regression(X_val_raw, y_val) -> dict | None:
    lr_path = os.path.join(ARTIFACTS_DIR, "logistic_regression_v1.pkl")
    lr_prep_path = os.path.join(ARTIFACTS_DIR, "lr_preprocessor_v1.pkl")

    if not os.path.exists(lr_path):
        logger.warning(f"LR artifact not found: {lr_path} — skipping.")
        return None

    model = joblib.load(lr_path)
    lr_preprocessor = joblib.load(lr_prep_path)

    X_val_lr = lr_preprocessor.transform(X_val_raw)
    proba, binary, latency = _predict_with_latency(model, X_val_lr)

    return _compute_metrics("Logistic Regression", y_val, proba, binary, latency)


def _evaluate_random_forest(X_val_raw, y_val, tree_preprocessor) -> dict | None:
    rf_path = os.path.join(ARTIFACTS_DIR, "random_forest_v1.pkl")

    if not os.path.exists(rf_path):
        logger.warning(f"RF artifact not found: {rf_path} — skipping.")
        return None

    model = joblib.load(rf_path)
    X_val_tree = tree_preprocessor.transform(X_val_raw)
    proba, binary, latency = _predict_with_latency(model, X_val_tree)

    return _compute_metrics("Random Forest", y_val, proba, binary, latency)


def _evaluate_xgboost(X_val_raw, y_val, tree_preprocessor) -> dict | None:
    xgb_path = os.path.join(ARTIFACTS_DIR, "xgboost_v1.pkl")

    if not os.path.exists(xgb_path):
        logger.info(f"XGBoost artifact not found (likely skipped during training) — skipping evaluation.")
        return None

    model = joblib.load(xgb_path)
    X_val_tree = tree_preprocessor.transform(X_val_raw)
    proba, binary, latency = _predict_with_latency(model, X_val_tree)

    return _compute_metrics("XGBoost", y_val, proba, binary, latency)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    logger.info("=" * 70)
    logger.info("FinEdge ML Pipeline — Step 12: Model Evaluation")
    logger.info("=" * 70)

    # ── 1. Re-run data pipeline (same split) ─────────────────────────────
    X_train_raw, X_val_raw, y_train, y_val, using_synthetic = _load_and_prepare_data()

    if using_synthetic:
        print(
            "\n" + "!" * 70 + "\n"
            "!  SYNTHETIC DATA — Results are for pipeline validation only.\n"
            "!  Download IEEE-CIS CSVs to ml/data/raw/ for real metrics.\n"
            + "!" * 70
        )

    logger.info(f"Validation set: {len(y_val):,} rows | Fraud: {y_val.sum():,} ({y_val.mean():.4f})")

    # ── 2. Load tree preprocessor (shared by RF + XGBoost) ───────────────
    tree_prep_path = os.path.join(ARTIFACTS_DIR, "tree_preprocessor_v1.pkl")
    if not os.path.exists(tree_prep_path):
        logger.error(
            "tree_preprocessor_v1.pkl not found. "
            "Run python -m ml.training.train_models first."
        )
        sys.exit(1)
    tree_preprocessor = joblib.load(tree_prep_path)

    # ── 3. Evaluate each model ────────────────────────────────────────────
    results = []

    lr_result = _evaluate_logistic_regression(X_val_raw, y_val)
    if lr_result:
        results.append(lr_result)

    rf_result = _evaluate_random_forest(X_val_raw, y_val, tree_preprocessor)
    if rf_result:
        results.append(rf_result)

    xgb_result = _evaluate_xgboost(X_val_raw, y_val, tree_preprocessor)
    if xgb_result:
        results.append(xgb_result)

    if not results:
        logger.error("No model artifacts found. Run train_models.py first.")
        sys.exit(1)

    # ── 4. Print evaluation philosophy ───────────────────────────────────
    _print_metric_commentary()

    # ── 5. Print confusion matrices ───────────────────────────────────────
    print("\n" + "=" * 70)
    print("CONFUSION MATRICES (Validation Set)")
    print("=" * 70)
    for r in results:
        _print_confusion_matrix(r["Model"], r["_tn"], r["_fp"], r["_fn"], r["_tp"])

    # ── 6. Comparison table ───────────────────────────────────────────────
    display_cols = ["Model", "ROC-AUC", "PR-AUC ★", "Precision", "Recall ★",
                    "F1-Score", "FPR", "FNR ★", "Latency (ms/1k)"]
    df_results = pd.DataFrame(results)[display_cols]

    print("\n" + "=" * 70)
    print("MODEL COMPARISON TABLE")
    if using_synthetic:
        print("  ★ SYNTHETIC DATA — values are NOT real fraud-detection metrics ★")
    print("=" * 70)
    print(df_results.to_string(index=False))
    print()
    print("  ★ = Highest-priority metrics for fraud detection (see commentary above)")

    # ── 7. Save comparison CSV ────────────────────────────────────────────
    csv_path = os.path.join(EVAL_DIR, "model_comparison.csv")
    df_results.to_csv(csv_path, index=False)
    logger.info(f"✓ Comparison table saved: {csv_path}")

    # ── 8. Print best model recommendation ───────────────────────────────
    best_by_prauc = df_results.loc[df_results["PR-AUC ★"].idxmax(), "Model"]
    best_by_recall = df_results.loc[df_results["Recall ★"].idxmax(), "Model"]

    print("\n" + "=" * 70)
    print("QUICK RECOMMENDATION (see model_selection.md for full reasoning)")
    print("=" * 70)
    print(f"  Best by PR-AUC : {best_by_prauc}")
    print(f"  Best by Recall : {best_by_recall}")
    print()
    if using_synthetic:
        print("  ⚠  These recommendations are based on SYNTHETIC data.")
        print("     Retrain with real Kaggle data for meaningful selection.")
    print()
    print("  → Run: python -m ml.evaluation.evaluate_models  (already done)")
    print("  → Review: ml/evaluation/model_selection.md")
    print("=" * 70)

    # Return results for use by model_selection_writer
    return df_results, results, using_synthetic


if __name__ == "__main__":
    main()
