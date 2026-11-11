"""
Data Preprocessing Pipeline for GluCare Clinical Model
Using NHANES 2021-2023 Raw Datasets (DEMO, BMX, BPXO, GLU, HDL, TRIGLY, GHB, FASTQX)
Includes Step 6 Ground Truth Labeling for Prediabetes Detection.
"""

import os
from pathlib import Path
import numpy as np
import pandas as pd


def load_raw_nhanes_data(raw_dir: Path) -> dict:
    """
    Load all required raw SAS XPT files from NHANES 2021-2023 directory.
    """
    files = {
        "demo": "DEMO_L.XPT",
        "bmx": "BMX_L.XPT",
        "bp": "BPXO_L.XPT",
        "glu": "GLU_L.XPT",
        "hdl": "HDL_L.XPT",
        "trigly": "TRIGLY_L.XPT",
        "ghb": "GHB_L.XPT",
        "fastqx": "FASTQX_L.XPT",
    }

    raw_dfs = {}
    print(f"Loading raw NHANES XPT files from: {raw_dir}")
    for key, filename in files.items():
        file_path = raw_dir / filename
        if not file_path.exists():
            raise FileNotFoundError(f"Required NHANES file not found: {file_path}")
        df = pd.read_sas(file_path, format="xport")
        raw_dfs[key] = df
        print(f"  - Loaded {filename}: {len(df):,} rows, {len(df.columns)} columns")

    return raw_dfs


def merge_nhanes_tables(raw_dfs: dict) -> pd.DataFrame:
    """
    Select necessary variables and merge on SEQN (inner join).
    """
    # 1. Demographics
    demo = raw_dfs["demo"][["SEQN", "RIDAGEYR", "RIAGENDR", "RIDEXPRG"]].copy()

    # 2. Body Measures
    bmx = raw_dfs["bmx"][["SEQN", "BMXWT", "BMXHT", "BMXBMI", "BMXWAIST"]].copy()

    # 3. Blood Pressure
    bp = raw_dfs["bp"][[
        "SEQN",
        "BPXOSY1", "BPXOSY2", "BPXOSY3",
        "BPXODI1", "BPXODI2", "BPXODI3"
    ]].copy()

    # 4. Fasting Glucose
    glu = raw_dfs["glu"][["SEQN", "LBXGLU"]].copy()

    # 5. HDL Cholesterol
    hdl = raw_dfs["hdl"][["SEQN", "LBDHDD"]].copy()

    # 6. Triglycerides
    trigly = raw_dfs["trigly"][["SEQN", "LBXTLG"]].copy()

    # 7. Glycohemoglobin (HbA1c)
    ghb = raw_dfs["ghb"][["SEQN", "LBXGH"]].copy()

    # 8. Fasting Questionnaire
    fastqx = raw_dfs["fastqx"][["SEQN", "PHAFSTHR"]].copy()

    # Sequential inner join on SEQN
    merged_df = demo
    for part in [bmx, bp, glu, hdl, trigly, ghb, fastqx]:
        merged_df = pd.merge(merged_df, part, on="SEQN", how="inner")

    print(f"\nSuccessfully merged tables on SEQN. Total records: {len(merged_df):,}")
    return merged_df


def engineer_clinical_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer clinical features required by GluCare Clinical Model:
    - Average systolic and diastolic blood pressure
    - Mean Arterial Pressure (MAP)
    - Triglyceride / HDL ratio
    - BMI calculation fallback if missing
    - Step 6 Clinical Ground Truth Labeling:
      * 1 = Prediabetes (FPG 100-125 OR HbA1c 5.7%-6.4%)
      * 0 = Bukan Prediabetes (Normal: FPG < 100 AND HbA1c < 5.7%)
      * UNKNOWN = Data tidak cukup
    - Multi-class ADA diabetes status & numerical target (0=Normal, 1=Prediabetes, 2=Diabetes)
    """
    df = df.copy()

    # Calculate average blood pressures from up to 3 readings
    df["bp_systolic"] = df[["BPXOSY1", "BPXOSY2", "BPXOSY3"]].mean(axis=1)
    df["bp_diastolic"] = df[["BPXODI1", "BPXODI2", "BPXODI3"]].mean(axis=1)

    # Rename base variables to GluCare standard naming
    df["seqn"] = df["SEQN"].astype(int)
    df["age"] = df["RIDAGEYR"].astype(int)
    df["gender"] = df["RIAGENDR"].astype(int)  # 1 = Male, 2 = Female
    df["weight"] = df["BMXWT"].astype(float)
    df["height"] = df["BMXHT"].astype(float)
    df["waist_cm"] = df["BMXWAIST"].astype(float)
    df["glucose_fasting"] = df["LBXGLU"].astype(float)
    df["hdl"] = df["LBDHDD"].astype(float)
    df["triglycerides"] = df["LBXTLG"].astype(float)
    df["hba1c"] = df["LBXGH"].astype(float)
    df["fasting_hours"] = df["PHAFSTHR"].astype(float)

    # BMI calculation / fallback
    calculated_bmi = df["weight"] / ((df["height"] / 100.0) ** 2)
    df["bmi"] = df["BMXBMI"].fillna(calculated_bmi).astype(float)

    # Derived clinical metrics
    df["map_pressure"] = ((2.0 * df["bp_diastolic"] + df["bp_systolic"]) / 3.0)
    df["tg_hdl_ratio"] = (df["triglycerides"] / df["hdl"])

    # ADA Clinical Multi-Class Criteria:
    # - Diabetes: Fasting Glucose >= 126 mg/dL OR HbA1c >= 6.5%
    # - Prediabetes: Fasting Glucose 100-125 mg/dL OR HbA1c 5.7%-6.4%
    # - Normal: Fasting Glucose < 100 mg/dL AND HbA1c < 5.7%
    def classify_diabetes(row):
        fpg = row["glucose_fasting"]
        a1c = row["hba1c"]

        if pd.isna(fpg) and pd.isna(a1c):
            return "UNKNOWN", np.nan

        if (fpg >= 126.0) or (a1c >= 6.5):
            return "Diabetes", 2
        elif (fpg >= 100.0 and fpg < 126.0) or (a1c >= 5.7 and a1c < 6.5):
            return "Prediabetes", 1
        else:
            return "Normal", 0

    # Step 6 Ground Truth Binary Labeling:
    # - Label 1: Prediabetes (FPG 100-125 mg/dL OR HbA1c 5.7%-6.4%)
    # - Label 0: Bukan Prediabetes (Normal: FPG < 100 mg/dL AND HbA1c < 5.7%)
    # - UNKNOWN: Data pemeriksaan tidak cukup
    # - Diabetes: Excluded for binary prediabetes model (Opsi A) or tracked separately
    def determine_step6_label(row):
        fpg = row["glucose_fasting"]
        a1c = row["hba1c"]

        if pd.isna(fpg) and pd.isna(a1c):
            return "UNKNOWN", np.nan

        if (fpg >= 126.0) or (a1c >= 6.5):
            return "Diabetes", np.nan  # Excluded under Option A
        elif (fpg >= 100.0 and fpg < 126.0) or (a1c >= 5.7 and a1c < 6.5):
            return "Prediabetes", 1
        else:
            return "Bukan Prediabetes", 0

    classifications = df.apply(classify_diabetes, axis=1)
    df["diabetes_status"] = [c[0] for c in classifications]
    df["target"] = [c[1] for c in classifications]

    step6_labels = df.apply(determine_step6_label, axis=1)
    df["ground_truth_status"] = [s[0] for s in step6_labels]
    df["label_prediabetes"] = [s[1] for s in step6_labels]

    return df


def clean_dataset(
    df: pd.DataFrame,
    min_age: int = 20,
    max_age: int = None,
    exclude_pregnant: bool = True,
    exclude_diabetes: bool = False,
    min_fasting_hours: float = 8.0,
    max_fasting_hours: float = 24.0,
) -> pd.DataFrame:
    """
    Apply clinical data cleaning filters:
    1. Fasting compliance (>= 8h and <= 24h)
    2. Exclude pregnant individuals (RIDEXPRG == 1)
    3. Exclude diabetes individuals if building pure prediabetes detection dataset (Opsi A)
    4. Age range filter
    5. Remove duplicates on SEQN
    6. Physiological validity check
    7. Drop missing values on essential clinical features
    """
    initial_count = len(df)
    clean_df = df.copy()

    # 1. Deduplication
    clean_df = clean_df.drop_duplicates(subset=["seqn"])
    dedup_count = len(clean_df)

    # 2. Exclude pregnant women (RIDEXPRG == 1)
    if exclude_pregnant:
        clean_df = clean_df[clean_df["RIDEXPRG"] != 1.0]
    non_preg_count = len(clean_df)

    # 3. Fasting compliance check
    clean_df = clean_df[
        (clean_df["fasting_hours"] >= min_fasting_hours)
        & (clean_df["fasting_hours"] <= max_fasting_hours)
    ]
    fasting_count = len(clean_df)

    # 4. Age range filter
    if min_age is not None:
        clean_df = clean_df[clean_df["age"] >= min_age]
    if max_age is not None:
        clean_df = clean_df[clean_df["age"] <= max_age]
    age_filter_count = len(clean_df)

    # 5. Physiological validity (values must be strictly positive)
    validity_conditions = (
        (clean_df["bp_systolic"] > 0)
        & (clean_df["bp_diastolic"] > 0)
        & (clean_df["glucose_fasting"] > 0)
        & (clean_df["hba1c"] > 0)
        & (clean_df["hdl"] > 0)
        & (clean_df["triglycerides"] > 0)
        & (clean_df["bmi"] > 0)
        & (clean_df["waist_cm"] > 0)
    )
    clean_df = clean_df[validity_conditions]

    # 6. Option A: Exclude diabetes for pure prediabetes screening model
    if exclude_diabetes:
        clean_df = clean_df[clean_df["diabetes_status"] != "Diabetes"]
        print(f"  - Option A applied: Excluded pure diabetes participants.")

    # Select final columns in structured order
    feature_cols = [
        "seqn",
        "age",
        "gender",
        "weight",
        "height",
        "bmi",
        "waist_cm",
        "bp_systolic",
        "bp_diastolic",
        "map_pressure",
        "glucose_fasting",
        "hdl",
        "triglycerides",
        "tg_hdl_ratio",
        "hba1c",
        "fasting_hours",
        "ground_truth_status",
        "label_prediabetes",
        "diabetes_status",
        "target",
    ]
    clean_df = clean_df[feature_cols].dropna(subset=["glucose_fasting", "hba1c", "bmi", "waist_cm", "bp_systolic", "bp_diastolic", "hdl", "triglycerides"])

    if exclude_diabetes:
        clean_df = clean_df.dropna(subset=["label_prediabetes"])
        clean_df["label_prediabetes"] = clean_df["label_prediabetes"].astype(int)

    # Format numeric precisions
    clean_df["seqn"] = clean_df["seqn"].astype(int)
    clean_df["age"] = clean_df["age"].astype(int)
    clean_df["gender"] = clean_df["gender"].astype(int)
    clean_df["weight"] = clean_df["weight"].round(2)
    clean_df["height"] = clean_df["height"].round(2)
    clean_df["bmi"] = clean_df["bmi"].round(2)
    clean_df["waist_cm"] = clean_df["waist_cm"].round(2)
    clean_df["bp_systolic"] = clean_df["bp_systolic"].round(1)
    clean_df["bp_diastolic"] = clean_df["bp_diastolic"].round(1)
    clean_df["map_pressure"] = clean_df["map_pressure"].round(2)
    clean_df["glucose_fasting"] = clean_df["glucose_fasting"].round(1)
    clean_df["hdl"] = clean_df["hdl"].round(1)
    clean_df["triglycerides"] = clean_df["triglycerides"].round(1)
    clean_df["tg_hdl_ratio"] = clean_df["tg_hdl_ratio"].round(2)
    clean_df["hba1c"] = clean_df["hba1c"].round(2)
    clean_df["fasting_hours"] = clean_df["fasting_hours"].round(1)
    clean_df["target"] = clean_df["target"].astype(int)

    final_count = len(clean_df)

    print(f"\n[Cleaning Summary for age {min_age}-{max_age or 'all'}]:")
    print(f"  - Initial merged records: {initial_count:,}")
    print(f"  - After deduplication: {dedup_count:,}")
    print(f"  - After pregnancy exclusion: {non_preg_count:,}")
    print(f"  - After fasting compliance (8-24h): {fasting_count:,}")
    print(f"  - After age filtering: {age_filter_count:,}")
    print(f"  - Final clean records (0 nulls): {final_count:,}")

    print("\nGround Truth Distribution (Step 6):")
    gt_counts = clean_df["ground_truth_status"].value_counts()
    for status, cnt in gt_counts.items():
        pct = (cnt / final_count) * 100
        print(f"  - {status}: {cnt:,} ({pct:.1f}%)")

    return clean_df.reset_index(drop=True)


def run_pipeline():
    """
    Main orchestration function to run the data preprocessing pipeline
    and export structured datasets.
    """
    script_dir = Path(__file__).resolve().parent
    base_dir = script_dir.parent
    raw_dir = base_dir / "data" / "raw" / "nhanes_2021_2023"
    processed_dir = base_dir / "data" / "processed"

    processed_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("STARTING GLUCARE NHANES CLINICAL DATA PIPELINE (STEP 6 UPDATED)")
    print("=" * 60)

    # 1. Load raw data
    raw_dfs = load_raw_nhanes_data(raw_dir)

    # 2. Merge tables
    merged_df = merge_nhanes_tables(raw_dfs)

    # 3. Engineer clinical features & Step 6 Ground Truth
    engineered_df = engineer_clinical_features(merged_df)

    # 4. Generate Target Dataset: Age 20-40 (Option A: Pure Prediabetes Classification)
    print("\n" + "=" * 60)
    print("GENERATING GLUCARE TARGET DATASET (AGE 20-40, OPTION A)")
    print("=" * 60)
    target_20_40_df = clean_dataset(
        engineered_df,
        min_age=20,
        max_age=40,
        exclude_pregnant=True,
        exclude_diabetes=True, # Option A: exclude pure diabetes cases
        min_fasting_hours=8.0,
    )
    target_path = processed_dir / "nhanes_glucare_target_20_40.csv"
    target_20_40_df.to_csv(target_path, index=False)
    print(f"Saved to: {target_path}")

    # 5. Generate Full Cleaned Adult Dataset: Age >= 20 (Comprehensive Training Set)
    print("\n" + "=" * 60)
    print("GENERATING COMPREHENSIVE ADULT DATASET (AGE >= 20)")
    print("=" * 60)
    adult_df = clean_dataset(
        engineered_df,
        min_age=20,
        max_age=None,
        exclude_pregnant=True,
        exclude_diabetes=False, # Keep all for adult reference
        min_fasting_hours=8.0,
    )
    adult_path = processed_dir / "nhanes_glucare_cleaned_adult.csv"
    adult_df.to_csv(adult_path, index=False)
    print(f"Saved to: {adult_path}")

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
