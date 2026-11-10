import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/Profile.jpg";
import { useSidebar } from "../hooks/useSidebar";
import { useAuth } from "../context/AuthContext";
import { planService, streakService } from "../services";
import api from "../services/api";
import ClinicalBadge from "../components/ui/ClinicalBadge";
import {
    Flame,
    Zap,
    Target,
    Moon,
    Footprints,
    Apple,
    Sparkles,
    CheckCircle2,
    Check,
    ArrowRight,
    Activity,
    Lightbulb,
    X,
    ShieldCheck,
    AlertTriangle,
    Clock,
    TrendingUp,
    Compass,
    Calendar,
    Stethoscope,
    ChevronRight,
    FileText,
    Award,
    RefreshCw,
    Info,
    CheckCircle,
    BarChart3
} from "lucide-react";
import StreakCalendar from "../components/StreakCalendar";

function Dashboard() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const { user, updateUser } = useAuth();

    const [riskData, setRiskData] = useState(null);
    const [streak, setStreak] = useState(0);
    const [day, setDay] = useState(0);
    const [currentDate, setCurrentDate] = useState("");
    const [tasks, setTasks] = useState({
        tidur: false,
        langkah: false,
        nutrisi: false,
    });
    const [isCompletedToday, setIsCompletedToday] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [planTargets, setPlanTargets] = useState(null);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [xpToNextLevel, setXpToNextLevel] = useState(100);
    const [aiFeedback, setAiFeedback] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);

    // Smart Streak Engine State
    const [longestStreak, setLongestStreak] = useState(0);
    const [freezeCount, setFreezeCount] = useState(0);
    const [isCheckedInToday, setIsCheckedInToday] = useState(false);
    const [weeklyStreak, setWeeklyStreak] = useState([]);
    const [monthlyStreak, setMonthlyStreak] = useState([]);
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    useEffect(() => {
        const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
        setCurrentDate(new Date().toLocaleDateString("id-ID", options));
    }, []);

    // Fetch AI Result from server with Full CDSS & Metadata
    useEffect(() => {
        if (!user?.id) return;

        const fetchAiResult = async () => {
            let hasFoundAiData = false;
            try {
                const res = await api.get(`/api/ai/result/${user.id}`);
                const parsed = res.data;
                const aiRes = parsed.aiResult || parsed.data?.aiResult;

                if (aiRes) {
                    hasFoundAiData = true;
                    const rawProba = aiRes.predict_proba || [0, 0, 0];
                    const flatProba = Array.isArray(rawProba) && Array.isArray(rawProba[0])
                        ? rawProba[0]
                        : (Array.isArray(rawProba) ? rawProba : [0, 0, 0]);

                    let score = 25;
                    if (aiRes.score !== undefined && aiRes.score !== null) {
                        score = aiRes.score;
                    } else if (parsed.ui_data?.score !== undefined) {
                        score = parsed.ui_data.score;
                    } else {
                        score = Math.round(((flatProba[1] || 0) + (flatProba[2] || 0)) * 100);
                    }

                    const aiRiskLevel = aiRes.risk_level || (aiRes.prediction_raw === 1 ? "Prediabetes" : aiRes.prediction_raw === 2 ? "Diabetes" : "Normal");

                    let status = "Risiko Normal (Sehat)";
                    let risk = "Rendah";

                    if (aiRiskLevel === "Diabetes" || aiRiskLevel === "high") {
                        status = "Risiko Tinggi (Indikasi Diabetes)";
                        risk = "Tinggi";
                    } else if (aiRiskLevel === "Prediabetes" || aiRiskLevel === "medium") {
                        status = "Risiko Sedang (Indikasi Prediabetes)";
                        risk = "Prediabetes";
                    }

                    const mode = parsed.mode || (parsed.clinicalParams ? "clinical" : "questionnaire");
                    const modelName = mode === "clinical"
                        ? "Random Forest (Biomarker Lab)"
                        : "Calibrated Logistic Regression (Kuesioner)";

                    const top3 = parsed.ui_data?.top_3_priorities || parsed.top_3_priorities || [];
                    const safetyAlert = parsed.ui_data?.safety_alert || parsed.safety_alert || null;
                    const faktorList = parsed.ui_data?.faktorRisiko || [];

                    setRiskData({
                        score,
                        status,
                        risk,
                        mode,
                        modelName,
                        top3Priorities: top3,
                        safetyAlert: safetyAlert,
                        faktorList: faktorList,
                        insight: parsed.ui_data?.insight || aiRes.insight || null,
                        cta: parsed.ui_data?.cta || aiRes.cta || null,
                        timestamp: parsed.timestamp || null
                    });
                }
            } catch (error) {
                // Fallback to localStorage if server fails
                const rawAiData = localStorage.getItem(`aiAnalysisResult_${user.id}`);
                if (rawAiData) {
                    try {
                        const parsed = JSON.parse(rawAiData);
                        const aiRes = parsed.aiResult;
                        if (aiRes) {
                            hasFoundAiData = true;
                            const rawProba = aiRes.predict_proba || [0, 0, 0];
                            const flatProba = Array.isArray(rawProba) && Array.isArray(rawProba[0])
                                ? rawProba[0]
                                : (Array.isArray(rawProba) ? rawProba : [0, 0, 0]);

                            let score = 25;
                            if (aiRes.score !== undefined && aiRes.score !== null) score = aiRes.score;
                            else if (parsed.ui_data?.score !== undefined) score = parsed.ui_data.score;
                            else score = Math.round(((flatProba[1] || 0) + (flatProba[2] || 0)) * 100);

                            const aiRiskLevel = aiRes.risk_level || "Normal";
                            let status = "Risiko Normal (Sehat)";
                            let risk = "Rendah";

                            if (aiRiskLevel === "Diabetes" || aiRiskLevel === "high") {
                                status = "Risiko Tinggi (Indikasi Diabetes)";
                                risk = "Tinggi";
                            } else if (aiRiskLevel === "Prediabetes" || aiRiskLevel === "medium") {
                                status = "Risiko Sedang (Indikasi Prediabetes)";
                                risk = "Prediabetes";
                            }

                            const mode = parsed.mode || (parsed.clinicalParams ? "clinical" : "questionnaire");
                            const modelName = mode === "clinical"
                                ? "Random Forest (Biomarker Lab)"
                                : "Calibrated Logistic Regression (Kuesioner)";

                            const top3 = parsed.ui_data?.top_3_priorities || parsed.top_3_priorities || [];
                            const safetyAlert = parsed.ui_data?.safety_alert || parsed.safety_alert || null;

                            setRiskData({
                                score,
                                status,
                                risk,
                                mode,
                                modelName,
                                top3Priorities: top3,
                                safetyAlert: safetyAlert,
                                faktorList: parsed.ui_data?.faktorRisiko || [],
                                insight: parsed.ui_data?.insight || aiRes.insight || null,
                                cta: parsed.ui_data?.cta || aiRes.cta || null,
                                timestamp: parsed.timestamp || null
                            });
                        }
                    } catch (e) {
                        console.error("Gagal membaca fallback AI dari localStorage:", e);
                    }
                }
            }

            if (!hasFoundAiData) {
                setRiskData(null);
            }
        };

        fetchAiResult();
    }, [user?.id]);

    // Fetch Streak Data
    const fetchStreakData = useCallback(async (uid) => {
        if (!uid) return;
        try {
            const [streakRes, historyRes, monthlyRes] = await Promise.all([
                streakService.getStreak(uid),
                streakService.getStreakHistory(uid, 7),
                streakService.getStreakHistory(uid, 30),
            ]);

            if (streakRes?.data) {
                const s = streakRes.data;
                setStreak(s.current_streak || 0);
                setLongestStreak(s.longest_streak || 0);
                setFreezeCount(s.freeze_count || 0);
                setIsCheckedInToday(Boolean(s.is_checked_in_today));
            }

            if (historyRes?.data?.calendar) {
                setWeeklyStreak([...historyRes.data.calendar].reverse());
            }

            if (monthlyRes?.data?.calendar) {
                setMonthlyStreak([...monthlyRes.data.calendar].reverse());
            }
        } catch (err) {
            console.error("Gagal memuat data streak:", err);
        }
    }, []);

    // Quick Check-in Streak Handler
    const handleQuickCheckin = async () => {
        if (!user?.id || isCheckedInToday) return;
        setIsCheckingIn(true);
        try {
            const res = await streakService.checkin(user.id);
            if (res?.success || res?.status === "already_checked_in") {
                const s = res.data || res;
                const newCurrent = s.current_streak || streak + 1;
                const newLongest = s.longest_streak || Math.max(longestStreak, newCurrent);
                setStreak(newCurrent);
                setLongestStreak(newLongest);
                setIsCheckedInToday(true);
                await fetchStreakData(user.id);
            }
        } catch (error) {
            console.error("Gagal check-in streak:", error);
        } finally {
            setIsCheckingIn(false);
        }
    };

    // Toggle task status locally
    const handleToggleTask = (taskName) => {
        if (isCompletedToday) return;
        setTasks((prev) => ({ ...prev, [taskName]: !prev[taskName] }));
    };

    // Submit Daily Tracking
    const handleDailySubmit = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            const sleepTarget = planTargets?.sleep || 7.5;
            const walkTarget = planTargets?.walking || 30;
            const sleepVal = tasks.tidur ? sleepTarget : 0;
            const walkVal = tasks.langkah ? walkTarget : 0;
            const nutVal = tasks.nutrisi ? 85 : 0;

            const res = await planService.submitDailyTracking({
                user_id: user.id,
                day: day > 0 ? day : 1,
                sleep_hours: tasks.tidur ? parseFloat(sleepVal) : null,
                walking_minutes: tasks.langkah ? parseInt(walkVal) : null,
                nutrition_score: tasks.nutrisi ? parseFloat(nutVal) : null,
            });

            if (res?.success) {
                setIsCompletedToday(true);
                setIsCheckedInToday(true);
                if (res.streak) {
                    setStreak(res.streak.current_streak || streak + 1);
                    setLongestStreak(res.streak.longest_streak || longestStreak);
                }
                if (res.total_xp) setXp(res.total_xp);
                if (res.level) setLevel(res.level);
                if (res.ai_feedback) {
                    setAiFeedback(res.ai_feedback);
                    setShowAiModal(true);
                }
                await fetchStreakData(user.id);
            }
        } catch (err) {
            console.error("Gagal submit daily tracking:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch Plan Data
    useEffect(() => {
        if (!user?.id) return;

        const fetchPlanData = async () => {
            try {
                const res = await planService.getPlanData(user.id);
                setIsEnrolled(res.enrolled);
                if (res.enrolled) {
                    setDay(res.day);
                    setStreak(res.currentStreak);
                    setLevel(res.level || 1);
                    setXp(res.xp || 0);
                    setXpToNextLevel(res.xpToNextLevel || 100);
                    setPlanTargets(res.targets);
                    if (res.todayTracking) {
                        setIsCompletedToday(true);
                        setTasks({
                            tidur: !!res.todayTracking.sleep_hours,
                            langkah: !!res.todayTracking.walking_minutes,
                            nutrisi: !!res.todayTracking.nutrition_score,
                        });
                    } else {
                        setIsCompletedToday(false);
                        setTasks({ tidur: false, langkah: false, nutrisi: false });
                    }
                }
                fetchStreakData(user.id);
            } catch (e) {
                console.error("Gagal mengambil data plan 90 hari", e);
            }
        };

        fetchPlanData();
        window.addEventListener("focus", fetchPlanData);
        return () => window.removeEventListener("focus", fetchPlanData);
    }, [user?.id, fetchStreakData]);

    // Risk Aesthetics Color Logic
    const getRiskMeta = () => {
        if (!riskData) {
            return {
                ringColor: "#0062E3",
                glowShadow: "shadow-blue-500/10",
                badgeVariant: "clinical",
                accentText: "text-blue-400",
                accentBg: "bg-blue-500/15",
                statusLabel: "Belum Dievaluasi",
                riskBadge: "bg-blue-500/20 text-blue-300 border-blue-400/30"
            };
        }
        if (riskData.risk === "Tinggi") {
            return {
                ringColor: "#EF4444",
                glowShadow: "shadow-rose-500/15",
                badgeVariant: "danger",
                accentText: "text-rose-400",
                accentBg: "bg-rose-500/15",
                statusLabel: "Risiko Tinggi",
                riskBadge: "bg-rose-500/20 text-rose-300 border-rose-400/30"
            };
        }
        if (riskData.risk === "Prediabetes") {
            return {
                ringColor: "#F59E0B",
                glowShadow: "shadow-amber-500/15",
                badgeVariant: "warning",
                accentText: "text-amber-400",
                accentBg: "bg-amber-500/15",
                statusLabel: "Risiko Sedang",
                riskBadge: "bg-amber-500/20 text-amber-300 border-amber-400/30"
            };
        }
        return {
            ringColor: "#10B981",
            glowShadow: "shadow-emerald-500/15",
            badgeVariant: "optimal",
            accentText: "text-emerald-400",
            accentBg: "bg-emerald-500/15",
            statusLabel: "Risiko Rendah",
            riskBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
        };
    };

    const riskMeta = getRiskMeta();

    // 90-Day Intervention Phase Calculation
    const currentDay = day > 0 ? day : 1;
    let currentPhase = {
        number: 1,
        title: "Fase 1: Stabilisasi Dasar",
        range: "Hari 1 – 30",
        focus: "Adaptasi ritme sirkadian tidur, jalan santai harian, dan eliminasi minuman manis.",
        path: "/stabilisasi",
        milestone: "Evaluasi Lintasan Hari ke-30 (XGBoost ML)",
        progress: Math.min((currentDay / 30) * 100, 100),
    };

    if (currentDay > 30 && currentDay <= 60) {
        currentPhase = {
            number: 2,
            title: "Fase 2: Optimasi Metabolik",
            range: "Hari 31 – 60",
            focus: "Aktivasi GLUT4 dengan target ≥150 mnt/minggu dan substitusi karbohidrat kompleks.",
            path: "/optimasi",
            milestone: "Uji Kepatuhan & Tren Glikemik Tengah",
            progress: Math.min(((currentDay - 30) / 30) * 100, 100),
        };
    } else if (currentDay > 60) {
        currentPhase = {
            number: 3,
            title: "Fase 3: Konsolidasi & Evaluasi Akhir",
            range: "Hari 61 – 90",
            focus: "Penguncian kebiasaan permanen, pemantauan mandiri berkala, dan pencegahan relaps.",
            path: "/konsolidasi",
            milestone: "Evaluasi Capaian Akhir Hari ke-90 (Delta Glukosa)",
            progress: Math.min(((currentDay - 60) / 30) * 100, 100),
        };
    }

    // Default Fallback Top 3 Priorities if not present from CDSS
    const activeTop3 = (riskData?.top3Priorities && riskData.top3Priorities.length > 0)
        ? riskData.top3Priorities
        : [
            {
                rule_id: "PA01",
                category: "Physical Activity",
                factor_name: "Aktivitas Aerobik Teratur",
                priority_tier: "High",
                initial_target: "Tambah 15-20 menit jalan santai/hari, 3-5 hari/minggu.",
                progress_metric: "Total menit jalan cepat/minggu.",
                evidence_source: "ADA Ch. 5 / WHO Guidelines",
                action: "Jalan cepat konsisten terbagi dalam seminggu untuk merangsang translokasi GLUT4."
            },
            {
                rule_id: "SSB01",
                category: "Sugar Drinks",
                factor_name: "Eliminasi Minuman Berpemanis",
                priority_tier: "High",
                initial_target: "Ganti minuman manis kemasan dengan air mineral atau infused water.",
                progress_metric: "Porsi minuman manis per minggu.",
                evidence_source: "WHO Sugars Guideline",
                action: "Hindari lonjakan glukosa tajam dan penumpukan lemak hati (de novo lipogenesis)."
            },
            {
                rule_id: "SL01",
                category: "Sleep Recovery",
                factor_name: "Durasi Tidur Optimal",
                priority_tier: "Medium",
                initial_target: "Pertahankan jadwal tidur teratur 7-9 jam setiap malam.",
                progress_metric: "Rata-rata jam tidur malam & konsistensi jam bangun.",
                evidence_source: "AASM Consensus / ADA Ch. 5",
                action: "Menormalkan sekresi kortisol nokturnal dan memulihkan sensitivitas insulin."
            }
        ];

    const hour = new Date().getHours();
    let greeting = "Selamat Pagi";
    if (hour >= 12 && hour < 15) greeting = "Selamat Siang";
    else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
    else if (hour >= 18) greeting = "Selamat Malam";

    const completedTasksCount = Object.values(tasks).filter(Boolean).length;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />

            {/* Modal Feedback AI Check-in Harian */}
            {showAiModal && aiFeedback && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/20">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                                        Evaluasi AI Harian
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium font-mono">
                                        Hari ke-{day || 1} • GluCare Metabolic Engine
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Skor Kepatuhan */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 text-center space-y-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                                Skor Kepatuhan Protokol
                            </span>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl font-black text-blue-600 font-mono">
                                    {Math.round(aiFeedback.metabolic_score || 80)}%
                                </span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    (aiFeedback.metabolic_score || 80) >= 80
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                }`}>
                                    {aiFeedback.rating || "Optimal"}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(aiFeedback.metabolic_score || 80, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Umpan Balik AI */}
                        <div className="space-y-3">
                            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-600" />
                                    Aktivasi GLUT4 & Metabolisme Seluler
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                    {aiFeedback.feedback || "Aktivitas hari ini merangsang translokasi transporter GLUT4 otot dan menstabilkan ritme sirkadian glukosa darah."}
                                </p>
                            </div>

                            <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 space-y-1">
                                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                    Tips AI untuk Hari Berikutnya
                                </h4>
                                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal">
                                    {aiFeedback.action_tip || "Pertahankan konsistensi jam tidur dan penuhi hidrasi cukup sebelum memulai aktivitas fisik besok."}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAiModal(false)}
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition"
                        >
                            Lanjutkan & Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <main className="p-4 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-8">
                    
                    {/* Header Command Bar */}
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                        <div className="flex items-center gap-3.5">
                            <div className="relative">
                                <img
                                    src={user?.profile_image ? `${import.meta.env.VITE_API_URL}${user.profile_image}` : defaultAvatar}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500/30" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold text-slate-500">
                                        {greeting}, {currentDate}
                                    </p>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    {user?.fullname || "Pengguna GluCare"}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            {riskData?.mode && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-bold shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                    <span>{riskData.mode === "clinical" ? "Mode Klinis (Lab)" : "Mode Kuesioner"}</span>
                                </span>
                            )}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>AI Engine Aktif</span>
                            </div>
                            <button
                                onClick={() => navigate("/analisis")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                                title="Ulangi asesmen risiko AI"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Skrining Ulang</span>
                            </button>
                        </div>
                    </header>

                    {/* Safety Referral Alert Banner (If Triggered by CDSS Rule HR01-HR03) */}
                    {riskData?.safetyAlert && (
                        <div className="bg-rose-50/90 border-2 border-rose-300 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-rose-950">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded-full">
                                            {riskData.safetyAlert.rule_id || "HR01"} • Perhatian Klinis
                                        </span>
                                        <span className="text-xs font-bold text-rose-800">
                                            Konsultasi Medis Disarankan Segera
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
                                        {riskData.safetyAlert.message || "Indikator klinis memerlukan konfirmasi medis di fasilitas kesehatan."}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/hasil")}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shrink-0 shadow-sm"
                            >
                                Baca Rekomendasi Rujukan
                            </button>
                        </div>
                    )}

                    {/* BENTO HUB UTAMA (Fold Pertama: Evaluasi AI + Daily Habit Hub) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Kiri: Metabolic Status Card (High-Tech Deep Slate Card) */}
                        <div className="lg:col-span-7 xl:col-span-8 bg-gradient-to-br from-[#0B1528] via-[#0E2240] to-[#0A162B] text-white rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between space-y-6">
                            
                            {/* Ambient Glow in background */}
                            <div
                                className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                                style={{ backgroundColor: riskMeta.ringColor }}
                            />

                            <div className="space-y-4 relative z-10">
                                {/* Top Bar: Machine Learning Badge & Consensus Tag */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-sky-200 border border-white/10">
                                            {riskData?.modelName || "Machine Learning NHANES"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                        <span>Standar Konsensus ADA & CDC DPP</span>
                                    </div>
                                </div>

                                {/* Main Stats: Radial Meter + Status Title */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
                                    
                                    {/* SVG Radial Meter */}
                                    <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-white/10"
                                                strokeWidth="3.5"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                strokeDasharray={`${riskData?.score || 25}, 100`}
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                stroke={riskMeta.ringColor}
                                                fill="none"
                                                className="transition-all duration-1000"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute text-center">
                                            <span className="text-3xl font-black font-mono tracking-tight text-white tabular-nums">
                                                {riskData?.score ?? 25}%
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                                                Skor Risiko
                                            </span>
                                        </div>
                                    </div>

                                    {/* Text Diagnosis & Details */}
                                    <div className="space-y-2 text-center sm:text-left">
                                        <div className="inline-flex items-center gap-2">
                                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${riskMeta.riskBadge}`}>
                                                Kategori: {riskData ? riskData.risk : "Normal"}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                            {riskData ? riskData.status : "Belum Dievaluasi"}
                                        </h2>

                                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                                            {riskData?.insight || "Klasifikasi risiko metabolik dihitung dari model prediktif terkalibrasi dataset NHANES. Pantau konsistensi 3 pilar harian Anda untuk menstabilkan sensitivitas insulin."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Driver Chips & Actions */}
                            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                                <div className="text-xs text-slate-300/90 text-center sm:text-left">
                                    <span className="text-slate-400">Rekomendasi AI: </span>
                                    <strong className="text-white font-medium">
                                        {riskData?.cta ? riskData.cta.slice(0, 75) + "..." : "Pertahankan pola makan seimbang dan aktivitas fisik."}
                                    </strong>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                                    <button
                                        onClick={() => navigate(riskData ? "/hasil" : "/analisis")}
                                        className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
                                    >
                                        <span>Rincian Klinis Lengkap</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Kanan: Daily Habit Mission Hub (Checklist 3 Pilar & Gamifikasi) */}
                        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-soft flex flex-col justify-between space-y-5">
                            
                            {/* Mission Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-0.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>Misi 3 Pilar Hari Ini</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                        Hari ke-{day > 0 ? day : 1} <span className="text-xs font-normal text-slate-400">/ 90 Hari</span>
                                    </h3>
                                </div>

                                {isCompletedToday ? (
                                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Selesai</span>
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                        {completedTasksCount}/3 Selesai
                                    </span>
                                )}
                            </div>

                            {/* Mini Gamification Strip */}
                            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                                        <Flame className="w-3 h-3 text-amber-500" />
                                        Streak
                                    </span>
                                    <span className="text-base font-black font-mono text-slate-900">
                                        {streak} <span className="text-xs font-medium text-slate-500 font-sans">Hari</span>
                                    </span>
                                </div>
                                <div className="space-y-0.5 border-l border-slate-200/80">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                                        <Zap className="w-3 h-3 text-blue-600" />
                                        Level {level}
                                    </span>
                                    <span className="text-base font-black font-mono text-slate-900">
                                        {xp} <span className="text-xs font-medium text-slate-500 font-sans">XP</span>
                                    </span>
                                </div>
                            </div>

                            {/* Checklist Items */}
                            <form onSubmit={handleDailySubmit} className="space-y-2.5 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    {/* Item Tidur */}
                                    <div
                                        onClick={() => handleToggleTask("tidur")}
                                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                            tasks.tidur
                                                ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                                                : "bg-white border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                                tasks.tidur ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                                            }`}>
                                                {tasks.tidur && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">Pilar 1: Tidur Sirkadian</div>
                                                <div className="text-[11px] text-slate-500">
                                                    Target {planTargets?.sleep || 7.5} Jam semalam
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                            +10 XP
                                        </span>
                                    </div>

                                    {/* Item Langkah */}
                                    <div
                                        onClick={() => handleToggleTask("langkah")}
                                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                            tasks.langkah
                                                ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                                                : "bg-white border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                                tasks.langkah ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                                            }`}>
                                                {tasks.langkah && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">Pilar 2: Jalan Cepat / GLUT4</div>
                                                <div className="text-[11px] text-slate-500">
                                                    Minimal {planTargets?.walking || 30} Menit
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                            +20 XP
                                        </span>
                                    </div>

                                    {/* Item Nutrisi */}
                                    <div
                                        onClick={() => handleToggleTask("nutrisi")}
                                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                            tasks.nutrisi
                                                ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                                                : "bg-white border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                                tasks.nutrisi ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                                            }`}>
                                                {tasks.nutrisi && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">Pilar 3: Rendah Glikemik</div>
                                                <div className="text-[11px] text-slate-500">
                                                    Bebas minuman manis & tinggi serat
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                            +20 XP
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCompletedToday || isSubmitting}
                                    className="w-full mt-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    <span>
                                        {isSubmitting
                                            ? "Menyimpan ke AI..."
                                            : isCompletedToday
                                            ? "Check-in Hari Ini Lengkap ✓"
                                            : "Simpan & Dapatkan Feedback AI (+50 XP)"}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* FOLD KEDUA: TOP 3 PRIORITAS INTERVENSI PERSONAL (CDSS KNOWLEDGE BASE) */}
                    <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1 border border-blue-200/60">
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>Clinical Decision Support System (CDSS)</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Top 3 Fokus Utama Kebiasaan Anda
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                    Dipilih secara algoritmik dari 21 aturan pedoman klinis (ADA, WHO, CDC DPP) berdasarkan dampak terbesar pada perbaikan metabolik Anda.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/hasil")}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition self-start sm:self-auto"
                            >
                                <span>Lihat Seluruh Aturan CDSS</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {activeTop3.slice(0, 3).map((item, idx) => {
                                const isCritical = item.priority_tier === "Critical";
                                const isHigh = item.priority_tier === "High";
                                const tierBadgeClass = isCritical
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : isHigh
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-blue-50 text-blue-800 border-blue-200";

                                return (
                                    <div
                                        key={item.rule_id || idx}
                                        className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                    Prioritas #{idx + 1}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tierBadgeClass}`}>
                                                    {item.priority_tier || "High"} • {item.rule_id}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {item.factor_name || item.category || "Fokus Kebiasaan"}
                                                </h4>
                                                <p className="text-xs text-slate-600 leading-relaxed mt-1.5 font-medium">
                                                    {item.action || item.clinical_recommendation}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 space-y-2">
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-0.5">
                                                    Target Awal Bertahap
                                                </span>
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    {item.initial_target || "Mulai bertahap sesuai panduan."}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                                                <span>Metrik: {item.progress_metric || "Kepatuhan Mingguan"}</span>
                                                <span className="text-slate-400 font-mono text-[10px]">{item.evidence_source?.split('/')[0] || "ADA / WHO"}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* FOLD KETIGA: ROADMAP INTERVENSI GAYA HIDUP 90 HARI */}
                    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft space-y-6">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1 border border-indigo-200/60">
                                    <Target className="w-3.5 h-3.5" />
                                    <span>Program 90 Hari Terpandu</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    {currentPhase.title} ({currentPhase.range})
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-0.5">
                                    {currentPhase.focus}
                                </p>
                            </div>

                            <button
                                onClick={() => navigate(currentPhase.path)}
                                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
                            >
                                <span>Buka Modul Fase {currentPhase.number}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* 3-Phase Interactive Visual Stepper Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Fase 1 */}
                            <div
                                onClick={() => navigate("/stabilisasi")}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                                    currentPhase.number === 1
                                        ? "bg-blue-50/70 border-blue-300 shadow-sm ring-1 ring-blue-300"
                                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold font-mono text-blue-700">FASE 1</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                                        Hari 1–30
                                    </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-slate-900">Stabilisasi Dasar</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    Ritme sirkadian tidur, adaptasi jalan kaki, & bebas minuman manis.
                                </p>
                                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold">
                                    <Target className="w-3.5 h-3.5" />
                                    <span>Milestone: Evaluasi D30</span>
                                </div>
                            </div>

                            {/* Fase 2 */}
                            <div
                                onClick={() => navigate("/optimasi")}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                                    currentPhase.number === 2
                                        ? "bg-amber-50/70 border-amber-300 shadow-sm ring-1 ring-amber-300"
                                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold font-mono text-amber-700">FASE 2</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                                        Hari 31–60
                                    </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-slate-900">Optimasi Metabolik</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    Translokasi GLUT4, target 150 menit MVPA, & piring sehat T.
                                </p>
                                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>Milestone: Tren Glikemik Tengah</span>
                                </div>
                            </div>

                            {/* Fase 3 */}
                            <div
                                onClick={() => navigate("/konsolidasi")}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                                    currentPhase.number === 3
                                        ? "bg-emerald-50/70 border-emerald-300 shadow-sm ring-1 ring-emerald-300"
                                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold font-mono text-emerald-700">FASE 3</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                                        Hari 61–90
                                    </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-slate-900">Konsolidasi & Evaluasi</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    Penguncian kebiasaan permanen & evaluasi akhir capaian.
                                </p>
                                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Milestone: Evaluasi Akhir D90</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar & Evaluasi Nav Link */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <span>Progres Keseluruhan: <strong className="text-slate-900 font-mono">{day || 1} / 90 Hari</strong> ({Math.round(((day || 1) / 90) * 100)}%)</span>
                            </div>
                            <button
                                onClick={() => navigate("/evaluasi")}
                                className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition"
                            >
                                <span>Buka Halaman Evaluasi Milestone (Day 30 & Day 90)</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </section>

                    {/* FOLD KEEMPAT: SMART STREAK ENGINE & KALENDER KONSISTENSI */}
                    <StreakCalendar
                        streak={streak}
                        longestStreak={longestStreak}
                        freezeCount={freezeCount}
                        isCheckedInToday={isCheckedInToday}
                        weeklyDays={weeklyStreak}
                        monthlyDays={monthlyStreak}
                        onQuickCheckin={handleQuickCheckin}
                        isCheckingIn={isCheckingIn}
                    />

                </main>
            </div>
        </div>
    );
}

export default Dashboard;
