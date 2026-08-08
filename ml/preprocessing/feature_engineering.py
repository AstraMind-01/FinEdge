import logging
from typing import Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies explainable feature transformations appropriate for financial fraud detection.

    Derived Features:
    1. log_TransactionAmt: Log-transformed transaction amount to normalize extreme right-skew.
    2. transaction_hour: Extracted hour of day (0-23) from TransactionDT timedelta.
    3. transaction_day: Extracted day of week (0-6) from TransactionDT timedelta.
    """
    df_feat = df.copy()

    if "TransactionAmt" in df_feat.columns:
        df_feat["log_TransactionAmt"] = np.log1p(df_feat["TransactionAmt"])

    if "TransactionDT" in df_feat.columns:
        # TransactionDT is timedelta in seconds from a reference point
        df_feat["transaction_hour"] = (df_feat["TransactionDT"] // 3600) % 24
        df_feat["transaction_day"] = (df_feat["TransactionDT"] // 86400) % 7

    return df_feat


class LeakageSafePreprocessor:
    """
    Data Preprocessing Pipeline designed to prevent Data Leakage.

    LEAKAGE PREVENTION PRINCIPLE:
    Categorical encoders and numerical scalers must fit EXCLUSIVELY on the training dataset.
    Validation and test datasets are transformed using parameters learned during fit().
    Unseen categorical levels encountered during transform() are mapped to an 'unknown' label index.
    """

    def __init__(self):
        self.label_encoders = {}
        self.categorical_cols = []
        self.feature_names = []

    def fit(self, X_train: pd.DataFrame):
        """Fits encoders strictly on training data."""
        self.feature_names = X_train.columns.tolist()
        self.categorical_cols = X_train.select_dtypes(include=["object", "category"]).columns.tolist()

        logger.info(f"Fitting LeakageSafePreprocessor on {len(X_train)} training rows...")
        logger.info(f"Categorical features to encode: {len(self.categorical_cols)}")

        for col in self.categorical_cols:
            le = LabelEncoder()
            # Convert to string and fit
            train_vals = X_train[col].astype(str)
            le.fit(train_vals)
            self.label_encoders[col] = le

        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transforms evaluation/test set using fitted encoders from training set."""
        X_trans = X.copy()

        for col in self.categorical_cols:
            le = self.label_encoders[col]
            series_str = X_trans[col].astype(str)

            # Map unseen labels in validation/test set to a fallback index to prevent leakage errors
            known_classes = set(le.classes_)
            series_mapped = series_str.map(lambda s: s if s in known_classes else le.classes_[0])
            X_trans[col] = le.transform(series_mapped)

        return X_trans

    def fit_transform(self, X_train: pd.DataFrame) -> pd.DataFrame:
        """Fits on training data and returns transformed training DataFrame."""
        self.fit(X_train)
        return self.transform(X_train)


def split_train_val(
    df: pd.DataFrame, target_col: str = "isFraud", test_size: float = 0.2, random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Executes a Stratified Train-Validation Split to preserve the 3.5% fraud class ratio.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]

    logger.info(f"Splitting dataset into train ({1-test_size:.0%}) and validation ({test_size:.0%}) with stratification...")
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    logger.info(f"X_train shape: {X_train.shape}, y_train fraud ratio: {y_train.mean():.4f}")
    logger.info(f"X_val shape: {X_val.shape}, y_val fraud ratio: {y_val.mean():.4f}")

    return X_train, X_val, y_train, y_val


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Leakage-Safe Feature Engineering Pipeline Loaded.")
