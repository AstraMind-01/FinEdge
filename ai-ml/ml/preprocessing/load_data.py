import os
import logging
import pandas as pd

logger = logging.getLogger(__name__)


def load_raw_data(data_dir: str = "ml/data/raw") -> pd.DataFrame:
    """
    Loads raw IEEE-CIS Fraud Detection dataset files (train_transaction.csv and train_identity.csv)
    and merges them using a left join on TransactionID.

    Returns:
        pd.DataFrame: Merged dataset containing transaction and identity features.
    """
    trans_path = os.path.join(data_dir, "train_transaction.csv")
    ident_path = os.path.join(data_dir, "train_identity.csv")

    if not os.path.exists(trans_path):
        warning_msg = (
            f"\n[DATASET MISSING WARNING]\n"
            f"Raw dataset file '{trans_path}' not found.\n"
            f"Please download the IEEE-CIS Fraud Detection dataset from Kaggle\n"
            f"and extract 'train_transaction.csv' and 'train_identity.csv' into '{data_dir}/'.\n"
            f"See 'ml/README.md' for detailed instructions.\n"
        )
        logger.warning(warning_msg)
        raise FileNotFoundError(warning_msg)

    logger.info(f"Loading transaction dataset from {trans_path}...")
    df_trans = pd.read_csv(trans_path)
    logger.info(f"Transaction data shape: {df_trans.shape}")

    if os.path.exists(ident_path):
        logger.info(f"Loading identity dataset from {ident_path}...")
        df_ident = pd.read_csv(ident_path)
        logger.info(f"Identity data shape: {df_ident.shape}")

        # IEEE-CIS Quirk: Left join since identity is optional for some transactions
        logger.info("Merging transaction and identity datasets on TransactionID (left join)...")
        df_merged = df_trans.merge(df_ident, on="TransactionID", how="left")
    else:
        logger.warning(f"Identity file '{ident_path}' not found. Proceeding with transaction data only.")
        df_merged = df_trans

    logger.info(f"Merged dataset final shape: {df_merged.shape}")

    assert "isFraud" in df_merged.columns, "Target column 'isFraud' missing from dataset!"
    return df_merged


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    try:
        df = load_raw_data()
        print(f"Successfully loaded dataset with shape: {df.shape}")
    except FileNotFoundError as e:
        print(e)
