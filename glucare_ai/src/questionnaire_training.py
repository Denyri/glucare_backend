"""
questionnaire_training.py
Sprint 3B: GluCare Questionnaire ML Model Training
Model: XGBoost / RandomForest Classifier
Dataset: nhanes_questionnaire_clean.csv (687 sampel, 12 fitur)
"""

import json
import warnings
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

BASE_DIR  = Path(__file__).resolve().parent.parent
PROC_DIR  = BASE_DIR / 'data' / 'processed'
MODEL_DIR = BASE_DIR / 'models'


def load_dataset():
    """Load dataset yang sudah diproses oleh Sprint 3A."""
    csv_path = PROC_DIR / 'nhanes_questionnaire_clean.csv'
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {csv_path}\nJalankan questionnaire_preprocessing.py terlebih dahulu.")

    df = pd.read_csv(csv_path)
    print(f"[OK] Loaded: {csv_path.name} — {len(df):,} rows")

    with open(PROC_DIR / 'nhanes_questionnaire_features.json') as f:
        meta = json.load(f)
    features = meta['features']

    return df, features


def train_and_evaluate():
    print("=" * 60)
    print("SPRINT 3B — QUESTIONNAIRE MODEL TRAINING")
    print("=" * 60)

    # ── Load data ────────────────────────────────────────────────
    df, features = load_dataset()

    X = df[features].fillna(0)
    y = df['target']

    print(f"\nFeatures ({len(features)}): {features}")
    print(f"Class distribution: {y.value_counts().to_dict()}")

    # ── Step 7: Stratified Train/Test Split ──────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\nTrain: {len(X_train):,} | Test: {len(X_test):,}")

    # ── Step 8: Model Candidates (3 Tree-based Ensembles) ──────
    models = {
        'Random Forest': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', RandomForestClassifier(
                n_estimators=200,
                max_depth=6,
                min_samples_leaf=5,
                random_state=42,
                class_weight='balanced'
            ))
        ]),
        'XGBoost': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', XGBClassifier(
                n_estimators=150,
                max_depth=4,
                learning_rate=0.08,
                subsample=0.8,
                colsample_bytree=0.8,
                eval_metric='logloss',
                random_state=42,
                verbosity=0
            ))
        ]),
        'LightGBM': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', LGBMClassifier(
                n_estimators=150,
                max_depth=4,
                learning_rate=0.08,
                class_weight='balanced',
                random_state=42,
                verbose=-1
            ))
        ]),
    }

    # ── Step 9: 5-Fold Cross-Validation ─────────────────────────
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n--- Cross-Validation Results (5-Fold) ---")
    best_model_name = None
    best_cv_auc     = 0.0
    results = {}

    for name, pipeline in models.items():
        cv_auc = cross_val_score(pipeline, X_train, y_train,
                                  cv=cv, scoring='roc_auc')
        cv_f1  = cross_val_score(pipeline, X_train, y_train,
                                  cv=cv, scoring='f1')
        results[name] = {
            'cv_auc_mean': float(np.mean(cv_auc)),
            'cv_auc_std' : float(np.std(cv_auc)),
            'cv_f1_mean' : float(np.mean(cv_f1)),
        }
        print(f"  {name:25s} AUC={np.mean(cv_auc):.4f}±{np.std(cv_auc):.4f} | F1={np.mean(cv_f1):.4f}")

        if np.mean(cv_auc) > best_cv_auc:
            best_cv_auc     = np.mean(cv_auc)
            best_model_name = name

    print(f"\nBest model: {best_model_name} (CV AUC={best_cv_auc:.4f})")

    # ── Step 10: Train Best Model & Evaluate on Test ─────────────
    best_pipeline = models[best_model_name]
    best_pipeline.fit(X_train, y_train)

    y_pred  = best_pipeline.predict(X_test)
    y_proba = best_pipeline.predict_proba(X_test)[:, 1]
    test_auc = roc_auc_score(y_test, y_proba)

    print("\n--- Test Set Evaluation ---")
    print(f"  Test AUC: {test_auc:.4f}")
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Prediabetes']))
    print("Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"  TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"  FN={cm[1,0]}  TP={cm[1,1]}")

    # ── Step 11: Feature Importance ──────────────────────────────
    try:
        # Coba ambil clf dari dalam pipeline
        clf_step = best_pipeline.named_steps.get('clf', None)
        if clf_step is not None and hasattr(clf_step, 'feature_importances_'):
            importances = clf_step.feature_importances_
            fi_df = pd.DataFrame({'feature': features, 'importance': importances})
            fi_df = fi_df.sort_values('importance', ascending=False)
            print("\n--- Feature Importances ---")
            for _, row in fi_df.iterrows():
                print(f"  {row['feature']:25s}: {row['importance']:.4f}")
    except Exception as e:
        print(f"[WARN] Feature importance tidak tersedia: {e}")

    # ── Step 12: Kalibrasi & Serialisasi ─────────────────────────
    print("\n--- Kalibrasi Probabilitas ---")
    calibrated = CalibratedClassifierCV(best_pipeline, cv=3, method='sigmoid')
    calibrated.fit(X_train, y_train)

    # Verifikasi kalibrasi
    y_proba_cal = calibrated.predict_proba(X_test)[:, 1]
    cal_auc = roc_auc_score(y_test, y_proba_cal)
    print(f"  Calibrated Test AUC: {cal_auc:.4f}")

    # ── Save artifact ─────────────────────────────────────────────
    artifact = {
        'pipeline'    : calibrated,
        'features'    : features,
        'model_name'  : f'GluCare Questionnaire {best_model_name}',
        'version'     : '1.0.0',
        'trained_at'  : datetime.now().isoformat(),
        'n_samples_train': int(len(X_train)),
        'cv_auc'      : float(best_cv_auc),
        'test_auc'    : float(cal_auc),
        'all_results' : results,
        'label_map'   : {0: 'Normal', 1: 'Prediabetes'},
    }

    out_path = MODEL_DIR / 'glucare_questionnaire_model.joblib'
    joblib.dump(artifact, out_path)
    print(f"\n[SAVED] Model: {out_path}")

    # ── Save metrics JSON ─────────────────────────────────────────
    metrics = {
        'model_name'     : best_model_name,
        'cv_auc'         : float(best_cv_auc),
        'test_auc'       : float(cal_auc),
        'n_train'        : int(len(X_train)),
        'n_test'         : int(len(X_test)),
        'features'       : features,
        'n_features'     : len(features),
        'trained_at'     : datetime.now().isoformat(),
        'all_cv_results' : results,
    }
    metrics_path = MODEL_DIR / 'questionnaire_model_metrics.json'
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"[SAVED] Metrics: {metrics_path}")

    print("\n" + "=" * 60)
    print("SPRINT 3B SELESAI")
    print(f"  Model     : {best_model_name}")
    print(f"  CV AUC    : {best_cv_auc:.4f}")
    print(f"  Test AUC  : {cal_auc:.4f}")
    print(f"  Output    : glucare_questionnaire_model.joblib")
    print("=" * 60)

    return artifact


if __name__ == '__main__':
    train_and_evaluate()
