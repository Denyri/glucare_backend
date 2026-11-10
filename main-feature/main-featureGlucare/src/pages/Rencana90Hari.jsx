import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatsCard from "../components/StatsCard";
import FaseIntervensi from "../components/FaseIntevensi";
import ActivityChart from "../components/ActivityChart";
import {
    Flame,
    Zap,
    Award,
    CheckCircle2,
    Check,
    Droplets,
    Moon,
    Footprints,
    Apple,
    ArrowRight,
    ChevronRight,
    Sparkles,
    ShieldCheck,
    Activity,
    FileText,
    RotateCcw,
    X,
    HeartPulse,
    TrendingUp,
    Calendar,
    Target
} from "lucide-react";

export default function Rencana90Hari() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();

    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    // Enroll Form State
    const [enrollData, setEnrollData] = useState({
        sleep_target_hours: "7.5",
        walking_target_minutes: "35",
        nutrition_goal: "Pola Makan Indeks Glikemik Rendah & Serat Tinggi"
    });

    // Plan Data State
    const [planData, setPlanData] = useState({
        day: 1,
        xp: 0,
        level: 1,
        xpToNextLevel: 500,
        currentStreak: 0,
        bestStreak: 0,
        todayTracking: null,
        todayGlucose: null,
        achievements: [],
        targets: { sleep: 7.5, walking: 30 }
    });

    // Daily & Glucose Tracking State
    const [dailyInput, setDailyInput] = useState({
        tidur: false,
        langkah: false,
        nutrisi: false
    });
    const [glucoseInput, setGlucoseInput] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAnim, setShowAnim] = useState(false);
    const [showGlucoseSuccess, setShowGlucoseSuccess] = useState(false);
    const [xpGainedPop, setXpGainedPop] = useState(0);
    const [showAssessmentModal, setShowAssessmentModal] = useState(false);
    const [assessmentResult, setAssessmentResult] = useState(null);
    const [isCompletedToday, setIsCompletedToday] = useState(false);

    // AI Feedback Modals State
    const [aiDailyFeedback, setAiDailyFeedback] = useState(null);
    const [showDailyFeedbackModal, setShowDailyFeedbackModal] = useState(false);
    const [aiGlucoseFeedback, setAiGlucoseFeedback] = useState(null);
    const [showGlucoseFeedbackModal, setShowGlucoseFeedbackModal] = useState(false);

    const [dailyHistory, setDailyHistory] = useState([]);

    const { user: currentUser } = useAuth();

    const fetchPlanData = async () => {
        if (!currentUser?.id) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await api.get(`/api/plan/${currentUser.id}`);
            const data = res.data;

            if (res.status === 200 || res.data?.success) {
                setIsEnrolled(!!data.enrolled);
                if (data.enrolled) {
                    setPlanData({
                        day: data.day || 1,
                        xp: data.xp || 0,
                        level: data.level || 1,
                        xpToNextLevel: data.xpToNextLevel || 500,
                        currentStreak: data.currentStreak || 0,
                        bestStreak: data.bestStreak || 0,
                        todayTracking: data.todayTracking,
                        todayGlucose: data.todayGlucose,
                        achievements: data.achievements || [],
                        targets: data.targets || { sleep: 7.5, walking: 30 }
                    });
                    if (data.todayTracking) {
                        setIsCompletedToday(true);
                        setDailyInput({
                            tidur: !!data.todayTracking.sleep_hours,
                            langkah: !!data.todayTracking.walking_minutes,
                            nutrisi: !!data.todayTracking.nutrition_score
                        });
                    } else {
                        setIsCompletedToday(false);
                    }

                    // Fetch daily history for chart
                    try {
                        const historyRes = await api.get(`/api/plan/tracking/daily/${currentUser.id}`);
                        if (historyRes.status === 200) {
                            setDailyHistory(historyRes.data.data || historyRes.data || []);
                        }
                    } catch (err) {
                        console.error("Error fetching history:", err);
                    }
                }
            }
        } catch (error) {
            console.error("Gagal mengambil data plan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkAnalysis = async () => {
            if (currentUser && currentUser.id) {
                let parsed = null;
                const rawAiData = localStorage.getItem(`aiAnalysisResult_${currentUser.id}`);
                if (rawAiData) {
                    try { parsed = JSON.parse(rawAiData); } catch (e) {}
                    setHasAnalyzed(true);
                } else {
                    try {
                        const res = await api.get(`/api/ai/result/${currentUser.id}`);
                        if (res.status === 200) {
                            const data = res.data;
                            if (data && (data.data || data.aiResult)) {
                                parsed = data.data || data;
                                setHasAnalyzed(true);
                                localStorage.setItem(`aiAnalysisResult_${currentUser.id}`, JSON.stringify(parsed));
                            }
                        }
                    } catch (e) {
                        console.error("Error checking analysis from backend:", e);
                    }
                }

                if (parsed) {
                    const rec = parsed.ai_recommendation || parsed.ui_data?.ai_recommendation;
                    const lvl = parsed.aiResult?.risk_level || "Prediabetes";
                    setEnrollData(prev => ({
                        sleep_target_hours: prev.sleep_target_hours || rec?.sleep_target_hours || (lvl === "Diabetes" ? 8.0 : 7.5),
                        walking_target_minutes: prev.walking_target_minutes || rec?.walking_target_minutes || (lvl === "Diabetes" ? 45 : (lvl === "Prediabetes" ? 40 : 30)),
                        nutrition_goal: prev.nutrition_goal || rec?.nutrition_goal || (lvl === "Diabetes"
                            ? "Defisit Kalori Terpantau, Batasi Karbohidrat Sederhana, Serat >= 35g/hari"
                            : (lvl === "Prediabetes" ? "Pola Makan Indeks Glikemik Rendah, Defisit Ringan, Serat >= 30g/hari" : "Gizi Seimbang & Hidrasi Optimal"))
                    }));
                }
            }
        };
        checkAnalysis();
        fetchPlanData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handlers
    const handleEnroll = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post(`/api/plan/enroll`, {
                user_id: currentUser.id,
                sleep_target_hours: parseFloat(enrollData.sleep_target_hours) || 7.5,
                walking_target_minutes: parseInt(enrollData.walking_target_minutes) || 35,
                nutrition_goal: enrollData.nutrition_goal || "Defisit Kalori Ringan, Serat >= 30g/hari"
            });
            if (res.status === 200 || res.data?.success) {
                await fetchPlanData();
            } else {
                alert("Gagal memulai program intervensi. Silakan coba kembali.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDailySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const sleepVal = dailyInput.tidur ? (planData.targets?.sleep || 7.5) : 0;
            const walkVal = dailyInput.langkah ? (planData.targets?.walking || 30) : 0;
            const nutVal = dailyInput.nutrisi ? 85 : 0;

            const res = await api.post(`/api/plan/daily`, {
                user_id: currentUser.id,
                day: planData.day,
                sleep_hours: dailyInput.tidur ? parseFloat(sleepVal) : null,
                walking_minutes: dailyInput.langkah ? parseInt(walkVal) : null,
                nutrition_score: dailyInput.nutrisi ? parseFloat(nutVal) : null
            });
            const data = res.data;
            if (res.status === 200 || res.data?.success) {
                if (data.xp_gained > 0) {
                    setXpGainedPop(data.xp_gained);
                    setShowAnim(true);
                    setTimeout(() => setShowAnim(false), 3000);
                }
                if (data.ai_feedback) {
                    setAiDailyFeedback(data.ai_feedback);
                    setShowDailyFeedbackModal(true);
                }
                if (data.newAchievements && data.newAchievements.length > 0) {
                    alert(`Selamat! Anda membuka lencana baru:\n${data.newAchievements.join("\n")}`);
                }
                await fetchPlanData();
            } else {
                alert(data.message || "Gagal menyimpan data harian.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGlucoseSubmit = async (e) => {
        e.preventDefault();
        if (!glucoseInput || parseFloat(glucoseInput) <= 0) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(`/api/plan/glucose`, {
                user_id: currentUser.id,
                day: planData.day,
                glucose_value: parseFloat(glucoseInput)
            });
            const data = res.data;
            if (res.status === 200 || res.data?.success) {
                setXpGainedPop(data.xp_gained || 25);
                setShowAnim(true);
                setTimeout(() => setShowAnim(false), 3000);
                if (data.ai_feedback) {
                    setAiGlucoseFeedback(data.ai_feedback);
                    setShowGlucoseFeedbackModal(true);
                } else {
                    setShowGlucoseSuccess(true);
                    setTimeout(() => setShowGlucoseSuccess(false), 5000);
                }
                if (data.newAchievements && data.newAchievements.length > 0) {
                    alert(`Lencana Terbuka!\n${data.newAchievements.join("\n")}`);
                }
                setGlucoseInput("");
                await fetchPlanData();
            } else {
                alert(data.message || "Gagal menyimpan data gula darah.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const runAssessment = async (days) => {
        setIsSubmitting(true);
        try {
            const endpoint = days === 30 ? "assessment30" : "assessment90";
            const res = await api.post(`/api/plan/${endpoint}`, { user_id: currentUser.id });
            const data = res.data;
            if (res.status === 200 || res.data?.success) {
                setAssessmentResult(data.ai_data || data.computed_stats || data.data);
                setShowAssessmentModal(true);
                setXpGainedPop(data.xp_gained || 100);
                setShowAnim(true);
                setTimeout(() => setShowAnim(false), 3000);
                await fetchPlanData();
            } else {
                alert(data.message || "Gagal menjalankan evaluasi klinis.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressPercent = Math.min(100, Math.round((planData.day / 90) * 100));
    const xpPercent = Math.min(100, Math.round(((500 - planData.xpToNextLevel) / 500) * 100));

    // Current phase calculation
    const currentPhaseNumber = planData.day <= 30 ? 1 : planData.day <= 60 ? 2 : 3;
    const currentPhaseName = planData.day <= 30 ? "Fase 1: Stabilisasi Dasar" : planData.day <= 60 ? "Fase 2: Optimasi Metabolik" : "Fase 3: Konsolidasi";

    return (
        <div className="flex min-h-screen bg-slate-50 relative font-sans">
            {/* Pop Animation XP */}
            {showAnim && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-7 py-3 rounded-full shadow-2xl font-display font-bold text-base animate-bounce z-50 flex items-center gap-2 border border-emerald-300/30">
                    <Zap className="w-5 h-5 text-amber-300" strokeWidth={2.5} />
                    +{xpGainedPop} XP Berhasil Ditambahkan!
                </div>
            )}

            {/* Glucose Success Toast */}
            {showGlucoseSuccess && (
                <div className="fixed bottom-8 right-8 bg-white/95 backdrop-blur-xl border border-emerald-200 rounded-3xl shadow-xl z-50 flex items-center p-4.5 gap-3.5 max-w-sm animate-fade-in ring-1 ring-slate-900/5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm">Gula Darah Terekam!</h4>
                        <p className="text-xs text-slate-500">Data telah diintegrasikan ke algoritma AI harian.</p>
                    </div>
                    <button onClick={() => setShowGlucoseSuccess(false)} className="text-slate-400 hover:text-slate-600 p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* AI Daily Feedback Modal */}
            {showDailyFeedbackModal && aiDailyFeedback && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0062E3] to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold font-display text-slate-900">
                                        Evaluasi Metabolik Harian
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">
                                        Hari ke-{planData.day} · GluCare Clinical Engine
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDailyFeedbackModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Skor Kepatuhan */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-4 text-center">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Skor Kepatuhan Protokol
                            </span>
                            <div className="flex items-center justify-center gap-3 mt-1">
                                <span className="text-4xl font-extrabold font-mono text-[#0062E3] tabular-nums">
                                    {Math.round(aiDailyFeedback.metabolic_score || 80)}%
                                </span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    (aiDailyFeedback.metabolic_score || 80) >= 80 
                                        ? "bg-emerald-100 text-emerald-700" 
                                        : "bg-amber-100 text-amber-700"
                                }`}>
                                    {aiDailyFeedback.rating || "Optimal"}
                                </span>
                            </div>
                        </div>

                        {/* Umpan Balik AI */}
                        <div className="space-y-3 mb-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-[#0062E3]" />
                                    Dampak Sensitivitas Insulin
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                                    {aiDailyFeedback.feedback || "Aktivitas harian merangsang translokasi GLUT4 pada otot dan membantu stabilitas ritme sirkadian glukosa darah."}
                                </p>
                            </div>

                            <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4">
                                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 text-amber-600" />
                                    Rekomendasi Esok Hari
                                </h4>
                                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal">
                                    {aiDailyFeedback.action_tip || "Pertahankan jadwal tidur yang konsisten dan konsumsi serat larut sebelum karbohidrat utama."}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowDailyFeedbackModal(false)}
                            className="w-full py-3.5 bg-gradient-to-r from-[#0062E3] to-cyan-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:opacity-95 transition"
                        >
                            Lanjutkan Intervensi
                        </button>
                    </div>
                </div>
            )}

            {/* AI Glucose Feedback Modal */}
            {showGlucoseFeedbackModal && aiGlucoseFeedback && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                                    aiGlucoseFeedback.category === "Normal" 
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                        : aiGlucoseFeedback.category === "Prediabetes"
                                        ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                        : "bg-gradient-to-br from-rose-500 to-red-600"
                                }`}>
                                    <HeartPulse className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold font-display text-slate-900">
                                        Analisis Klinis GDP
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">
                                        Hasil GDP: {aiGlucoseFeedback.glucose_value} mg/dL
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGlucoseFeedbackModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Status ADA Badge */}
                        <div className={`p-4 rounded-2xl border mb-4 text-center ${
                            aiGlucoseFeedback.category === "Normal" 
                                ? "bg-emerald-50 border-emerald-200" 
                                : aiGlucoseFeedback.category === "Prediabetes"
                                ? "bg-amber-50 border-amber-200"
                                : "bg-rose-50 border-rose-200"
                        }`}>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Klasifikasi Klinis ADA 2024
                            </span>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <h2 className={`text-2xl font-black font-display ${
                                    aiGlucoseFeedback.category === "Normal" ? "text-emerald-700" :
                                    aiGlucoseFeedback.category === "Prediabetes" ? "text-amber-700" : "text-rose-700"
                                }`}>
                                    {aiGlucoseFeedback.category}
                                </h2>
                                <span className="text-xs font-mono font-bold text-slate-600">
                                    ({aiGlucoseFeedback.glucose_value} mg/dL)
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4 text-[#0062E3]" />
                                    Interpretasi Klinis
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                    {aiGlucoseFeedback.clinical_insight || "Nilai glukosa mencerminkan efektivitas glukoneogenesis hepar selama masa puasa semalam."}
                                </p>
                            </div>

                            <div className="bg-blue-50/80 border border-blue-200/70 rounded-2xl p-4">
                                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                                    Saran Tindakan
                                </h4>
                                <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
                                    {aiGlucoseFeedback.immediate_tip || "Lakukan jalan santai 10-15 menit pasca makan untuk membantu translokasi GLUT4 otot tanpa membebani pankreas."}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowGlucoseFeedbackModal(false)}
                            className="w-full py-3.5 bg-gradient-to-r from-[#0062E3] to-cyan-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:opacity-95 transition"
                        >
                            Tutup & Simpan
                        </button>
                    </div>
                </div>
            )}

            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Rencana 90 Hari"
                    subtitle="Intervensi gaya hidup terstruktur berbasis bukti klinis untuk mengembalikan metabolisme ke zona normal"
                />

                <div className="px-6 sm:px-10 py-8 max-w-7xl mx-auto space-y-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-[#0062E3]"></div>
                            <p className="text-xs text-slate-500 font-mono">Memuat rencana intervensi...</p>
                        </div>
                    ) : !hasAnalyzed ? (
                        /* Belum Analisis */
                        <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center ring-1 ring-slate-900/5">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-5 ring-1 ring-amber-500/20">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-extrabold font-display text-slate-900 mb-2">
                                Analisis Risiko Diperlukan
                            </h2>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
                                Program intervensi 90 hari dirancang khusus berdasarkan profil metabolik personal Anda. Harap lakukan skrining awal melalui Cek Risiko terlebih dahulu.
                            </p>
                            <button
                                onClick={() => navigate("/analisis")}
                                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0062E3] hover:bg-[#0052be] text-white font-bold text-sm shadow-md transition group"
                            >
                                <span>Mulai Skrining Risiko Sekarang</span>
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </button>
                        </div>
                    ) : !isEnrolled ? (
                        /* Belum Enroll */
                        <div className="max-w-3xl mx-auto my-8 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden ring-1 ring-slate-900/5">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-[#0062E3] flex items-center justify-center mx-auto mb-4 ring-1 ring-blue-500/20">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                                    Aktivasi Protokol 90 Hari
                                </h2>
                                <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
                                    AI GluCare telah menyiapkan target awal berdasarkan hasil skrining Anda. Konfirmasikan target di bawah untuk memulai hari ke-1:
                                </p>
                            </div>

                            <form onSubmit={handleEnroll} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
                                            <Moon className="w-4 h-4 text-indigo-500" />
                                            Target Tidur Konsisten
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="6"
                                                max="10"
                                                required
                                                value={enrollData.sleep_target_hours}
                                                onChange={(e) => setEnrollData({ ...enrollData, sleep_target_hours: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold font-mono focus:outline-none focus:border-[#0062E3]"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Jam/Hari</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
                                            <Footprints className="w-4 h-4 text-blue-500" />
                                            Target Jalan Cepat Harian
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="5"
                                                min="15"
                                                max="120"
                                                required
                                                value={enrollData.walking_target_minutes}
                                                onChange={(e) => setEnrollData({ ...enrollData, walking_target_minutes: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold font-mono focus:outline-none focus:border-[#0062E3]"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Menit/Hari</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
                                        <Apple className="w-4 h-4 text-emerald-500" />
                                        Fokus Nutrisi Klinis
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={enrollData.nutrition_goal}
                                        onChange={(e) => setEnrollData({ ...enrollData, nutrition_goal: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0062E3]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0062E3] to-cyan-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2.5 group"
                                >
                                    <span>{isSubmitting ? "Menginisialisasi Program..." : "Mulai Protokol 90 Hari Sekarang"}</span>
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Enrolled Dashboard View */
                        <>
                            {/* Top Stats Trio (21st.dev Bento Architecture) */}
                            <StatsCard />

                            {/* Main Bento: Left Progress & Level / Right Today's Protocol */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Column: 90 Days Ring & Level Card (5 cols) */}
                                <div className="lg:col-span-5 space-y-6">
                                    {/* Overall 90-Day Progress (Double-Bezel) */}
                                    <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/60 to-slate-200/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                                        <div className="bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-7 overflow-hidden relative">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                                        Status Intervensi
                                                    </span>
                                                    <h3 className="text-lg font-bold font-display text-slate-900">
                                                        {currentPhaseName}
                                                    </h3>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#0062E3] border border-blue-100">
                                                    Fase {currentPhaseNumber}/3
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                {/* Progress Ring SVG */}
                                                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="42"
                                                            className="text-slate-100"
                                                            strokeWidth="8"
                                                            stroke="currentColor"
                                                            fill="transparent"
                                                        />
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="42"
                                                            className="text-[#0062E3]"
                                                            strokeWidth="8"
                                                            strokeDasharray={264}
                                                            strokeDashoffset={264 - (264 * progressPercent) / 100}
                                                            strokeLinecap="round"
                                                            stroke="currentColor"
                                                            fill="transparent"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                        <span className="text-xl font-black font-mono text-slate-900 tabular-nums">
                                                            {progressPercent}%
                                                        </span>
                                                        <span className="text-[10px] font-medium text-slate-400">Selesai</span>
                                                    </div>
                                                </div>

                                                {/* Progress Info */}
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black font-mono text-[#0062E3] tabular-nums">
                                                            Hari {planData.day}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-mono">/ 90 Hari</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        Tersisa <strong className="text-slate-800">{Math.max(0, 90 - planData.day)} hari</strong> menuju evaluasi akhir.
                                                    </p>
                                                    <button
                                                        onClick={() => navigate("/evaluasi")}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0062E3] hover:underline pt-2 group/btn"
                                                    >
                                                        <span>Buka Laporan Evaluasi</span>
                                                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                                                            <ArrowRight className="w-3 h-3 text-[#0062E3]" />
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Level & XP Progress Card (Double-Bezel) */}
                                    <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/60 to-slate-200/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                                        <div className="bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-7 overflow-hidden">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center ring-1 ring-amber-500/20">
                                                        <Zap className="w-4 h-4" strokeWidth={2.5} />
                                                    </div>
                                                    <span className="font-bold font-display text-slate-800 text-sm">
                                                        Level {planData.level} · Metabolic Tier
                                                    </span>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                                                    +{planData.xp} XP
                                                </span>
                                            </div>

                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mt-3">
                                                <div
                                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${xpPercent}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
                                                <span>{planData.xp} XP</span>
                                                <span className="text-amber-600 font-semibold">
                                                    {planData.xpToNextLevel} XP lagi ke Level {planData.level + 1}
                                                </span>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                <span className="text-xs text-slate-500 font-medium">Koleksi Lencana</span>
                                                <button
                                                    onClick={() => navigate("/pencapaian")}
                                                    className="text-xs font-bold text-[#0062E3] hover:underline flex items-center gap-1.5 group/ach"
                                                >
                                                    <span>Lihat Pencapaian ({planData.achievements?.length || 0})</span>
                                                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center group-hover/ach:translate-x-0.5 transition-transform">
                                                        <ChevronRight className="w-3 h-3 text-[#0062E3]" />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assessment 30 or 90 CTA Banner */}
                                    {planData.day >= 30 && (
                                        <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden ring-1 ring-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
                                                    <ShieldCheck className="w-6 h-6" strokeWidth={2.2} />
                                                </div>
                                                <h4 className="text-base font-bold font-display">
                                                    {planData.day >= 90 ? "Evaluasi Komprehensif Hari ke-90" : "Evaluasi Milestone Hari ke-30"}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-white/80 leading-relaxed mb-4">
                                                Anda telah mencapai tonggak program! Dapatkan analisis perbandingan metabolisme klinis dari model AI GluCare.
                                            </p>
                                            <button
                                                onClick={() => runAssessment(planData.day >= 90 ? 90 : 30)}
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition shadow flex items-center justify-center gap-2 group/btn"
                                            >
                                                <span>{isSubmitting ? "Memproses..." : "Jalankan Evaluasi Klinis AI (+100 XP)"}</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Today's Clinical Checklist & Glucose Log (7 cols) */}
                                <div className="lg:col-span-7 space-y-6">
                                    {/* Daily Tracking Checklist (Double-Bezel) */}
                                    <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/60 to-slate-200/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                                        <div className="bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-7 overflow-hidden">
                                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                                <div>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                                        Target Harian
                                                    </span>
                                                    <h3 className="text-base font-bold font-display text-slate-900">
                                                        Protokol Kepatuhan Hari ke-{planData.day}
                                                    </h3>
                                                </div>
                                                {planData.todayTracking && (
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                                                        Terekam Hari Ini
                                                    </span>
                                                )}
                                            </div>

                                            <form onSubmit={handleDailySubmit} className="space-y-3.5">
                                                {/* Habit 1: Tidur */}
                                                <div
                                                    onClick={() => {
                                                        if (!isCompletedToday) setDailyInput({ ...dailyInput, tidur: !dailyInput.tidur });
                                                    }}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                                        dailyInput.tidur
                                                            ? "bg-emerald-50/70 border-emerald-200 shadow-sm"
                                                            : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                                            dailyInput.tidur ? "bg-emerald-600 text-white shadow-sm" : "border-2 border-slate-300 bg-white"
                                                        }`}>
                                                            {dailyInput.tidur && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                                        </div>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                                <Moon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${dailyInput.tidur ? "text-emerald-900" : "text-slate-800"}`}>
                                                                    Tidur Terjadwal ({planData.targets?.sleep || 7.5} Jam)
                                                                </p>
                                                                <p className="text-xs text-slate-500 font-medium">Memulihkan regulasi insulin basal hepar</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                        +10 XP
                                                    </span>
                                                </div>

                                                {/* Habit 2: Langkah */}
                                                <div
                                                    onClick={() => {
                                                        if (!isCompletedToday) setDailyInput({ ...dailyInput, langkah: !dailyInput.langkah });
                                                    }}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                                        dailyInput.langkah
                                                            ? "bg-emerald-50/70 border-emerald-200 shadow-sm"
                                                            : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                                            dailyInput.langkah ? "bg-emerald-600 text-white shadow-sm" : "border-2 border-slate-300 bg-white"
                                                        }`}>
                                                            {dailyInput.langkah && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                                        </div>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                                <Footprints className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${dailyInput.langkah ? "text-emerald-900" : "text-slate-800"}`}>
                                                                    Aktivitas Fisik ({planData.targets?.walking || 30} Menit)
                                                                </p>
                                                                <p className="text-xs text-slate-500 font-medium">Memicu penyerapan glukosa via GLUT4 otot</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                        +10 XP
                                                    </span>
                                                </div>

                                                {/* Habit 3: Nutrisi */}
                                                <div
                                                    onClick={() => {
                                                        if (!isCompletedToday) setDailyInput({ ...dailyInput, nutrisi: !dailyInput.nutrisi });
                                                    }}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                                        dailyInput.nutrisi
                                                            ? "bg-emerald-50/70 border-emerald-200 shadow-sm"
                                                            : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                                            dailyInput.nutrisi ? "bg-emerald-600 text-white shadow-sm" : "border-2 border-slate-300 bg-white"
                                                        }`}>
                                                            {dailyInput.nutrisi && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                                        </div>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                                <Apple className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${dailyInput.nutrisi ? "text-emerald-900" : "text-slate-800"}`}>
                                                                    Target Nutrisi Rendah Glikemik
                                                                </p>
                                                                <p className="text-xs text-slate-500 font-medium">Bebas minuman berpemanis & serat tinggi</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        +10 XP
                                                    </span>
                                                </div>

                                                {isCompletedToday ? (
                                                    <div className="w-full text-center py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mt-4 flex items-center justify-center gap-2 shadow-sm">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        <span>Protokol Hari Ini Telah Diselesaikan</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full mt-4 py-3.5 rounded-2xl bg-[#0062E3] hover:bg-[#0052be] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 group/btn"
                                                    >
                                                        <span>{isSubmitting ? "Menyimpan Catatan..." : "Konfirmasi Protokol Hari Ini (+30 XP)"}</span>
                                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </div>
                                                    </button>
                                                )}
                                            </form>
                                        </div>
                                    </div>

                                    {/* Blood Glucose Log Card (Double-Bezel & Zero Overlapping Text) */}
                                    <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/60 to-slate-200/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                                        <div className="bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-7 overflow-hidden">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center ring-1 ring-rose-500/20">
                                                        <Droplets className="w-5 h-5" strokeWidth={2.2} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold font-display text-slate-900">
                                                            Log Gula Darah Puasa (GDP)
                                                        </h3>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            Disarankan setiap 7–14 hari untuk validasi respons metabolik
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto border border-slate-200/60">
                                                    ADA Benchmark
                                                </span>
                                            </div>

                                            {planData.todayGlucose ? (
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" strokeWidth={2.2} />
                                                    <div>
                                                        <p className="text-xs font-bold text-emerald-900">
                                                            GDP Hari Ini: {planData.todayGlucose} mg/dL
                                                        </p>
                                                        <p className="text-[11px] text-emerald-700">Data telah masuk ke riwayat evaluasi klinis.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleGlucoseSubmit} className="space-y-3">
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="40"
                                                                max="400"
                                                                required
                                                                placeholder="Contoh: 104"
                                                                value={glucoseInput}
                                                                onChange={(e) => setGlucoseInput(e.target.value)}
                                                                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold font-mono text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                                                                mg/dL
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition whitespace-nowrap flex items-center justify-center gap-2 group/save"
                                                        >
                                                            <span>{isSubmitting ? "Menyimpan..." : "Simpan GDP"}</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover/save:translate-x-0.5 transition-transform" />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-slate-500">
                                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold">
                                                            Normal: &lt; 100 mg/dL
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/70 font-semibold">
                                                            Prediabetes: 100–125 mg/dL
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/70 font-semibold">
                                                            Diabetes: ≥ 126 mg/dL
                                                        </span>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phase Timeline Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold font-display text-slate-900">
                                        Roadmap 3 Fase Intervensi
                                    </h3>
                                    <span className="text-xs text-slate-500">
                                        Klik fase untuk melihat target mingguan
                                    </span>
                                </div>
                                <FaseIntervensi currentDay={planData.day} />
                            </div>

                            {/* 7-Day Activity Trend Chart */}
                            <ActivityChart dailyData={dailyHistory} currentDay={planData.day} />

                            {/* Bottom Re-analysis Card */}
                            <div
                                onClick={() => navigate("/analisis")}
                                className="flex items-center justify-between p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-100/60 transition group shadow-sm"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center ring-1 ring-amber-200">
                                        <RotateCcw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            Ingin Memperbarui Profil Risiko Klinis?
                                        </p>
                                        <p className="text-xs text-amber-800 font-medium">
                                            Lakukan pemeriksaan lab baru untuk mengkalibrasi ulang parameter intervensi AI.
                                        </p>
                                    </div>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-amber-200/50 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                    <ChevronRight className="w-4 h-4 text-amber-700" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}