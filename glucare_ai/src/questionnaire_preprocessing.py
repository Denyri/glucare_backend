"""
questionnaire_preprocessing.py
Sprint 3A: GluCare Questionnaire Dataset Preparation
Dataset: NHANES 2021-2023 Questionnaire Modules (BPQ, DIQ, PAQ, SMQ, DBQ)
Target: Binary classification - Prediabetes (1) vs Normal (0)
"""

import os
import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings('ignore')

BASE_DIR  = Path(__file__).resolve().parent.parent  # glucare_ai root
RAW_DIR   = BASE_DIR / 'data' / 'raw' / 'nhanes_2021_2023'
PROC_DIR  = BASE_DIR / 'data' / 'processed'
PROC_DIR.mkdir(parents=True, exist_ok=True)


def load_all_data(raw_dir: Path) -> dict:
    """Load semua file XPT klinikal dan kuesioner."""
    files = {
        # Klinikal (ground truth + body measures)
        'demo':   raw_dir / 'klinikal' / 'DEMO_L.XPT',
        'bmx':    raw_dir / 'klinikal' / 'BMX_L.XPT',
        'glu':    raw_dir / 'klinikal' / 'GLU_L.XPT',
        'ghb':    raw_dir / 'klinikal' / 'GHB_L.XPT',
        'fastqx': raw_dir / 'klinikal' / 'FASTQX_L.XPT',
        # Kuesioner lifestyle
        'bpq':    raw_dir / 'kuesioner' / 'BPQ_L.xpt',
        'diq':    raw_dir / 'kuesioner' / 'DIQ_L.xpt',
        'paq':    raw_dir / 'kuesioner' / 'PAQ_L.xpt',
        'smq':    raw_dir / 'kuesioner' / 'SMQ_L.xpt',
        'dbq':    raw_dir / 'kuesioner' / 'DBQ_L.xpt',
    }

    dfs = {}
    for key, path in files.items():
        if not path.exists():
            raise FileNotFoundError(f"File tidak ditemukan: {path}")
        dfs[key] = pd.read_sas(str(path), format='xport')
        print(f"  [OK] {path.name}: {len(dfs[key]):,} rows, {len(dfs[key].columns)} cols")

    return dfs


def merge_and_filter(dfs: dict) -> pd.DataFrame:
    """Merge semua tabel pada SEQN, filter usia 20-40, bukan hamil, puasa valid."""

    # Subset kolom yang diperlukan
    demo   = dfs['demo'][['SEQN', 'RIDAGEYR', 'RIAGENDR', 'RIDEXPRG']].copy()
    bmx    = dfs['bmx'][['SEQN', 'BMXBMI', 'BMXWAIST', 'BMXWT', 'BMXHT']].copy()
    glu    = dfs['glu'][['SEQN', 'LBXGLU']].copy()
    ghb    = dfs['ghb'][['SEQN', 'LBXGH']].copy()
    fastqx = dfs['fastqx'][['SEQN', 'PHAFSTHR']].copy()
    bpq    = dfs['bpq'][['SEQN', 'BPQ020']].copy()
    diq    = dfs['diq'][['SEQN', 'DIQ010', 'DIQ160']].copy()
    paq    = dfs['paq'][['SEQN', 'PAD680', 'PAD790Q', 'PAD790U', 'PAD800', 'PAD810Q', 'PAD810U', 'PAD820']].copy()
    smq    = dfs['smq'][['SEQN', 'SMQ020', 'SMQ040']].copy()
    dbq    = dfs['dbq'][['SEQN', 'DBQ940', 'DBQ935']].copy()

    # Inner join bertahap pada SEQN
    df = demo
    for part in [bmx, glu, ghb, fastqx, bpq, diq, paq, smq, dbq]:
        df = pd.merge(df, part, on='SEQN', how='inner')

    print(f"\nSetelah merge penuh: {len(df):,} rows, {len(df.columns)} kolom")

    # Filter 1: Usia 20–40 tahun
    df = df[df['RIDAGEYR'].between(20, 40)]

    # Filter 2: Bukan hamil (NaN = laki-laki, 2 = tidak hamil)
    not_pregnant = df['RIDEXPRG'].isna() | (df['RIDEXPRG'] == 2.0)
    df = df[not_pregnant]

    # Filter 3: Puasa valid 8–24 jam
    df = df[df['PHAFSTHR'].between(8, 24)]

    # Filter 4: Drop missing pada fitur kunci
    key_cols = ['LBXGLU', 'LBXGH', 'BMXBMI', 'BMXWAIST', 'BPQ020', 'DIQ010']
    df = df.dropna(subset=key_cols)

    print(f"Setelah filter (usia 20-40, tidak hamil, puasa valid): {len(df):,} rows")
    return df


def create_ground_truth(df: pd.DataFrame) -> pd.DataFrame:
    """Buat label target berdasarkan standar ADA (FPG + HbA1c)."""

    def _label(row):
        fpg   = row['LBXGLU']
        hba1c = row['LBXGH']
        if fpg >= 126 or hba1c >= 6.5:
            return 2   # Diabetes
        elif fpg >= 100 or hba1c >= 5.7:
            return 1   # Prediabetes
        else:
            return 0   # Normal

    df = df.copy()
    df['target_raw'] = df.apply(_label, axis=1)

    print("\nDistribusi label (raw):")
    print(df['target_raw'].value_counts())

    # Eksklusi diabetes (sesuai strategi Sprint 1)
    df = df[df['target_raw'] != 2].copy()
    df['target'] = df['target_raw']

    print(f"\nDataset final (tanpa Diabetes): {len(df):,} rows")
    print(f"  Normal (0)     : {(df['target']==0).sum()}")
    print(f"  Prediabetes (1): {(df['target']==1).sum()}")

    return df


def engineer_questionnaire_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Feature engineering untuk model kuesioner gaya hidup.
    Mengubah kode NHANES menjadi fitur biner/ordinal yang interpretable.
    """
    df = df.copy()

    # ── Fitur Demografis ──────────────────────────────────────────
    # age_band: 0=<30, 1=30-39
    df['age_band'] = (df['RIDAGEYR'] >= 30).astype(int)

    # gender: 1=Laki-laki, 2=Perempuan (pertahankan kode NHANES)
    df['gender'] = df['RIAGENDR'].astype(int)

    # ── Fitur Antropometri (dari BMX) ─────────────────────────────
    # bmi_category: Asia-Pasifik cutoff
    df['bmi_category'] = pd.cut(
        df['BMXBMI'],
        bins=[0, 23.0, 27.5, 999],
        labels=[0, 1, 2]
    ).astype(float).astype(int)

    # waist_category: Central obesity (IDF Asia)
    # Gender 1=Male(>90cm), 2=Female(>80cm)
    waist_threshold = df['RIAGENDR'].map({1.0: 90.0, 2.0: 80.0})
    df['waist_category'] = (df['BMXWAIST'] > waist_threshold).astype(int)

    # ── BPQ: Blood Pressure Questionnaire ─────────────────────────
    # BPQ020: 1=Yes(hipertensi), 2=No, 7/9=Refused/Don't know
    df['hypertension'] = (df['BPQ020'] == 1.0).astype(int)

    # ── DIQ: Diabetes Questionnaire ───────────────────────────────
    # DIQ010: 1=Yes, 2=No, 3=Borderline (prediabetes told by doctor)
    # Kita encode 3=borderline sebagai riwayat prediabetes
    df['diabetes_history'] = (df['DIQ010'] == 1.0).astype(int)
    df['prediabetes_told'] = (df['DIQ010'] == 3.0).astype(int)

    # DIQ160: 1=Yes pernah diberitahu prediabetes, 2=No
    df['prediabetes_history'] = df['DIQ160'].apply(
        lambda x: 1 if x == 1.0 else 0
    )

    # ── PAQ: Physical Activity Questionnaire ──────────────────────
    # PAD790Q: Frekuensi aktivitas sedang per minggu
    # PAD790U: Unit (1=per day, 2=per week, 3=per month)
    # PAD810Q: Durasi aktivitas sedang (menit per sesi)
    # Target WHO: >=150 menit/minggu aktivitas sedang

    def compute_weekly_minutes(row):
        try:
            freq  = row.get('PAD790Q', np.nan)
            unit  = row.get('PAD790U', np.nan)
            dur   = row.get('PAD810Q', np.nan)

            if pd.isna(freq) or pd.isna(dur):
                return 0.0

            # Normalkan frekuensi ke per minggu
            if unit == 1.0:       # per day
                freq_week = freq * 7
            elif unit == 2.0:     # per week
                freq_week = freq
            elif unit == 3.0:     # per month
                freq_week = freq / 4.33
            else:
                freq_week = freq  # asumsi per week

            return float(freq_week * dur)
        except Exception:
            return 0.0

    df['weekly_mod_minutes'] = df.apply(compute_weekly_minutes, axis=1)

    # similarly untuk vigorous
    def compute_vig_minutes(row):
        try:
            freq = row.get('PAD810Q', np.nan)
            dur  = row.get('PAD810U', np.nan)
            if pd.isna(freq) or pd.isna(dur):
                return 0.0
            return float(freq * dur)
        except Exception:
            return 0.0

    # physically_active: >=150 menit/minggu (WHO guideline)
    df['physically_active'] = (df['weekly_mod_minutes'] >= 150).astype(int)

    # sedentary_hours: menit → jam, cap pada 16 jam/hari (9600 menit)
    df['sedentary_minutes'] = df['PAD680'].clip(upper=900).fillna(300)
    df['sedentary_hours']   = (df['sedentary_minutes'] / 60).round(1)

    # ── SMQ: Smoking Questionnaire ────────────────────────────────
    # SMQ020: 1=Yes(pernah >=100 batang), 2=No
    # SMQ040: 1=Every day, 2=Some days, 3=Not at all (hanya jika SMQ020==1)
    def is_smoker(row):
        smq020 = row.get('SMQ020', 2.0)
        smq040 = row.get('SMQ040', np.nan)
        if smq020 == 1.0:
            if smq040 in [1.0, 2.0]:
                return 1   # perokok aktif
        return 0

    df['current_smoker'] = df.apply(is_smoker, axis=1)

    # ── DBQ: Diet Questionnaire ───────────────────────────────────
    # DBQ940: 1=Excellent/Very Good, 2=Good/Fair/Poor (dalam siklus L dikategorikan ulang)
    # DBQ935: 1=lebih sehat dari tahun lalu, 2=lebih buruk/sama
    # poor_diet: kombinasi DBQ940 buruk ATAU DBQ935 lebih buruk
    df['poor_diet'] = df.apply(
        lambda row: 1 if (
            row.get('DBQ940', 1.0) == 2.0 or  # diet tidak baik
            row.get('DBQ935', 1.0) == 2.0      # diet memburuk
        ) else 0,
        axis=1
    )

    print("\n=== Feature Engineering selesai ===")
    print("Fitur yang dihasilkan:")
    features = [
        'age_band', 'gender', 'bmi_category', 'waist_category',
        'hypertension', 'diabetes_history', 'prediabetes_told',
        'prediabetes_history', 'physically_active', 'sedentary_hours',
        'current_smoker', 'poor_diet'
    ]
    for f in features:
        print(f"  {f}: {df[f].value_counts(dropna=False).to_dict()}")

    return df, features


def save_processed_data(df: pd.DataFrame, features: list, proc_dir: Path):
    """Simpan dataset ke CSV dan feature list ke JSON."""

    final_cols = ['SEQN'] + features + ['target', 'LBXGLU', 'LBXGH', 'BMXBMI', 'BMXWAIST']
    df_out = df[final_cols].copy()
    df_out.columns = ['SEQN'] + features + ['target', 'glucose_fasting', 'hba1c', 'bmi', 'waist_cm']

    # Simpan CSV
    out_csv = proc_dir / 'nhanes_questionnaire_clean.csv'
    df_out.to_csv(out_csv, index=False)
    print(f"\n[SAVED] {out_csv} — {len(df_out):,} rows")

    # Simpan feature list
    out_json = proc_dir / 'nhanes_questionnaire_features.json'
    with open(out_json, 'w') as f:
        json.dump({
            "features": features,
            "n_features": len(features),
            "n_samples": len(df_out),
            "n_normal": int((df_out['target'] == 0).sum()),
            "n_prediabetes": int((df_out['target'] == 1).sum()),
            "target_column": "target",
            "label_map": {"0": "Normal", "1": "Prediabetes"}
        }, f, indent=2)
    print(f"[SAVED] {out_json}")

    return df_out


def run_pipeline():
    print("=" * 60)
    print("SPRINT 3A — QUESTIONNAIRE DATA PREPARATION PIPELINE")
    print("=" * 60)

    print("\nStep 1: Loading datasets...")
    dfs = load_all_data(RAW_DIR)

    print("\nStep 2: Merging & filtering...")
    df = merge_and_filter(dfs)

    print("\nStep 3: Ground truth labeling...")
    df = create_ground_truth(df)

    print("\nStep 4: Feature engineering...")
    df, features = engineer_questionnaire_features(df)

    print("\nStep 5: Saving processed data...")
    df_out = save_processed_data(df, features, PROC_DIR)

    print("\n" + "=" * 60)
    print("SPRINT 3A SELESAI")
    print(f"  Dataset    : {len(df_out):,} sampel")
    print(f"  Features   : {len(features)} fitur")
    print(f"  Normal (0) : {(df_out['target']==0).sum()}")
    print(f"  Prediabetes: {(df_out['target']==1).sum()}")
    print("=" * 60)

    return df_out, features


if __name__ == '__main__':
    run_pipeline()
