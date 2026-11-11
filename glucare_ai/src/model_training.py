"""
Machine Learning Modeling Pipeline for GluCare Prediabetes Detection (Steps 9-13)
Dataset: nhanes_glucare_target_20_40.csv (653 samples, Age 20-40)
Models (3 Evaluated Tree-Based Ensembles): Random Forest, XGBoost, LightGBM
Includes Stratified Split, 5-Fold CV, Metric Evaluation, and Model Export.
"""

from pathlib import Path
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score,
    recall_score,
    precision_score,
    f1_score,
)


def load_data(csv_path: Path):
    """Load target prediabetes dataset and extract X and y."""
    df = pd.read_csv(csv_path)

    # Features matching GluCare clinical assessment payload
    feature_cols = [
        "age",
        "gender",
        "weight",
        "bmi",
        "waist_cm",
        "bp_systolic",
        "bp_diastolic",
        "map_pressure",
        "glucose_fasting",
        "hdl",
        "triglycerides",
        "tg_hdl_ratio",
    ]

    X = df[feature_cols].copy()
    y = df["label_prediabetes"].astype(int).copy()

    return X, y, feature_cols


def evaluate_models(X_train, y_train, cv_folds=5):
    """
    Perform 5-Fold Stratified Cross-Validation across 3 candidate ensemble models:
    1. Random Forest
    2. XGBoost
    3. LightGBM
    """
    skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)

    candidate_models = {
        "Random Forest": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42, max_depth=6)),
        ]),
        "XGBoost": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", XGBClassifier(
                n_estimators=100,
                learning_rate=0.08,
                max_depth=4,
                scale_pos_weight=1,
                random_state=42,
                eval_metric="logloss",
                verbosity=0,
            )),
        ]),
        "LightGBM": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LGBMClassifier(
                n_estimators=100,
                learning_rate=0.08,
                max_depth=4,
                class_weight="balanced",
                random_state=42,
                verbose=-1,
            )),
        ]),
    }

    scoring = {
        "accuracy": "accuracy",
        "recall": "recall",
        "precision": "precision",
        "f1": "f1",
        "roc_auc": "roc_auc",
    }

    results = {}
    print("\n" + "=" * 70)
    print(f"STEP 11: {cv_folds}-FOLD STRATIFIED CROSS-VALIDATION RESULTS")
    print("=" * 70)

    for name, pipe in candidate_models.items():
        cv_res = cross_validate(pipe, X_train, y_train, cv=skf, scoring=scoring, n_jobs=-1)
        results[name] = {
            "mean_accuracy": float(np.mean(cv_res["test_accuracy"])),
            "mean_recall": float(np.mean(cv_res["test_recall"])),
            "mean_precision": float(np.mean(cv_res["test_precision"])),
            "mean_f1": float(np.mean(cv_res["test_f1"])),
            "mean_roc_auc": float(np.mean(cv_res["test_roc_auc"])),
        }
        print(f"\nModel: {name}")
        print(f"  - Accuracy:  {results[name]['mean_accuracy']:.4f}")
        print(f"  - Recall:    {results[name]['mean_recall']:.4f} (Sensitivitas Prediabetes)")
        print(f"  - Precision: {results[name]['mean_precision']:.4f}")
        print(f"  - F1-Score:  {results[name]['mean_f1']:.4f}")
        print(f"  - ROC-AUC:   {results[name]['mean_roc_auc']:.4f}")

    return candidate_models, results


def train_and_test_best_model(candidate_models, cv_results, X_train, y_train, X_test, y_test, feature_cols, models_dir: Path):
    """
    Select best model by mean CV ROC-AUC on the training set, train final models on
    entire training set, evaluate on held-out test set (Step 11), extract feature
    importances (Step 12), and export best pipeline (Step 13).
    The test set is only used for reporting, never for model selection.
    """
    models_dir.mkdir(parents=True, exist_ok=True)

    # Model selection uses training-set cross-validation only
    best_name = max(cv_results, key=lambda name: cv_results[name]["mean_roc_auc"])
    best_cv_auc = cv_results[best_name]["mean_roc_auc"]

    print("\n" + "=" * 70)
    print(f"SELECTED BEST MODEL (CV ROC-AUC): {best_name} (CV ROC-AUC = {best_cv_auc:.4f})")
    print("=" * 70)

    print("\n" + "=" * 70)
    print("STEP 11: HELD-OUT TEST SET EVALUATION (20% SAMPLES)")
    print("=" * 70)

    test_eval = {}

    for name, pipe in candidate_models.items():
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        probs = pipe.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, preds)
        rec = recall_score(y_test, preds)
        prec = precision_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)

        test_eval[name] = {
            "accuracy": float(acc),
            "recall": float(rec),
            "precision": float(prec),
            "f1": float(f1),
            "roc_auc": float(auc),
            "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
        }

        print(f"\n--- {name} on Test Set ---")
        print(f"Accuracy:  {acc:.4f} | Recall: {rec:.4f} | Precision: {prec:.4f} | F1: {f1:.4f} | ROC-AUC: {auc:.4f}")
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, preds))

    best_pipeline = candidate_models[best_name]
    print("\n" + "=" * 70)
    print(f"FINAL TEST PERFORMANCE: {best_name} (F1 = {test_eval[best_name]['f1']:.4f} | ROC-AUC = {test_eval[best_name]['roc_auc']:.4f})")
    print("=" * 70)

    # Step 12: Feature Importance Analysis
    print("\n" + "-" * 70)
    print("STEP 12: FEATURE IMPORTANCE ANALYSIS")
    print("-" * 70)
    importances = None
    if hasattr(best_pipeline.named_steps["clf"], "feature_importances_"):
        importances = best_pipeline.named_steps["clf"].feature_importances_
    elif hasattr(best_pipeline.named_steps["clf"], "coef_"):
        importances = np.abs(best_pipeline.named_steps["clf"].coef_[0])

    if importances is not None:
        feat_imp = pd.DataFrame({
            "feature": feature_cols,
            "importance": importances,
        }).sort_values(by="importance", ascending=False).reset_index(drop=True)
        print(feat_imp.to_string(index=False))

    # Step 13: Export Model & Metadata
    model_export_path = models_dir / "glucare_prediabetes_model.joblib"
    joblib.dump({
        "pipeline": best_pipeline,
        "model_name": best_name,
        "features": feature_cols,
        "test_metrics": test_eval[best_name],
    }, model_export_path)
    print(f"\nSuccessfully exported model to: {model_export_path}")

    # Export metrics JSON
    metrics_path = models_dir / "model_evaluation_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(test_eval, f, indent=2)
    print(f"Successfully saved test metrics to: {metrics_path}")

    return best_name, test_eval


def run_modeling_pipeline():
    """Execute complete modeling pipeline Steps 9 to 13."""
    base_dir = Path(__file__).resolve().parent.parent
    data_path = base_dir / "data" / "processed" / "nhanes_glucare_target_20_40.csv"
    models_dir = base_dir / "models"

    print("=" * 70)
    print("STARTING GLUCARE MODELING PIPELINE (STEPS 9 - 13)")
    print("=" * 70)

    # 1. Load Data
    X, y, feature_cols = load_data(data_path)
    print(f"Features: {feature_cols}")
    print(f"Total samples: {len(X)}")

    # 2. Step 9: Stratified Train/Test Split (80:20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\nStep 9: Train/Test Split (80:20 Stratified):")
    print(f"  - Training Set: {len(X_train)} samples (Prediabetes: {sum(y_train==1)}, Bukan: {sum(y_train==0)})")
    print(f"  - Testing Set:  {len(X_test)} samples (Prediabetes: {sum(y_test==1)}, Bukan: {sum(y_test==0)})")

    # 3. Step 10 & 11: Cross Validation Benchmarking
    candidate_models, cv_results = evaluate_models(X_train, y_train, cv_folds=5)

    # 4. Step 11, 12, 13: Test Evaluation, Explainability & Export
    best_name, test_eval = train_and_test_best_model(
        candidate_models, cv_results, X_train, y_train, X_test, y_test, feature_cols, models_dir
    )

    print("\n" + "=" * 70)
    print("MODELING PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_modeling_pipeline()
