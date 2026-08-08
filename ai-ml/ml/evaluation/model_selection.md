# FinEdge ML — Step 12: Model Selection Writeup

**Date:** 2026-08-08  
**Data Source:** ⚠ SYNTHETIC (10,000 rows, 3.5% fraud) — Kaggle CSVs not present in `ml/data/raw/`  
**Validation Set:** 2,000 rows | 70 fraud | 1,930 legitimate  
**Random State:** 42 (stratified 80/20 split)

> **Important:** The metric values below were produced using a *synthetic* dataset
> generated to mirror the IEEE-CIS schema and fraud rate. They demonstrate that
> the full pipeline runs correctly end-to-end, but they are NOT predictive of real
> fraud-detection performance. Re-train with the Kaggle CSVs for meaningful results.

---

## Evaluation Results (Synthetic Data Run)

| Model               | ROC-AUC | PR-AUC [*] | Precision | Recall [*] | F1-Score | FPR    | FNR [*] | Latency ms/1k |
|---------------------|---------|-----------|-----------|-----------|---------|--------|--------|--------------|
| Logistic Regression | 0.6862  | **0.2292**| 0.0741    | **0.4857**| 0.1285  | 0.2202 | **0.5143** | 0.12     |
| Random Forest       | **0.7170** | 0.2231 | **0.6471**| 0.1571    | **0.2529** | **0.0031** | 0.8429 | 20.47  |
| XGBoost             | 0.6392  | 0.1778    | 0.1086    | 0.3429    | 0.1649  | 0.1021 | 0.6571 | 2.62      |

`[*]` = Highest-priority metrics for fraud detection (see evaluation philosophy below)

---

## Evaluation Philosophy — Why Accuracy Is Irrelevant

With ~3.5% fraud, a naive "always predict legitimate" model achieves **96.5% accuracy**
while catching zero fraud. This is the accuracy paradox for imbalanced classification.

The metrics that actually matter:

- **PR-AUC (Precision-Recall AUC):** Best single metric under class imbalance.
  A random classifier scores ~0.035 (the base fraud rate). Our models score 0.18–0.23,
  showing meaningful signal above random.

- **Recall:** Fraction of actual fraud we caught. Missed fraud = financial loss
  for customers and the bank. Every point of recall matters.

- **FNR (False Negative Rate = 1 - Recall):** The most dangerous failure mode —
  fraud that slips through undetected. Lower is always better.

- **FPR (False Positive Rate):** Legitimate transactions incorrectly blocked.
  Important for customer experience, but secondary to FNR in fraud detection.

---

## Confusion Matrix Analysis (Synthetic)

```
Logistic Regression:  TP=34, FP=425, TN=1505, FN=36
Random Forest:        TP=11, FP=6,   TN=1924, FN=59
XGBoost:              TP=24, FP=197, TN=1733, FN=46
```

**Key observations (synthetic data):**

- **Logistic Regression** catches the most fraud (34 TP, 36 FN) but flags many
  legitimate transactions as fraud (425 FP). High recall, low precision — typical
  of a high-sensitivity threshold.
- **Random Forest** is the most conservative — very few false positives (6 FP)
  but misses the majority of fraud (59 FN, FNR=0.84). Precision looks high (0.647)
  but this is misleading: it's rarely triggering at all on synthetic data.
- **XGBoost** is intermediate — moderate FP (197) and moderate TP (24).

---

## Model Selection Decision

### Selected Model: **Logistic Regression**
**Artifact:** `logistic_regression_v1.pkl`  
**Preprocessor Artifact:** `lr_preprocessor_v1.pkl`  
**Version:** v1

### Justification (Synthetic Run)

On the synthetic dataset, **Logistic Regression** achieves:
- Highest **PR-AUC (0.2292)** — best overall discrimination on the precision-recall curve
- Highest **Recall (0.4857)** — catches ~49% of fraud vs RF's 16% and XGBoost's 34%
- Lowest **FNR (0.5143)** — fewest missed frauds
- Fastest **inference (0.12 ms/1000)** — 170x faster than RF (20.47 ms), excellent for production

The tradeoff is a high **FPR (0.2202)** — 22% of legitimate transactions are flagged.
In production, this would be tuned via threshold adjustment (lowering the decision
threshold trades recall for precision). For this project, catching fraud (recall)
takes priority over false alarm rate.

### Why NOT Random Forest for this synthetic run

Random Forest has the best ROC-AUC (0.717) and precision (0.647), but its
**Recall is only 0.157** — it catches just 11 of 70 fraud cases (FNR=0.843).
In a production fraud detection system, an 84% miss rate is catastrophic regardless
of precision. RF is also the slowest (20.47 ms/1k) — ~170x slower than LR.

### Why NOT XGBoost for this synthetic run

XGBoost has the weakest PR-AUC (0.178) and the second-highest FNR (0.657).
It is middle-ground in recall but doesn't outperform LR on any priority metric
on this synthetic run. XGBoost would likely perform better on the real dataset
with its richer feature space (V1–V339 columns).

### Expected Behaviour on Real Kaggle Data

> These results WILL differ significantly with real IEEE-CIS data:
> - XGBoost typically dominates tabular fraud benchmarks due to its ability
>   to learn complex non-linear patterns in the 400+ anonymized Vesta features.
> - Random Forest often outperforms LR on real data with proper hyperparameter tuning.
> - LR provides a useful linear baseline but rarely achieves top PR-AUC on
>   high-dimensional financial fraud data.
>
> **Recommendation for real data:** retrain all three, compare actual metrics,
> and expect XGBoost to be the likely Step 13 candidate.

---

## Step 13 Integration

The chosen artifact for Step 13 (wiring into `fraud-detection-service`):

```
Model file:         ml/artifacts/logistic_regression_v1.pkl
Preprocessor file:  ml/artifacts/lr_preprocessor_v1.pkl
Input preprocessing: LogisticRegressionPreprocessor (ml/training/lr_preprocessing.py)
Prediction method:  model.predict_proba(X_lr)[:, 1]  → fraud probability score [0.0, 1.0]
Decision threshold: 0.5 (default; adjust in production for recall/precision tradeoff)
```

---

## Future Enhancements (Out of Scope for This Project)

1. **Hyperparameter tuning:** Grid search / random search / Optuna for all three models.
   Deferred intentionally — reasonable defaults used; tuning is a possible viva extension.
2. **SMOTE/oversampling:** `imbalanced-learn` is in `requirements.txt` for this purpose.
   Must be applied **inside CV folds** to prevent leakage. Deferred as added complexity
   vs. the class-weighting approaches used here.
3. **Threshold optimization:** Tune the fraud probability threshold (currently 0.5)
   using F-beta or business-cost objectives on a held-out test set.
4. **Feature selection:** SHAP-based feature importance to identify and remove low-signal
   V-columns, speeding up training and reducing model complexity.
5. **Cross-validation:** Replace single 80/20 split with stratified k-fold CV for
   more robust metric estimates.
