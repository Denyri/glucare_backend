import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import StatsCard from "../components/StatsCard";
import FaseIntervensi from '../components/FaseIntevensi';
import TaskList from '../components/TaskList';
import ActivityChart from '../components/ActivityChart';

export default function Rencana90Hari() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    
    // Enroll Form State
    const [enrollData, setEnrollData] = useState({
        sleep_target_hours: "",
        walking_target_minutes: "",
        nutrition_goal: ""
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
        achievements: []
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

    const [dailyHistory, setDailyHistory] = useState([]);

    const getUser = () => {
        try {
            const rawUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
            if (rawUser && rawUser !== "undefined") return JSON.parse(rawUser);
        } catch(e) { console.error("Error parsing user:", e); }
        return {};
    };
    const currentUser = getUser();

    const fetchPlanData = async () => {
        if (!currentUser?.id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/${currentUser.id}`);
            const data = await res.json();
            
            if (res.ok) {
                setIsEnrolled(data.enrolled);
                if (data.enrolled) {
                    setPlanData({
                        day: data.day,
                        xp: data.xp,
                        level: data.level,
                        xpToNextLevel: data.xpToNextLevel,
                        currentStreak: data.currentStreak,
                        bestStreak: data.bestStreak,
                        todayTracking: data.todayTracking,
                        todayGlucose: data.todayGlucose,
                        achievements: data.achievements,
                        targets: data.targets
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
                        const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/tracking/daily/${currentUser.id}`);
                        if (historyRes.ok) {
                            const historyData = await historyRes.json();
                            setDailyHistory(historyData.data || []);
                        }
                    } catch (err) { console.error("Error fetching history:", err); }
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
            const user = getUser();
            if (user && user.id) {
                // Check local storage first
                const rawAiData = localStorage.getItem(`aiAnalysisResult_${user.id}`);
                if (rawAiData) {
                    setHasAnalyzed(true);
                    return;
                }
                
                // If not in local storage (e.g. analyzed on mobile), check backend
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/result/${user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.data) {
                            setHasAnalyzed(true);
                            // Simpan ke localstorage agar tidak fetch berulang kali
                            localStorage.setItem(`aiAnalysisResult_${user.id}`, JSON.stringify(data.data));
                        }
                    }
                } catch (e) {
                    console.error("Error checking analysis from backend:", e);
                }
            }
        };
        checkAnalysis();
        fetchPlanData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handlers
    const handleEnroll = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    sleep_target_hours: parseFloat(enrollData.sleep_target_hours),
                    walking_target_minutes: parseInt(enrollData.walking_target_minutes),
                    nutrition_goal: enrollData.nutrition_goal
                })
            });
            if (res.ok) {
                await fetchPlanData();
            } else {
                alert("Gagal enroll program");
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

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    day: planData.day,
                    sleep_hours: dailyInput.tidur ? parseFloat(sleepVal) : null,
                    walking_minutes: dailyInput.langkah ? parseInt(walkVal) : null,
                    nutrition_score: dailyInput.nutrisi ? parseFloat(nutVal) : null
                })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.xp_gained > 0) {
                    setXpGainedPop(data.xp_gained);
                    setShowAnim(true);
                    setTimeout(() => setShowAnim(false), 3000);
                }
                if (data.newAchievements && data.newAchievements.length > 0) {
                    alert(`Achievement Unlocked!\n${data.newAchievements.join("\n")}`);
                }
                await fetchPlanData();
            } else {
                alert(data.message || "Gagal menyimpan data harian");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGlucoseSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/glucose`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    day: planData.day,
                    glucose_value: parseFloat(glucoseInput)
                })
            });
            const data = await res.json();
            if (res.ok) {
                setXpGainedPop(data.xp_gained);
                setShowAnim(true);
                setShowGlucoseSuccess(true);
                setTimeout(() => setShowAnim(false), 3000);
                setTimeout(() => setShowGlucoseSuccess(false), 5000);
                if (data.newAchievements && data.newAchievements.length > 0) {
                    alert(`Achievement Unlocked!\n${data.newAchievements.join("\n")}`);
                }
                setGlucoseInput("");
                await fetchPlanData();
            } else {
                alert(data.message || "Gagal menyimpan data gula darah");
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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUser.id })
            });
            const data = await res.json();
            if (res.ok) {
                setAssessmentResult(data.ai_data || data.computed_stats);
                setShowAssessmentModal(true);
                
                setXpGainedPop(data.xp_gained);
                setShowAnim(true);
                setTimeout(() => setShowAnim(false), 3000);
                if (data.newAchievements && data.newAchievements.length > 0) {
                    alert(`Achievement Unlocked!\n${data.newAchievements.join("\n")}`);
                }
                await fetchPlanData();
            } else {
                alert(data.message || "Gagal menjalankan evaluasi");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressPercent = Math.round((planData.day / 90) * 100);
    const xpPercent = Math.round(( (500 - planData.xpToNextLevel) / 500) * 100);
    
    // Tampilkan input gula darah setiap saat agar pengguna bisa mencatat kapan saja
    const showGlucoseInput = true; 
    
    const showAssessment30 = planData.day >= 30;
    const showAssessment90 = planData.day >= 90;

    const renderAssessmentCards = (dataObj) => {
        if (!dataObj || typeof dataObj !== 'object') {
            return <p className="text-gray-800">{String(dataObj)}</p>;
        }
        if (Array.isArray(dataObj)) {
            return <p className="text-gray-800">{dataObj.join(", ")}</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(dataObj).map(([key, value]) => {
                    if (key === "user_id") return null;
                    let displayVal = value;
                    if (typeof value === 'number') {
                        displayVal = value % 1 === 0 ? value : value.toFixed(2);
                    } else if (typeof value === 'object') {
                        displayVal = JSON.stringify(value);
                    }
                    return (
                        <div key={key} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-center">
                            <span className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-lg font-bold text-[#0072CE] break-words">{displayVal}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50 relative">
            {showAnim && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-lg animate-bounce z-50 flex items-center gap-2">
                    ✓ +{xpGainedPop} XP Berhasil Ditambahkan!
                </div>
            )}
            
            {showGlucoseSuccess && (
                <div className="fixed bottom-10 right-10 bg-white/95 backdrop-blur-xl border border-white/50 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 transform transition-all duration-500 flex items-center p-4 gap-4 pr-6 min-w-[320px] animate-[slideIn_0.5s_ease-out]">
                    <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
                        
                        <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-40 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full w-12 h-12 flex items-center justify-center shadow-inner border border-emerald-300/30">
                            <span className="material-symbols-outlined text-white text-[28px]">done</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-extrabold text-gray-800 text-base tracking-tight mb-0.5">Berhasil Dicatat!</h4>
                        <p className="text-[13px] text-gray-500 font-medium leading-snug">Data gula darah hari ini telah masuk ke evaluasi AI.</p>
                    </div>
                    <button onClick={() => setShowGlucoseSuccess(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50/50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors ml-2">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}

            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                <HeaderAnalisis
                    title="Rencana 90 Hari"
                    subtitle="Pantau intervensi metabolik harianmu"
                />

                <div className="px-8 lg:px-12 py-8 space-y-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0072CE]"></div>
                        </div>
                    ) : !hasAnalyzed ? (
                        <div className="max-w-3xl mx-auto mt-8">
                            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 text-center relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg shadow-orange-500/30 transform rotate-3">
                                        <span className="material-symbols-outlined text-[40px]">health_and_safety</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight mb-4">
                                        Analisis Risiko Diperlukan
                                    </h2>
                                    <p className="text-gray-500 text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
                                        Sebelum dapat memulai Program Intervensi 90 Hari, Anda harus menyelesaikan "Cek Risiko" terlebih dahulu. Hasil analisis akan digunakan oleh AI untuk menyesuaikan parameter program dengan kondisi metabolik Anda.
                                    </p>
                                    <button onClick={() => navigate('/analisis')} className="px-8 py-4 bg-gradient-to-r from-[#0072CE] to-[#3E97FF] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
                                        Mulai Cek Risiko Sekarang
                                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : !isEnrolled ? (
                        <div className="max-w-3xl mx-auto mt-8">
                            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 overflow-hidden relative">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0072CE]/10 to-[#3E97FF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-teal-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                                <div className="relative z-10 flex flex-col items-center text-center mb-10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#0072CE] to-[#3E97FF] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-[40px]">rocket_launch</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                        Mulai Program 90 Hari
                                    </h2>
                                    <p className="text-gray-500 max-w-lg mx-auto text-base md:text-lg">
                                        Tentukan target kesehatan Anda sebelum memulai program intervensi metabolik ini. Komitmen kecil setiap hari akan membawa perubahan besar!
                                    </p>
                                </div>
                                
                                <form onSubmit={handleEnroll} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                                <span className="material-symbols-outlined text-[#0072CE] text-[20px]">bedtime</span>
                                                Target Tidur
                                            </label>
                                            <div className="relative">
                                                <input required type="number" step="0.1" value={enrollData.sleep_target_hours} onChange={(e) => setEnrollData({...enrollData, sleep_target_hours: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20 focus:border-[#0072CE] text-gray-800 transition-all font-medium" placeholder="Contoh: 7.5" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">Jam</span>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                                <span className="material-symbols-outlined text-emerald-500 text-[20px]">directions_walk</span>
                                                Target Jalan
                                            </label>
                                            <div className="relative">
                                                <input required type="number" value={enrollData.walking_target_minutes} onChange={(e) => setEnrollData({...enrollData, walking_target_minutes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-16 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800 transition-all font-medium" placeholder="Contoh: 45" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">Menit</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                            <span className="material-symbols-outlined text-orange-500 text-[20px]">restaurant</span>
                                            Tujuan Nutrisi Utama
                                        </label>
                                        <div className="relative">
                                            <input required type="text" value={enrollData.nutrition_goal} onChange={(e) => setEnrollData({...enrollData, nutrition_goal: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-800 transition-all font-medium" placeholder="Contoh: Kurangi Gula & Karbohidrat" />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full py-4 text-lg mt-8 bg-gradient-to-r from-[#0072CE] to-[#3E97FF] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Menyimpan...
                                            </span>
                                        ) : (
                                            <>
                                                Mulai Program Sekarang
                                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <>
                            <StatsCard 
                                fromColor="from-[#0072CE]"
                                toColor="to-[#3E97FF]" 
                            />

                            <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="relative w-20 h-20">
                                            <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                                            <div className="absolute inset-0 rounded-full" style={{background: `conic-gradient(#0072CE 0% ${progressPercent}%, #E5E7EB ${progressPercent}% 100%)`}}/>
                                            <div className="absolute inset-[6px] bg-white rounded-full flex flex-col items-center justify-center">
                                                <span className="text-sm font-bold text-gray-800">{progressPercent}%</span>
                                                <span className="text-[10px] text-gray-400">selesai</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-800">Intervensi 90 Hari</p>
                                            <p className="text-sm text-gray-500">Hari ke-{planData.day} dari 90</p>
                                            <p className="text-xs text-[#0072CE] mt-1">{90 - planData.day} hari tersisa - Fase {planData.day <= 30 ? 1 : planData.day <= 60 ? 2 : 3}/3</p>
                                        </div>
                                    </div>

                                    <Button variant="primary" onClick={() => navigate("/evaluasi")}>
                                        Evaluasi
                                    </Button>
                                </div>

                                <div className="mt-5">
                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                        <div className="h-2 bg-[#0072CE] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{progressPercent}%</p>
                                </div>
                            </div>

                            <div className="mt-6 pl-4">
                                <h3 className="font-semibold text-gray-800 mb-4">Fase Intervensi</h3>

                                <div className="space-y-4">
                                    <FaseIntervensi currentDay={planData.day} />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-800">Level & XP</h3>
                                    <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                                        ⚡ Level {planData.level}
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
                                </div>

                                <div className="flex justify-between text-xs mt-2">
                                    <span className="text-gray-400">{planData.xp} / {(planData.xp + planData.xpToNextLevel)} XP</span>
                                    <span className="text-orange-500">{planData.xpToNextLevel} XP lagi ke level {planData.level + 1}</span>
                                </div>
                            </div>  

                            {/* Tracking Harian - Dipindahkan ke bawah Level & XP */}
                            <div>
                                <div className="flex justify-between items-center mb-4 mt-6">
                                    <h2 className="font-semibold text-gray-800 mt-2 pl-4">Target hari ini</h2>
                                    <span className="text-sm text-[#0072CE]">Hari {planData.day}</span>
                                </div>

                                <div className="mt-4">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-medium text-gray-800">Tracking Harian</p>
                                            {planData.todayTracking && (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                    ✓ Terekam
                                                </span>
                                            )}
                                        </div>
                                        <form onSubmit={handleDailySubmit} className="space-y-3">
                                            {/* Item Tidur */}
                                            <div 
                                                onClick={() => { if (!isCompletedToday) setDailyInput({...dailyInput, tidur: !dailyInput.tidur}) }}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-200 cursor-pointer ${
                                                dailyInput.tidur ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-gray-200'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" checked={dailyInput.tidur} readOnly className="sr-only peer" disabled={isCompletedToday} />
                                                        <div className="w-5 h-5 bg-white border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-500"></div>
                                                    </div>
                                                    <span className={`text-xl ${dailyInput.tidur ? 'opacity-50 line-through' : ''}`}>😴</span>
                                                    <span className={`text-sm ${dailyInput.tidur ? 'opacity-50 line-through' : 'text-gray-700'}`}>Tidur Sesuai Target ({planData.targets?.sleep || 7.5} Jam)</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600 ${dailyInput.tidur ? 'scale-105 ring-2 ring-green-200' : ''}`}>+10 XP</span>
                                            </div>

                                            {/* Item Langkah */}
                                            <div 
                                                onClick={() => { if (!isCompletedToday) setDailyInput({...dailyInput, langkah: !dailyInput.langkah}) }}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-200 cursor-pointer ${
                                                dailyInput.langkah ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-gray-200'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" checked={dailyInput.langkah} readOnly className="sr-only peer" disabled={isCompletedToday} />
                                                        <div className="w-5 h-5 bg-white border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-500"></div>
                                                    </div>
                                                    <span className={`text-xl ${dailyInput.langkah ? 'opacity-50 line-through' : ''}`}>🏃‍♀️</span>
                                                    <span className={`text-sm ${dailyInput.langkah ? 'opacity-50 line-through' : 'text-gray-700'}`}>Aktivitas Berjalan ({planData.targets?.walking || 30} Menit)</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 ${dailyInput.langkah ? 'scale-105 ring-2 ring-green-200' : ''}`}>+10 XP</span>
                                            </div>

                                            {/* Item Nutrisi */}
                                            <div 
                                                onClick={() => { if (!isCompletedToday) setDailyInput({...dailyInput, nutrisi: !dailyInput.nutrisi}) }}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-200 cursor-pointer ${
                                                dailyInput.nutrisi ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-gray-200'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" checked={dailyInput.nutrisi} readOnly className="sr-only peer" disabled={isCompletedToday} />
                                                        <div className="w-5 h-5 bg-white border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-500"></div>
                                                    </div>
                                                    <span className={`text-xl ${dailyInput.nutrisi ? 'opacity-50 line-through' : ''}`}>🥗</span>
                                                    <span className={`text-sm ${dailyInput.nutrisi ? 'opacity-50 line-through' : 'text-gray-700'}`}>Mencapai Target Nutrisi</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 ${dailyInput.nutrisi ? 'scale-105 ring-2 ring-green-200' : ''}`}>+10 XP</span>
                                            </div>

                                            {isCompletedToday ? (
                                                <div className="w-full text-center mt-6 px-8 py-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200">
                                                    Tugas Hari Ini Selesai
                                                </div>
                                            ) : (
                                                <button type="submit" disabled={isSubmitting} className="w-full mt-6 px-8 py-3 bg-[#0072CE] text-white font-bold rounded-xl hover:bg-[#005ea6] transition-colors">
                                                    {isSubmitting ? "Menyimpan..." : "Selesaikan Hari Ini"}
                                                </button>
                                            )}
                                        </form>

                                        {/* Glucose Input conditionally shown */}
                                        {showGlucoseInput && (
                                            <div className="mt-8 bg-white rounded-[24px] p-6 sm:p-8 border border-rose-100/50 shadow-[0_8px_30px_rgb(225,29,72,0.04)] relative overflow-hidden">
                                                {/* Dekorasi Background */}
                                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                                                
                                                <div className="relative z-10">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100/50 flex items-center justify-center border border-rose-100/50">
                                                                <span className="material-symbols-outlined text-rose-500 text-2xl">water_drop</span>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <h3 className="text-lg font-extrabold text-gray-800 tracking-tight">Cek Gula Darah</h3>
                                                                    {planData.day > 0 && planData.day % 14 === 0 && (
                                                                        <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                                                                            Cek Berkala!
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500 font-medium">Opsional, disarankan rutin setiap 14 hari</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-[13px] text-gray-500 leading-relaxed mb-6 max-w-2xl border-l-2 border-rose-200 pl-3">
                                                        Pencatatan ini fleksibel dan tidak perlu dilakukan setiap hari. Cukup catat saat Anda baru saja melakukan tes mandiri. Semakin banyak riwayat data yang masuk, semakin akurat evaluasi kesehatan dari AI di akhir bulan.
                                                    </p>

                                                    {planData.todayGlucose ? (
                                                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100/50 flex items-center gap-3 w-full sm:w-fit">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                                                            </div>
                                                            <p className="text-sm font-bold">Luar biasa! Gula darah Anda hari ini sudah tersimpan.</p>
                                                        </div>
                                                    ) : (
                                                        <form onSubmit={handleGlucoseSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                                                            <div className="relative flex-1">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <span className="material-symbols-outlined text-gray-400 text-[20px]">monitor_heart</span>
                                                                </div>
                                                                <input 
                                                                    required 
                                                                    type="number" 
                                                                    step="0.1" 
                                                                    value={glucoseInput} 
                                                                    onChange={(e) => setGlucoseInput(e.target.value)} 
                                                                    placeholder="Kadar (mg/dL)" 
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder-gray-400" 
                                                                />
                                                            </div>
                                                            <button 
                                                                type="submit" 
                                                                disabled={isSubmitting} 
                                                                className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                                            >
                                                                {isSubmitting ? (
                                                                    <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                                                                ) : (
                                                                    <>Simpan <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
                                                                )}
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <Button variant="primary" onClick={() => navigate("/pencapaian")}>
                                        Lihat Pencapaian
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-8">
                                <ActivityChart dailyData={dailyHistory} currentDay={planData.day} />
                            </div>

                            <div
                                onClick={() => navigate("/analisis")}
                                className="flex items-center justify-between border border-yellow-300 bg-yellow-50 rounded-xl px-4 py-3 mt-4 cursor-pointer hover:bg-yellow-100 transition mb-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-200 text-yellow-600">
                                        ⟳
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            Cek ulang risiko
                                        </p>
                                        <p className="text-xs text-yellow-600">
                                            Cek ulang untuk memperbaharui data
                                        </p>
                                    </div>
                                </div>
                                <span className="text-yellow-600 text-lg">›</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}