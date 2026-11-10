import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import ClinicalBadge from "../components/ui/ClinicalBadge";
import { useAuth } from "../context/AuthContext";
import {
    Activity,
    AlertTriangle,
    Compass,
    ChevronRight,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    RefreshCw,
    HeartPulse
} from "lucide-react";

const HasilAnalisis = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen } = useSidebar();
    const { user } = useAuth();

    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [activeMode, setActiveMode] = useState(() => {
        return location.state?.mode || new URLSearchParams(window.location.search).get("mode") || null;
    });
    const [availableModes, setAvailableModes] = useState({ clinical: false, questionnaire: false });

    const [data, setData] = useState({
        score: 0,
        risk: "Memuat...",
        status: "Sedang memproses...",
        faktor: ["Menunggu data dari AI..."],
        parameters: [],
        cta: "",
        riskLevel: "Diabetes",
        mode: "clinical",
        aiRecommendation: null,
        top3Priorities: [],
        safetyAlert: null,
    });

    const renderAiPayload = useCallback((parsed) => {
        if (!parsed) return;
        setHasData(true);
        const aiRes = parsed.aiResult || parsed.data?.aiResult || parsed;
        const analysisMode = parsed.mode || parsed.data?.mode || (parsed.clinicalParams ? "clinical" : "questionnaire");

        if (analysisMode === "questionnaire") {
            const input = parsed.answers || parsed.questionnaireParams || parsed.data?.answers || {};
            const aiRiskLevel = aiRes.risk_level || "low";
            let risk = "Risiko Rendah";
            let status = "Normal / Optimal";
            let score = 25;

            if (aiRiskLevel === "medium" || aiRiskLevel === "Prediabetes") {
                risk = "Risiko Sedang";
                status = "Indikasi Prediabetes";
                score = 55;
            } else if (aiRiskLevel === "high" || aiRiskLevel === "Diabetes") {
                risk = "Risiko Tinggi";
                status = "Indikasi Diabetes";
                score = 85;
            }

            if (aiRes.score !== undefined && aiRes.score !== null) {
                score = aiRes.score;
            } else if (parsed.ui_data?.score !== undefined) {
                score = parsed.ui_data.score;
            }

            const faktorList = [];
            const rawFaktor = parsed.ui_data?.faktorRisiko || parsed.data?.ui_data?.faktorRisiko;
            if (Array.isArray(rawFaktor) && rawFaktor.length > 0) {
                rawFaktor.forEach((f) => {
                    if (typeof f === "string") faktorList.push(f);
                    else if (f && f.text) faktorList.push(f.text);
                    else if (f && f.faktor) faktorList.push(f.faktor);
                });
            } else {
                if (input.bmi_category === 1 || input.bmi === "overweight") faktorList.push("BMI dalam kategori Overweight (Kelebihan Berat Badan)");
                if (input.bmi_category === 2 || input.bmi === "obesity" || input.bmi === "obesitas") faktorList.push("BMI dalam kategori Obesitas (Resistensi Insulin Tinggi)");
                if (input.waist_category === 1 || input.lingkar_pinggang === "besar" || input.lingkar_pinggang === "berisiko") faktorList.push("Ukuran lingkar pinggang di atas batas aman metabolik");
                if (input.hypertension === 1 || input.hipertensi === "ya") faktorList.push("Riwayat tekanan darah tinggi / hipertensi");
                if (input.diabetes_history === 1 || input.prediabetes_told === 1 || input.prediabetes_history === 1 || input.riwayat_keluarga === "ya") faktorList.push("Riwayat prediabetes / keluarga dengan gangguan metabolik");
                if (input.physically_active === 0 || input.olahraga === "kurang") faktorList.push("Aktivitas fisik harian di bawah target WHO (<150 menit/minggu)");
                if (input.sedentary_hours >= 8 || input.duduk === "lama") faktorList.push(`Waktu duduk / inaktif tinggi (${input.sedentary_hours || 8} jam/hari)`);
                if (input.current_smoker === 1 || input.merokok === "ya") faktorList.push("Perokok aktif (memicu inflamasi & stres metabolik)");
                if (input.poor_diet === 1 || input.pola_makan === "buruk") faktorList.push("Pola makan sering olahan / tinggi gula & cepat saji");
                if (input.overweight_history === 1 && input.bmi_category === 0) faktorList.push("Pernah memiliki riwayat kelebihan berat badan signifikan");
            }

            if (faktorList.length === 0) {
                faktorList.push("Gaya hidup relatif sehat dan tidak ada faktor risiko dominan dari kuesioner.");
            }

            // Parameter kuesioner untuk KPI summary
            const questParams = [];
            if (input.bmi_category !== undefined) {
                const bmiLabels = ["Normal (<23)", "Overweight (23-27.4)", "Obesitas (≥27.5)"];
                questParams.push({ label: "Kategori BMI", value: bmiLabels[input.bmi_category] || "Normal" });
            }
            if (input.waist_category !== undefined) {
                questParams.push({ label: "Lingkar Pinggang", value: input.waist_category === 1 ? "Berisiko" : "Normal" });
            }
            if (input.hypertension !== undefined) {
                questParams.push({ label: "Tekanan Darah", value: input.hypertension === 1 ? "Riwayat Hipertensi" : "Normal" });
            }
            if (input.diabetes_history !== undefined || input.prediabetes_history !== undefined) {
                const hasHist = (input.diabetes_history === 1 || input.prediabetes_told === 1 || input.prediabetes_history === 1);
                questParams.push({ label: "Riwayat Glukosa", value: hasHist ? "Ada Riwayat" : "Tidak Ada" });
            }
            if (input.physically_active !== undefined) {
                questParams.push({ label: "Aktivitas Fisik", value: input.physically_active === 1 ? "Memenuhi Target WHO" : "Kurang Aktif" });
            }
            if (input.sedentary_hours !== undefined) {
                questParams.push({ label: "Durasi Duduk", value: `${input.sedentary_hours} Jam / Hari` });
            }

            const targetRisk = (aiRiskLevel === "low" || aiRiskLevel === "Normal") ? "Normal" :
                ((aiRiskLevel === "medium" || aiRiskLevel === "Prediabetes") ? "Prediabetes" : "Diabetes");

            const aiRec = parsed.ai_recommendation || parsed.ui_data?.ai_recommendation || {
                sleep_target_hours: targetRisk === "Diabetes" ? 8.0 : 7.5,
                walking_target_minutes: targetRisk === "Diabetes" ? 45 : (targetRisk === "Prediabetes" ? 40 : 30),
                nutrition_goal: targetRisk === "Diabetes"
                    ? "Defisit Kalori Terpantau, Batasi Karbohidrat Sederhana, Serat >= 35g/hari"
                    : (targetRisk === "Prediabetes"
                        ? "Defisit Kalori Ringan, Makanan Indeks Glikemik Rendah, Serat >= 30g/hari"
                        : "Pola Makan Gizi Seimbang & Hidrasi Optimal"),
            };

            const top3 = parsed.ui_data?.top_3_priorities || parsed.top_3_priorities || parsed.data?.top_3_priorities || [];
            const safetyAlert = parsed.ui_data?.safety_alert || parsed.safety_alert || parsed.data?.safety_alert || null;

            setData({
                score,
                risk,
                status,
                faktor: faktorList,
                parameters: questParams,
                cta: aiRes.cta || "Jaga konsistensi pola makan sehat dan aktivitas fisik teratur.",
                riskLevel: targetRisk,
                mode: "questionnaire",
                aiRecommendation: aiRec,
                top3Priorities: top3,
                safetyAlert: safetyAlert,
            });
            return;
        }

        // CLINICAL MODE
        const input = parsed.clinicalParams || parsed.data?.clinicalParams || {};
        const rawProba = aiRes.predict_proba || [0, 0, 0];
        const proba = Array.isArray(rawProba) && Array.isArray(rawProba[0]) ? rawProba[0] : (Array.isArray(rawProba) ? rawProba : [0, 0, 0]);
        const aiRiskLevel = aiRes.risk_level || (aiRes.prediction_raw === 1 ? "Prediabetes" : aiRes.prediction_raw === 2 ? "Diabetes" : "Normal");

        let risk, status;
        if (aiRiskLevel === "Normal" || aiRiskLevel === "low") {
            risk = "Risiko Rendah";
            status = "Normal / Optimal";
        } else if (aiRiskLevel === "Prediabetes" || aiRiskLevel === "medium") {
            risk = "Risiko Sedang";
            status = "Indikasi Prediabetes";
        } else {
            risk = "Risiko Tinggi";
            status = "Indikasi Diabetes";
        }

        const score = (aiRes.score !== undefined && aiRes.score !== null)
            ? aiRes.score
            : (parsed.ui_data?.score !== undefined ? parsed.ui_data.score : Math.round(((proba[1] || 0) + (proba[2] || 0)) * 100));

        const gdpVal = input.glucose_fasting || 0;

        let gdpStr = "Normal (<100)";
        if (gdpVal >= 126) gdpStr = "Diabetes (≥126)";
        else if (gdpVal >= 100) gdpStr = "Prediabetes (100–125)";

        const bmiVal = input.bmi || 0;
        let bmiStr = "Normal";
        if (bmiVal < 18.5) bmiStr = "Kurang";
        else if (bmiVal >= 27.5) bmiStr = "Obesitas";
        else if (bmiVal >= 23) bmiStr = "Overweight";

        const faktorList = [];
        const rawFaktor = parsed.ui_data?.faktorRisiko || parsed.data?.ui_data?.faktorRisiko;
        if (Array.isArray(rawFaktor) && rawFaktor.length > 0) {
            rawFaktor.forEach((f) => {
                if (typeof f === "string") faktorList.push(f);
                else if (f && f.text) faktorList.push(f.text);
                else if (f && f.faktor) faktorList.push(f.faktor);
            });
        } else {
            if (gdpVal >= 126) faktorList.push(`Gula Darah Puasa (${gdpVal} mg/dL) mengindikasikan level Diabetes.`);
            else if (gdpVal >= 100) faktorList.push(`Gula Darah Puasa (${gdpVal} mg/dL) berada di zona kritis Prediabetes.`);

            if (bmiVal >= 27.5) faktorList.push(`Kategori BMI Obesitas (${bmiVal}) meningkatkan resistensi insulin.`);
            else if (bmiVal >= 23) faktorList.push(`Kategori BMI Overweight (${bmiVal}) memicu stres metabolik.`);

            const tgHdl = input.tg_hdl_ratio || 0;
            if (tgHdl >= 3) faktorList.push(`Rasio TG/HDL tinggi (${tgHdl}) mengindikasikan kemungkinan resistensi insulin.`);

            if (input.bp_systolic >= 130 || input.bp_diastolic >= 85) {
                faktorList.push(`Tekanan darah (${input.bp_systolic}/${input.bp_diastolic} mmHg) di atas batas normal.`);
            }

            if (input.waist_cm > 90 && input.gender === 1) {
                faktorList.push(`Lingkar pinggang (${input.waist_cm} cm) berisiko tinggi untuk pria.`);
            } else if (input.waist_cm > 80 && input.gender === 0) {
                faktorList.push(`Lingkar pinggang (${input.waist_cm} cm) berisiko tinggi untuk wanita.`);
            }
        }

        if (faktorList.length === 0) {
            faktorList.push("Parameter klinis berada dalam rentang toleransi yang aman.");
        }

        const tgHdlVal = input.tg_hdl_ratio || (input.triglycerides && input.hdl ? (input.triglycerides / input.hdl).toFixed(2) : 0);

        const parameters = [
            { label: "Usia", value: `${input.age || "-"} tahun` },
            { label: "Indeks Massa Tubuh (BMI)", value: `${bmiVal} (${bmiStr})` },
            { label: "Glukosa Darah Puasa", value: `${gdpVal} mg/dL (${gdpStr})` },
            { label: "Tekanan Darah", value: `${input.bp_systolic || 0}/${input.bp_diastolic || 0} mmHg` },
            { label: "Kolesterol HDL", value: `${input.hdl || 0} mg/dL` },
            { label: "Trigliserida", value: `${input.triglycerides || 0} mg/dL` },
            { label: "Rasio TG/HDL", value: `${tgHdlVal}` },
            { label: "Lingkar Pinggang", value: `${input.waist_cm || 0} cm` },
        ];

        const targetRisk = (aiRiskLevel === "low" || aiRiskLevel === "Normal") ? "Normal" :
            ((aiRiskLevel === "medium" || aiRiskLevel === "Prediabetes") ? "Prediabetes" : "Diabetes");

        const aiRec = parsed.ai_recommendation || parsed.ui_data?.ai_recommendation || {
            sleep_target_hours: targetRisk === "Diabetes" ? 8.0 : 7.5,
            walking_target_minutes: targetRisk === "Diabetes" ? 45 : (targetRisk === "Prediabetes" ? 40 : 30),
            nutrition_goal: targetRisk === "Diabetes"
                ? "Defisit Kalori Terpantau, Batasi Karbohidrat Sederhana, Serat >= 35g/hari"
                : (targetRisk === "Prediabetes"
                    ? "Defisit Kalori Ringan, Makanan Indeks Glikemik Rendah, Serat >= 30g/hari"
                    : "Pola Makan Gizi Seimbang & Hidrasi Optimal"),
        };

        const top3 = parsed.ui_data?.top_3_priorities || parsed.top_3_priorities || parsed.data?.top_3_priorities || [];
        const safetyAlert = parsed.ui_data?.safety_alert || parsed.safety_alert || parsed.data?.safety_alert || null;

        setData({
            score,
            risk,
            status,
            faktor: faktorList,
            parameters,
            cta: aiRes.cta || "Jaga konsistensi pola makan seimbang dan aktivitas fisik.",
            riskLevel: targetRisk,
            mode: "clinical",
            aiRecommendation: aiRec,
            top3Priorities: top3,
            safetyAlert: safetyAlert,
        });
    }, []);

    const loadAiData = useCallback(async (modeToLoad = activeMode) => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        let parsed = null;

        // 1. Cek dari state navigasi jika ada & mode sesuai
        if (location.state?.result && (!modeToLoad || location.state?.mode === modeToLoad)) {
            parsed = location.state.result;
        }

        // 2. Ambil dari backend API
        if (!parsed) {
            try {
                const endpoint = modeToLoad
                    ? `/api/ai/result/${user.id}?mode=${modeToLoad}`
                    : `/api/ai/result/${user.id}`;
                const res = await api.get(endpoint);
                parsed = res.data;
            } catch (err) {
                console.log("Mengambil dari cache lokal:", err.message);
                const cacheKey = modeToLoad
                    ? `aiAnalysisResult_${modeToLoad}_${user.id}`
                    : `aiAnalysisResult_${user.id}`;
                const rawAiData = localStorage.getItem(cacheKey) || localStorage.getItem(`aiAnalysisResult_${user.id}`);
                if (rawAiData) {
                    try {
                        parsed = JSON.parse(rawAiData);
                    } catch (e) {}
                }
            }
        }

        if (parsed) {
            renderAiPayload(parsed);
        } else {
            setHasData(false);
        }
        setIsLoading(false);
    }, [user?.id, activeMode, location.state, renderAiPayload]);

    useEffect(() => {
        if (!user?.id) return;

        // Cek riwayat untuk mengetahui ketersediaan mode
        api.get(`/api/ai/history/${user.id}`)
            .then((res) => {
                const history = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                const hasClin = history.some((h) => h.mode === "clinical");
                const hasQuest = history.some((h) => h.mode === "questionnaire");
                setAvailableModes({ clinical: hasClin, questionnaire: hasQuest });
            })
            .catch(() => {});

        loadAiData();
    }, [user?.id, loadAiData]);

    const handleSwitchMode = (newMode) => {
        setActiveMode(newMode);
        loadAiData(newMode);
    };

    // 1-Click Auto Enroll Handler into 90-Day Plan
    const handleAutoEnroll = async () => {
        if (!user?.id) {
            navigate("/login");
            return;
        }
        setIsEnrolling(true);
        try {
            const sleepHours = data.aiRecommendation?.sleep_target_hours || 7.5;
            const walkMin = data.aiRecommendation?.walking_target_minutes || 40;
            const nutGoal = data.aiRecommendation?.nutrition_goal || "Defisit Kalori Ringan, Makanan Indeks Glikemik Rendah, Serat >= 30g/hari";

            await api.post("/api/plan/enroll", {
                user_id: user.id,
                sleep_target_hours: parseFloat(sleepHours),
                walking_target_minutes: parseInt(walkMin),
                nutrition_goal: nutGoal,
            });
            navigate("/beranda");
        } catch (err) {
            console.error("Gagal auto enroll:", err);
            // Tetap arahkan ke beranda jika endpoint offline
            navigate("/beranda");
        } finally {
            setIsEnrolling(false);
        }
    };

    const isNormal = data.riskLevel === "Normal";
    const isPrediabetes = data.riskLevel === "Prediabetes";

    const badgeVariant = isNormal ? "optimal" : isPrediabetes ? "warning" : "danger";
    const ringColor = isNormal ? "#10B981" : isPrediabetes ? "#F59E0B" : "#EF4444";

    // If finished loading but no analysis data found anywhere
    if (!isLoading && !hasData) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <Sidebar />
                <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                    <HeaderAnalisis
                        title="Hasil Analisis AI"
                        subtitle="Evaluasi risiko prediabetes & rekomendasi intervensi terpersonalisasi"
                    />
                    <main className="p-4 sm:p-8 max-w-lg mx-auto text-center space-y-6 pt-16">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm ring-1 ring-blue-100">
                            <HeartPulse className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Belum Ada Data Analisis
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                Anda belum memiliki riwayat skrining risiko prediabetes. Silakan pilih salah satu metode skrining (Kuesioner Gaya Hidup atau Laboratorium) untuk mendapatkan laporan lengkap.
                            </p>
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => navigate("/analisis")}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <span>Mulai Skrining AI Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => navigate("/beranda")}
                                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title={data.mode === "clinical" ? "Laporan Klinis AI (Laboratorium)" : "Laporan Kuesioner Gaya Hidup"}
                    subtitle="Evaluasi risiko prediabetes & rekomendasi intervensi terpersonalisasi"
                />

                <main className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">

                    {/* Mode Switcher Tabs */}
                    <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Mode Asesmen:</span>
                            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode("clinical")}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        data.mode === "clinical"
                                            ? "bg-white text-blue-700 shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <span>🔬</span> Mode Klinis / Lab
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode("questionnaire")}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        data.mode === "questionnaire"
                                            ? "bg-white text-purple-700 shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <span>📋</span> Mode Kuesioner
                                </button>
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-400 pr-2">
                            {data.mode === "clinical" ? "Biomarker medis NHANES CDC (Random Forest)" : "Non-invasif anamnesis gaya hidup (Logistic Regression)"}
                        </div>
                    </div>
                    
                    {/* Hero Risk Assessment Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
                        
                        {/* Top banner */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
                            <div className="space-y-2 text-center sm:text-left">
                                <div className="flex items-center gap-2">
                                    <ClinicalBadge variant={badgeVariant}>
                                        Kategori: {data.status}
                                    </ClinicalBadge>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                        {data.mode === "clinical" ? "Data Lab" : "Kuesioner"}
                                    </span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Hasil Evaluasi Risiko Metabolik
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                                    {data.mode === "clinical"
                                        ? "Model prediktif Random Forest terlatih pada dataset biomarker NHANES CDC."
                                        : "Skor risiko metabolik terkalibrasi berdasarkan anamnesis kebiasaan harian dan antropometri."}
                                </p>
                            </div>

                            {/* Radial Meter */}
                            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-100"
                                        strokeWidth="3.5"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        strokeDasharray={`${data.score}, 100`}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        stroke={ringColor}
                                        fill="none"
                                        className="transition-all duration-1000"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                                        {data.score}%
                                    </span>
                                    <div className="text-[9px] uppercase font-bold text-slate-400">Skor Risiko</div>
                                </div>
                            </div>
                        </div>

                        {/* Parameter Grid (Clinical Mode) */}
                        {data.mode === "clinical" && data.parameters.length > 0 && (
                            <div className="p-6 sm:p-8 border-b border-slate-100 space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                    <span>📊 Parameter Biometrik & Laboratorium</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {data.parameters.map((param, index) => (
                                        <div key={index} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                                            <div className="text-[11px] text-slate-500 font-medium">{param.label}</div>
                                            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">{param.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Factors (Explainable AI) */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <span>🔍 Faktor Pendorong Risiko Terdeteksi</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.faktor.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700">
                                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                            •
                                        </span>
                                        <span>{typeof item === "object" ? (item?.text || item?.faktor || JSON.stringify(item)) : item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ADA Interpretation Guide */}
                        <div className="p-6 sm:p-8 bg-blue-50/40 border-b border-slate-100 space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                                <span>📋 Interpretasi Standar Klinis ADA</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div className="bg-white p-3.5 rounded-xl border border-blue-100">
                                    <span className="font-bold text-slate-900 block mb-1">Glukosa Darah Puasa (FPG)</span>
                                    <span className="text-slate-500">&lt;100: Normal • 100–125: Prediabetes • ≥126: Diabetes</span>
                                </div>
                                <div className="bg-white p-3.5 rounded-xl border border-blue-100">
                                    <span className="font-bold text-slate-900 block mb-1">Kadar HbA1c</span>
                                    <span className="text-slate-500">&lt;5.7%: Optimal • 5.7–6.4%: Prediabetes • ≥6.5%: Diabetes</span>
                                </div>
                                <div className="bg-white p-3.5 rounded-xl border border-blue-100">
                                    <span className="font-bold text-slate-900 block mb-1">Rasio Trigliserida / HDL</span>
                                    <span className="text-slate-500">&lt;2.0: Ideal • 2.0–3.0: Batas • &gt;3.0: Resistensi Insulin</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Conclusion */}
                        <div className="p-6 sm:p-8 bg-white space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                                Kesimpulan Klinis AI
                            </h3>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                {data.cta}
                            </p>
                        </div>
                    </div>

                    {/* Safety / Healthcare Referral Alert Banner */}
                    {data.safetyAlert && (
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center gap-2.5 text-amber-900 font-extrabold text-base sm:text-lg">
                                <span className="text-2xl">⚠️</span>
                                <span>Pemberitahuan Klinis & Rekomendasi Rujukan</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono">
                                    {data.safetyAlert.urgency === 'emergency' ? 'Kedaruratan Medis' : 'Perlu Evaluasi Dokter'}
                                </span>
                            </div>
                            <p className="text-sm text-amber-950 font-medium leading-relaxed bg-white/70 p-4 rounded-2xl border border-amber-200">
                                {data.safetyAlert.message}
                            </p>
                            <div className="text-xs text-amber-900/90 flex flex-wrap items-center gap-2">
                                <span className="font-bold">Langkah Disarankan:</span>
                                <span>{data.safetyAlert.action}</span>
                            </div>
                        </div>
                    )}

                    {/* Top 3 Prioritas Intervensi Terpersonalisasi (CDSS Knowledge Base) */}
                    {data.top3Priorities && data.top3Priorities.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1.5 border border-emerald-200/60">
                                        <Compass className="w-3.5 h-3.5" />
                                        <span>Rekomendasi Knowledge Base CDSS</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                        Top 3 Fokus Utama Kebiasaan Anda
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                                        Dipilih secara algoritmik dari 21 kriteria ilmiah konsensus (ADA, WHO, CDC DPP) berdasarkan potensi perbaikan metabolisme terbesar.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {data.top3Priorities.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 space-y-3 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                                                    Prioritas #{item.rank || idx + 1}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                                    {item.rule_id}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900">
                                                {item.factor || item.factor_name || "Fokus Kebiasaan"}
                                            </h4>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                {item.recommendation || item.clinical_recommendation || item.action}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-200/60 space-y-2">
                                            <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                                    Target Awal Bertahap
                                                </span>
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    {item.target || item.initial_target || "Ikuti anjuran harian."}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-medium">
                                                <span className="font-semibold text-slate-600">Metrik Progres:</span> {item.metric || item.progress_metric || "Kepatuhan Mingguan"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 90-Day Prescription AI Card */}
                    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/20">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-semibold mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Rekomendasi Protokol Personal</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    Preskripsi Intervensi: Program 90 Hari
                                </h3>
                                <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                                    Disesuaikan dengan biomarker spesifik Anda untuk meregulasi sensitivitas insulin.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Pillar 1: Tidur */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-2">
                                <span className="text-2xl">🌙</span>
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-200">Irama Sirkadian</div>
                                <div className="text-2xl font-extrabold text-white font-mono">
                                    {data.aiRecommendation?.sleep_target_hours || 7.5} Jam <span className="text-xs font-normal text-blue-200">/ malam</span>
                                </div>
                                <p className="text-xs text-blue-100/90 leading-relaxed">
                                    Tidur berkualitas menstabilkan regulasi hormon kortisol dan glukosa pagi hari.
                                </p>
                            </div>

                            {/* Pillar 2: Aktivitas */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-2">
                                <span className="text-2xl">👟</span>
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-200">Aktivitas Fisik</div>
                                <div className="text-2xl font-extrabold text-white font-mono">
                                    {data.aiRecommendation?.walking_target_minutes || 40} Menit <span className="text-xs font-normal text-blue-200">/ hari</span>
                                </div>
                                <p className="text-xs text-blue-100/90 leading-relaxed">
                                    Meningkatkan translokasi GLUT4 pada sel otot untuk menyerap glukosa darah.
                                </p>
                            </div>

                            {/* Pillar 3: Nutrisi */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-2">
                                <span className="text-2xl">🥗</span>
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-200">Target Nutrisi</div>
                                <div className="text-sm font-bold text-white leading-snug">
                                    {data.aiRecommendation?.nutrition_goal || "Defisit Kalori Ringan, Serat >= 30g/hari"}
                                </div>
                                <p className="text-xs text-blue-100/90 leading-relaxed">
                                    Pilih karbohidrat berindeks glikemik rendah dan tingkatkan serat larut.
                                </p>
                            </div>
                        </div>

                        {/* Action Auto Enroll */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                            <div className="text-xs text-blue-100 text-center sm:text-left">
                                <strong className="text-white">1-Click Auto Enrollment:</strong> Misi harian ini akan langsung aktif di Dashboard 90 Hari Anda.
                            </div>
                            <button
                                type="button"
                                onClick={handleAutoEnroll}
                                disabled={isEnrolling}
                                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-blue-700 hover:bg-slate-50 font-bold text-sm shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-100 disabled:opacity-60 shrink-0 flex items-center justify-center gap-2"
                            >
                                <span>{isEnrolling ? "Mendaftarkan Program..." : "Mulai Program 90 Hari Sekarang"}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-6">
                        <button
                            type="button"
                            onClick={() => navigate("/beranda")}
                            className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                        >
                            Kembali ke Dashboard
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/rencana")}
                            className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                        >
                            Buka Rencana 90 Hari
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/evaluasi")}
                            className="px-5 py-2.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                            <span>📊</span>
                            <span>Laporan Evaluasi Klinis</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/analisis")}
                            className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                        >
                            Ulangi Asesmen Risiko
                        </button>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default HasilAnalisis;