"""
Exploratory Data Analysis (EDA) Module for GluCare Clinical Model (Step 8)
Dataset: nhanes_glucare_target_20_40.csv (653 samples, Age 20-40)
Evaluates statistical separation, hypothesis testing, and multicollinearity between:
Label 0 (Bukan Prediabetes) vs Label 1 (Prediabetes).
"""

from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats


def load_target_data(csv_path: Path) -> pd.DataFrame:
    """Load the frozen target prediabetes dataset."""
    if not csv_path.exists():
        raise FileNotFoundError(f"Target dataset not found: {csv_path}")
    df = pd.read_csv(csv_path)
    return df


def perform_statistical_comparison(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compare clinical feature distributions between Label 0 and Label 1.
    Computes Mean, Std, Median, IQR, and Mann-Whitney U test (p-value).
    """
    features = [
        "glucose_fasting",
        "bmi",
        "waist_cm",
        "hdl",
        "triglycerides",
        "tg_hdl_ratio",
        "bp_systolic",
        "bp_diastolic",
        "map_pressure",
        "age",
        "weight",
        "height",
    ]

    normal_df = df[df["label_prediabetes"] == 0]
    prediab_df = df[df["label_prediabetes"] == 1]

    records = []
    for feat in features:
        val_norm = normal_df[feat].dropna()
        val_pred = prediab_df[feat].dropna()

        # Mann-Whitney U test (robust to non-normality)
        stat, p_val = stats.mannwhitneyu(val_pred, val_norm, alternative="two-sided")

        # Cohen's d (effect size)
        pooled_std = np.sqrt(
            ((len(val_norm) - 1) * np.var(val_norm, ddof=1) + (len(val_pred) - 1) * np.var(val_pred, ddof=1))
            / (len(val_norm) + len(val_pred) - 2)
        )
        cohen_d = (np.mean(val_pred) - np.mean(val_norm)) / (pooled_std if pooled_std > 0 else 1.0)

        records.append({
            "feature": feat,
            "mean_bukan_prediabetes": round(float(np.mean(val_norm)), 2),
            "mean_prediabetes": round(float(np.mean(val_pred)), 2),
            "median_bukan_prediabetes": round(float(np.median(val_norm)), 2),
            "median_prediabetes": round(float(np.median(val_pred)), 2),
            "std_bukan_prediabetes": round(float(np.std(val_norm, ddof=1)), 2),
            "std_prediabetes": round(float(np.std(val_pred, ddof=1)), 2),
            "difference_mean": round(float(np.mean(val_pred) - np.mean(val_norm)), 2),
            "cohens_d": round(float(cohen_d), 3),
            "p_value": float(p_val),
            "significant_005": bool(p_val < 0.05),
        })

    comp_df = pd.DataFrame(records)
    # Sort by absolute effect size
    comp_df["abs_effect"] = comp_df["cohens_d"].abs()
    comp_df = comp_df.sort_values(by="abs_effect", ascending=False).drop(columns=["abs_effect"]).reset_index(drop=True)
    return comp_df


def compute_correlations(df: pd.DataFrame) -> pd.DataFrame:
    """Compute Pearson and Spearman correlation with label_prediabetes."""
    features = [
        "glucose_fasting",
        "bmi",
        "waist_cm",
        "hdl",
        "triglycerides",
        "tg_hdl_ratio",
        "bp_systolic",
        "bp_diastolic",
        "map_pressure",
        "age",
        "weight",
        "height",
    ]

    corr_records = []
    for feat in features:
        p_r, p_p = stats.pearsonr(df[feat], df["label_prediabetes"])
        s_r, s_p = stats.spearmanr(df[feat], df["label_prediabetes"])
        corr_records.append({
            "feature": feat,
            "pearson_r": round(float(p_r), 3),
            "spearman_rho": round(float(s_r), 3),
            "p_value": float(p_p),
        })

    corr_df = pd.DataFrame(corr_records).sort_values(by="pearson_r", ascending=False).reset_index(drop=True)
    return corr_df


def run_eda():
    """Run full EDA analysis and print report."""
    base_dir = Path(__file__).resolve().parent.parent
    data_path = base_dir / "data" / "processed" / "nhanes_glucare_target_20_40.csv"

    print("=" * 70)
    print("STEP 8: EXPLORATORY DATA ANALYSIS & CLINICAL FEATURE ANALYSIS")
    print("=" * 70)

    df = load_target_data(data_path)
    print(f"Loaded dataset: {data_path}")
    print(f"Total samples: {len(df):,}")
    print(f"Class distribution:")
    for label, count in df["label_prediabetes"].value_counts().items():
        name = "Prediabetes (1)" if label == 1 else "Bukan Prediabetes (0)"
        pct = (count / len(df)) * 100
        print(f"  - {name}: {count:,} ({pct:.1f}%)")

    # 1. Statistical Comparison
    print("\n" + "-" * 70)
    print("1. STATISTICAL COMPARISON (LABEL 0 vs LABEL 1)")
    print("-" * 70)
    comp_df = perform_statistical_comparison(df)
    for _, row in comp_df.iterrows():
        sig = "*** (p < 0.001)" if row["p_value"] < 0.001 else ("* (p < 0.05)" if row["p_value"] < 0.05 else "ns (p >= 0.05)")
        print(f"{row['feature']:<18} | Bukan: {row['mean_bukan_prediabetes']:>6.2f} | Prediab: {row['mean_prediabetes']:>6.2f} | Diff: {row['difference_mean']:>6.2f} | Cohen d: {row['cohens_d']:>6.3f} | {sig}")

    # 2. Correlation with Target
    print("\n" + "-" * 70)
    print("2. CORRELATION WITH PREDIABETES (LABEL)")
    print("-" * 70)
    corr_df = compute_correlations(df)
    for _, row in corr_df.iterrows():
        print(f"{row['feature']:<18} | Pearson r: {row['pearson_r']:>6.3f} | Spearman rho: {row['spearman_rho']:>6.3f}")

    print("\n" + "=" * 70)
    print("EDA COMPLETED SUCCESSFULLY!")
    print("=" * 70)

    return comp_df, corr_df


if __name__ == "__main__":
    run_eda()
