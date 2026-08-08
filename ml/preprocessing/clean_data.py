import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def clean_dataset(df: pd.DataFrame, drop_missing_threshold: float = 0.90) -> pd.DataFrame:
    """
    Cleans raw dataset by handling missing values and data types.

    Design Rationale:
    1. High Missingness Dropping: Columns with > 90% missing values introduce noise
       and offer little predictive signal for fraud classification.
    2. Tree-Based Missing Handling:
       - Numeric columns fill NaN with sentinel value -999.0 (Gradient Boosted Trees / Random Forests
         efficiently isolate sentinel values into separate split nodes).
       - Categorical columns fill NaN with explicit string token 'missing'.

    Args:
        df (pd.DataFrame): Raw merged dataframe.
        drop_missing_threshold (float): Missing percentage threshold for column deletion (default 0.90).

    Returns:
        pd.DataFrame: Cleaned dataframe.
    """
    df_clean = df.copy()

    # 1. Drop columns exceeding missing threshold
    missing_pct = df_clean.isnull().mean()
    cols_to_drop = missing_pct[missing_pct > drop_missing_threshold].index.tolist()
    if cols_to_drop:
        logger.info(f"Dropping {len(cols_to_drop)} columns exceeding {drop_missing_threshold*100}% missing threshold.")
        df_clean.drop(columns=cols_to_drop, inplace=True)

    # Separate target & ID from feature transformations
    target_col = "isFraud"
    id_col = "TransactionID"

    feature_cols = [col for col in df_clean.columns if col not in [target_col, id_col]]
    numeric_cols = df_clean[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df_clean[feature_cols].select_dtypes(include=["object", "category"]).columns.tolist()

    logger.info(f"Identified {len(numeric_cols)} numeric features and {len(categorical_cols)} categorical features.")

    # 2. Impute missing values
    # Numeric -> -999.0 sentinel value
    df_clean[numeric_cols] = df_clean[numeric_cols].fillna(-999.0)

    # Categorical -> 'missing' token
    for col in categorical_cols:
        df_clean[col] = df_clean[col].astype(str).fillna("missing")

    logger.info(f"Data cleaning complete. Output shape: {df_clean.shape}")
    return df_clean


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Clean Data module loaded successfully.")
