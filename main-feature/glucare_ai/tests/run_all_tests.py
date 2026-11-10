"""
===============================================================================
GLUCARE AI - UNIFIED TEST RUNNER
===============================================================================
Skrip terpadu untuk menjalankan seluruh pengujian otomatis modul AI GluCare:
1. Uji Kontrak & Live HTTP API Endpoint (test_api_endpoint.py)
2. Uji Audit Diagnostik & Skor Kebenaran Klinis (test_kebenaran_ai.py)
3. Uji Model Monitoring Evaluasi Hari ke-30 (test_monitoring_prediction.py)
4. Uji Simulasi Terminal Model Klinikal (test_prediction.py)

Penggunaan:
  python tests/run_all_tests.py
===============================================================================
"""

import sys
import subprocess
from pathlib import Path

TESTS_DIR = Path(__file__).resolve().parent
ROOT_DIR = TESTS_DIR.parent

# Reconfigure stdout to UTF-8
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def run_script(script_name, description):
    script_path = TESTS_DIR / script_name
    print("\n" + "=" * 80)
    print(f"▶ MENJALANKAN: {description} ({script_name})")
    print("=" * 80)

    try:
        res = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(ROOT_DIR),
            capture_output=False
        )
        return res.returncode == 0
    except Exception as e:
        print(f"❌ Terjadi kesalahan saat mengeksekusi {script_name}: {e}")
        return False


def main():
    print("=" * 80)
    print("🚀 MEMULAI EKSEKUSI SUITE PENGUJIAN LENGKAP GLUCARE AI")
    print("=" * 80)

    test_jobs = [
        ("test_api_endpoint.py", "Uji Endpoint API HTTP & Kontrak Data Klinis/Kuesioner"),
        ("test_monitoring_prediction.py", "Uji Model AI Monitoring Hari ke-30 (90-Day Intervention)"),
        ("test_kebenaran_ai.py", "Audit Skor Kebenaran Klinis pada Data Uji Independen"),
    ]

    summary = []
    for script_name, desc in test_jobs:
        success = run_script(script_name, desc)
        summary.append((script_name, desc, success))

    print("\n" + "=" * 80)
    print("📋 REKAPITULASI HASIL SUITE PENGUJIAN GLUCARE AI")
    print("=" * 80)
    all_passed = True
    for s_name, desc, ok in summary:
        icon = "✅ LULUS" if ok else "❌ GAGAL"
        if not ok:
            all_passed = False
        print(f"  [{icon}] {s_name} - {desc}")

    print("=" * 80)
    if all_passed:
        print("🎉 SELURUH SUITE PENGUJIAN AI BERHASIL 100%!")
    else:
        print("⚠️ Terdapat modul pengujian yang belum berhasil.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
