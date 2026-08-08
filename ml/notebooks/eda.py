"""
FinEdge Machine Learning Pipeline — Step 11: Exploratory Data Analysis (EDA)

This script performs exploratory analysis on the IEEE-CIS Fraud Detection dataset,
covering class imbalance, missingness, feature distributions, and explainable insights.
"""

import os
import sys
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from ml.preprocessing.load_data import load_raw_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def run_eda(data_dir: str = "ml/data/raw"):
    logger.info("========================================================")
    logger.info("FinEdge ML Pipeline — Exploratory Data Analysis (EDA)")
    logger.info("========================================================")

    try:
        df = load_raw_data(data_dir=data_dir)
    except FileNotFoundError:
        logger.warning("Simulating synthetic IEEE-CIS dataset sample for demonstration EDA...")
        # Synthetic fallback for demonstration when raw files are not yet present
        n_samples = 1000
        df = pd.DataFrame({
            "TransactionID": np.arange(1000000, 1000000 + n_samples),
            "isFraud": np.random.choice([0, 1], size=n_samples, p=[0.965, 0.035]),
            "TransactionAmt": np.random.exponential(scale=100.0, size=n_samples),
            "ProductCD": np.random.choice(["W", "C", "R", "H", "S"], size=n_samples),
            "card4": np.random.choice(["visa", "mastercard", "discover", "american express"], size=n_samples),
            "TransactionDT": np.random.randint(86400, 864000, size=n_samples),
            "V1": np.random.normal(size=n_samples),
            "id_30": np.random.choice(["Windows 10", "iOS 14.4", "Android 11", np.nan], size=n_samples)
        })

    print("\n1. DATASET OVERVIEW & SHAPE")
    print("-" * 50)
    print(f"Total Rows:        {df.shape[0]:,}")
    print(f"Total Columns:     {df.shape[1]:,}")
    print(f"Memory Usage:      {df.memory_usage().sum() / 1024**2:.2f} MB")

    print("\n2. CLASS IMBALANCE ANALYSIS")
    print("-" * 50)
    fraud_counts = df["isFraud"].value_counts()
    fraud_percentages = df["isFraud"].value_counts(normalize=True) * 100
    print(f"Legitimate (0):    {fraud_counts.get(0, 0):,} ({fraud_percentages.get(0, 0):.2f}%)")
    print(f"Fraudulent (1):    {fraud_counts.get(1, 0):,} ({fraud_percentages.get(1, 0):.2f}%)")
    print("\n[VIVA NOTE] High class imbalance (~3.5% fraud) dictates evaluation metrics.")
    print("Standard Accuracy is misleading (a dummy model predicting 0 gets 96.5% accuracy).")
    print("Step 12 will use Precision-Recall AUC (PR-AUC) and F1-Score instead of accuracy.")

    print("\n3. MISSING VALUE ANALYSIS")
    print("-" * 50)
    missing_series = df.isnull().mean() * 100
    missing_summary = missing_series[missing_series > 0].sort_values(ascending=False)
    print(f"Total Columns with Missing Values: {len(missing_summary)}")
    print(f"Columns with > 90% Missing:       {(missing_series > 90).sum()}")
    print(f"Columns with > 50% Missing:       {(missing_series > 50).sum()}")

    print("\n4. TRANSACTION AMOUNT DISTRIBUTION")
    print("-" * 50)
    print("TransactionAmt Summary Statistics:")
    print(df["TransactionAmt"].describe().to_string())

    print("\n5. ANONYMIZED Kaggle V-COLUMNS NOTE")
    print("-" * 50)
    print("[EXPLAINABILITY NOTE] V1 - V339 represent anonymized/masked Vesta features.")
    print("They contain numeric signals (e.g. counting past interactions), but lack public semantic labels.")
    print("In production/viva explanations, we treat V-features as numeric signals without fabricating false real-world meanings.")

    logger.info("EDA completed successfully.")


if __name__ == "__main__":
    data_directory = sys.argv[1] if len(sys.argv) > 1 else "ml/data/raw"
    run_eda(data_dir=data_directory)
