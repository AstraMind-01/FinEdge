import os
import pytest
import pandas as pd
import numpy as np
from ml.preprocessing.load_data import load_raw_data
from ml.preprocessing.clean_data import clean_dataset
from ml.preprocessing.feature_engineering import LeakageSafePreprocessor, engineer_features

def test_load_raw_data_missing_file_throws_error():
    with pytest.raises(FileNotFoundError):
        load_raw_data(data_dir="non_existent_directory_123")

def test_clean_dataset_missing_value_handling():
    # Construct a sample DataFrame
    data = {
        "TransactionID": [1, 2, 3],
        "isFraud": [0, 0, 1],
        "Amount": [10.0, np.nan, 30.0],
        "CardType": ["visa", np.nan, "mastercard"],
        "NoiseColumn": [np.nan, np.nan, np.nan] # 100% missing
    }
    df = pd.DataFrame(data)

    df_cleaned = clean_dataset(df, drop_missing_threshold=0.90)

    # 1. High missingness column should be dropped
    assert "NoiseColumn" not in df_cleaned.columns

    # 2. Numeric nan filled with -999.0 sentinel
    assert df_cleaned.loc[1, "Amount"] == -999.0

    # 3. Categorical nan filled with 'nan' / 'missing' string fallback
    assert df_cleaned.loc[1, "CardType"] in ["nan", "missing", "None"]

def test_leakage_safe_preprocessor_unseen_categories():
    train_data = {
        "Category": ["Apple", "Banana", "Apple"]
    }
    test_data = {
        "Category": ["Apple", "Cherry", "Banana"]  # Cherry is unseen
    }

    df_train = pd.DataFrame(train_data)
    df_test = pd.DataFrame(test_data)

    preprocessor = LeakageSafePreprocessor()
    df_train_trans = preprocessor.fit_transform(df_train)
    
    # Transform should run without throwing KeyError or ValueError for unseen 'Cherry'
    df_test_trans = preprocessor.transform(df_test)

    assert df_train_trans.shape == df_train.shape
    assert df_test_trans.shape == df_test.shape
    assert len(preprocessor.label_encoders) == 1

def test_engineer_features():
    data = {
        "TransactionAmt": [100.0, 200.0],
        "TransactionDT": [3600, 86400 + 7200]
    }
    df = pd.DataFrame(data)
    df_engineered = engineer_features(df)

    assert "log_TransactionAmt" in df_engineered.columns
    assert "transaction_hour" in df_engineered.columns
    assert "transaction_day" in df_engineered.columns
    
    # Row 0: 3600 seconds = 1 hour. Hour = 1, Day = 0.
    assert df_engineered.loc[0, "transaction_hour"] == 1
    assert df_engineered.loc[0, "transaction_day"] == 0
