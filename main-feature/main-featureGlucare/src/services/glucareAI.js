/**
 * Glucare AI Service
 * Menghubungkan ke AI Backend di: https://itzvynn-glucare-backend.hf.space
 *
 * Semua endpoint yang tersedia:
 *
 *  GET  /
 *    Response: { message: "Glucare Backend API is running" }
 *
 *  POST /predict/clinical
 *    Request : ClinicalInput { glucose_fasting, age, waist_cm, bmi, hdl,
 *                               triglycerides, bp_systolic, bp_diastolic,
 *                               gender, map_pressure, tg_hdl_ratio }
 *    Response: { mode, prediction_raw (0/1/2), risk_level ("Normal"/"Prediabetes"/"Diabetes"),
 *                cta, predict_proba: [p_normal, p_prediabetes, p_diabetes] }
 *
 *  POST /predict/questionnaire
 *    Request : QuestionnaireInput { age_band (0-2), gender (0/1),
 *                                    bmi_category (0-2), waist_category (0-2),
 *                                    hypertension (0/1), overweight_history (0/1) }
 *    Response: { mode, risk_level ("low"/"medium"/"high"), cta }
 *
 *  POST /program/enroll
 *    Request : EnrollInput { user_id, sleep_target_hours?, walking_target_minutes?, nutrition_goal? }
 *    Response: { user_id, program_status: "enrolled", duration_days: 90,
 *                daily_targets: { sleep_target_hours, walking_target_minutes, nutrition_goal },
 *                streak_counter }
 *
 *  POST /tracking/daily
 *    Request : DailyTrackingInput { user_id, day (1-90), sleep_hours,
 *                                    walking_minutes, nutrition_score (0-100) }
 *    Response: { user_id, day, status: "saved", goal_achieved: boolean }
 *
 *  POST /tracking/glucose
 *    Request : GlucoseTrackingInput { user_id, day (1-90), glucose_value }
 *    Response: { user_id, day, glucose_value, status: "saved" }
 *
 *  POST /assessment/day30
 *    Request : Day30AssessmentInput { user_id, glucose_month1_mean, glucose_month1_std,
 *              glucose_slope_month1, baseline_glucose, steps_month1_mean,
 *              steps_consistency_m1, sleep_month1_mean, sleep_consistency_m1,
 *              carbs_month1_mean, sleep_adherence_m1, steps_adherence_m1,
 *              max_streak_m1, corr_sleep_glucose_m1, corr_steps_glucose_m1,
 *              corr_carbs_glucose_m1 }
 *    Response: { predicted_status, early_warning_risk, probability_membaik,
 *                probability_memburuk_stagnan, prediction_day, model_name, features_used }
 *
 *  POST /assessment/day90
 *    Request : Day90AssessmentInput { user_id, month1_glucose_values: number[],
 *                                      month3_glucose_values: number[] }
 *    Response: { user_id, phase: "day90", avg_month1_glucose, avg_month3_glucose,
 *                final_status ("Membaik"/"Memburuk"/"Stagnan"),
 *                reclassified_risk ("low"/"medium"/"high"),
 *                report_recommendation (null | "unduh_rapor_dan_konsultasi_dokter") }
 */

import axios from "axios";

const AI_BASE_URL = "https://itzvynn-glucare-backend.hf.space";
const BACKEND_URL = import.meta.env.VITE_API_URL;

export const aiClient = axios.create({
    baseURL: AI_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000, // 30 detik (HF Space bisa cold-start ~15 detik)
});

// Client untuk backend lokal (proxy AI)
const backendClient = axios.create({
    baseURL: BACKEND_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 60000, // 60 detik (backend -> HF bisa lebih lama)
});

// ── GET / — Health check API ───────────────────────────────────
export async function checkAPIHealth() {
    const response = await aiClient.get("/");
    return response.data; // { message: "Glucare Backend API is running" }
}

// ── POST /api/ai/predict/clinical — Prediksi klinis via backend ─
export async function predictClinical(params) {
    const response = await backendClient.post("/api/ai/predict/clinical", params);
    return response.data; // { mode, aiResult, clinicalParams, timestamp }
}

// ── POST /api/kuesioner/submit — Prediksi kuesioner via backend
export async function predictQuestionnaire(params) {
    const response = await backendClient.post("/api/kuesioner/submit", params);
    return response.data; // { mode, risk_level, cta, assessment_id }
}

// ── POST /api/plan/enroll — Daftar program 90 hari ─────────────
export async function enrollProgram(params) {
    const response = await backendClient.post("/api/plan/enroll", params);
    return response.data;
}

// ── POST /api/plan/daily — Tracking harian ────────────────────
export async function submitDailyTracking(params) {
    const response = await backendClient.post("/api/plan/daily", params);
    return response.data;
}

// ── POST /api/plan/glucose — Tracking gula darah ──────────────
export async function submitGlucoseTracking(params) {
    const response = await backendClient.post("/api/plan/glucose", params);
    return response.data;
}

// ── POST /api/plan/assessment30 — Evaluasi 30 hari ─────────────────
export async function assessmentDay30(params) {
    const response = await backendClient.post("/api/plan/assessment30", params);
    return response.data;
}

// ── POST /api/plan/assessment90 — Evaluasi akhir 90 hari ───────────
export async function assessmentDay90(params) {
    const response = await backendClient.post("/api/plan/assessment90", params);
    return response.data;
}
