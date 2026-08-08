"""
FinEdge ML Pipeline — Step 12: Logistic Regression-Specific Preprocessing

DESIGN RATIONALE:
=================
Step 11's clean_data.py uses sentinel values (-999.0) and LabelEncoder (label
integers for categorical features) which are optimised for tree-based models
(Random Forest / XGBoost). These are wholly unsuitable for Logistic Regression:

  1. Sentinel -999.0: Logistic Regression uses distance-based decision boundaries.
     A sentinel far from the real feature distribution creates a strong, spurious
     linear signal. Proper median imputation is required.
  2. LabelEncoder: Ordinal integer encoding imposes a false ordering on nominal
     categories (e.g. "visa"=0 < "mastercard"=1 implies mastercard > visa, which
     is meaningless). One-Hot Encoding is the correct choice.
  3. No StandardScaler in Step 11 pipeline: LR with l2 regularisation is
     scale-sensitive; features must be standardised.

LEAKAGE PREVENTION:
===================
This class follows the same fit-on-train / transform-on-val pattern as
LeakageSafePreprocessor in feature_engineering.py. fit() is called ONLY on
training data; validation/test data are transformed using fitted parameters.
"""

import logging
from typing import List

import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

logger = logging.getLogger(__name__)


class LogisticRegressionPreprocessor:
    """
    Leakage-safe preprocessing pipeline tailored for Logistic Regression.

    Steps (fit on train only, applied on train+val/test):
      1. Restore NaN: Replace sentinel -999.0 with np.nan (tree sentinels -> true missing).
      2. Numeric imputation: Median imputation (robust to outliers in financial data).
      3. StandardScaler: Zero mean, unit variance — required for L2-regularised LR.
      4. One-Hot Encoding: Nominal categorical features encoded as binary indicators.
         handle_unknown='ignore' maps unseen validation categories to all-zero row.
    """

    def __init__(self, sentinel_value: float = -999.0):
        self.sentinel_value = sentinel_value
        self.numeric_cols: List[str] = []
        self.categorical_cols: List[str] = []
        self.feature_names_out: List[str] = []

        self._imputer = SimpleImputer(strategy="median")
        self._scaler = StandardScaler()
        self._ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _restore_nan(self, X: pd.DataFrame) -> pd.DataFrame:
        """Replace sentinel -999.0 with np.nan so imputer works correctly."""
        X_out = X.copy()
        for col in self.numeric_cols:
            X_out[col] = X_out[col].replace(self.sentinel_value, np.nan)
        return X_out

    def _identify_column_types(self, X: pd.DataFrame):
        """Identify numeric and categorical columns, excluding ID/target if present."""
        exclude = {"TransactionID", "isFraud"}
        feature_cols = [c for c in X.columns if c not in exclude]
        self.numeric_cols = (
            X[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
        )
        self.categorical_cols = (
            X[feature_cols]
            .select_dtypes(include=["object", "category"])
            .columns.tolist()
        )
        logger.info(
            f"LR Preprocessor — numeric cols: {len(self.numeric_cols)}, "
            f"categorical cols: {len(self.categorical_cols)}"
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fit(self, X_train: pd.DataFrame) -> "LogisticRegressionPreprocessor":
        """Fit all transformers exclusively on training data."""
        logger.info(
            f"Fitting LogisticRegressionPreprocessor on {len(X_train):,} training rows..."
        )
        self._identify_column_types(X_train)

        X_num = self._restore_nan(X_train)[self.numeric_cols]
        X_cat = X_train[self.categorical_cols].astype(str)

        # Fit imputer and scaler on numeric features
        self._imputer.fit(X_num)
        X_num_imputed = self._imputer.transform(X_num)
        self._scaler.fit(X_num_imputed)

        # Fit OHE on categorical features (only if any exist)
        if self.categorical_cols:
            self._ohe.fit(X_cat)

        # Record output feature names for downstream use
        ohe_feature_names = (
            self._ohe.get_feature_names_out(self.categorical_cols).tolist()
            if self.categorical_cols
            else []
        )
        self.feature_names_out = self.numeric_cols + ohe_feature_names

        logger.info(
            f"LR Preprocessor fitted. Output feature dimension: {len(self.feature_names_out)}"
        )
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """
        Transform data using fitted parameters. Returns a numpy array
        (numeric imputed+scaled + OHE categoricals) suitable for sklearn.
        """
        X_num = self._restore_nan(X)[self.numeric_cols]
        X_num_imputed = self._imputer.transform(X_num)
        X_num_scaled = self._scaler.transform(X_num_imputed)

        if self.categorical_cols:
            X_cat = X[self.categorical_cols].astype(str)
            X_cat_encoded = self._ohe.transform(X_cat)
            return np.hstack([X_num_scaled, X_cat_encoded])
        else:
            return X_num_scaled

    def fit_transform(self, X_train: pd.DataFrame) -> np.ndarray:
        """Fit on training data and return transformed training array."""
        self.fit(X_train)
        return self.transform(X_train)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("LogisticRegressionPreprocessor module loaded successfully.")
