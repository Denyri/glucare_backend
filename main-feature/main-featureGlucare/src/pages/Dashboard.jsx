import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/Profile.jpg"
import { useSidebar } from "../hooks/useSidebar";
import api from "../api";
import { submitDailyTracking } from "../services/glucareAI";

function Dashboard() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const [riskData, setRiskData] = useState(null);
    const [streak, setStreak] = useState(0);
    const [day, setDay] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentDate, setCurrentDate] = useState("");
    const [tasks, setTasks] = useState({
        tidur: false,
        langkah: false,
        nutrisi: false
    });
    const [isCompletedToday, setIsCompletedToday] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [planTargets, setPlanTargets] = useState(null);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [xpToNextLevel, setXpToNextLevel] = useState(100);

    useEffect(() => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        setCurrentDate(new Date().toLocaleDateString('id-ID', options));
    }, []);

    // Membaca hasil AI dari Database Server (Sinkron antar perangkat)
    useEffect(() => {
        let user = null;
        try {
            const rawUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
            if (rawUser && rawUser !== "undefined") {
                user = JSON.parse(rawUser);
            }
        } catch (e) { console.error(e); }
        
        if (!user || !user.id) return;

        const fetchAiResult = async () => {
            try {
                const res = await api.get(`/api/ai/result/${user.id}`);
                const parsed = res.data;
                const aiRes = parsed.aiResult;
                
                if (aiRes) {
                    const proba = aiRes.predict_proba || [0,0,0];
                    // Skor risiko = peluang prediabetes + peluang diabetes
                    const score = Math.round((proba[1] + proba[2]) * 100);
                    
                    const aiRiskLevel = aiRes.risk_level || "Diabetes";
                    
                    let risk = "Risiko Tinggi";
                    let status = "Indikasi Diabetes";
                    
                    if (aiRiskLevel === "Normal" || aiRiskLevel === "low") {
                        risk = "Aman";
                        status = "Kondisi Normal";
                    } else if (aiRiskLevel === "Prediabetes" || aiRiskLevel === "medium") {
                        risk = "Risiko Sedang";
                        status = "Indikasi Prediabetes";
                    } else if (aiRiskLevel === "high" || aiRiskLevel === "Diabetes") {
                        risk = "Risiko Tinggi";
                        status = "Indikasi Diabetes";
                    }

                    // Score calculation handling both modes
                    let finalScore = score;
                    if (parsed.mode === "questionnaire") {
                        if (aiRiskLevel === "low") finalScore = 25;
                        else if (aiRiskLevel === "medium") finalScore = 55;
                        else if (aiRiskLevel === "high") finalScore = 85;
                    }

                    setRiskData({ score: finalScore, risk, status });
                }
            } catch (err) {
                console.log("Mencoba fallback ke local storage jika ada");
                const rawAiData = localStorage.getItem(`aiAnalysisResult_${user.id}`);
                if (rawAiData) {
                    try {
                        const parsed = JSON.parse(rawAiData);
                        const aiRes = parsed.aiResult;
                        if (aiRes) {
                            const proba = aiRes.predict_proba || [0,0,0];
                            const score = Math.round((proba[1] + proba[2]) * 100);
                            
                            const aiRiskLevel = aiRes.risk_level || "Diabetes";
                            
                            let risk = "Risiko Tinggi";
                            let status = "Indikasi Diabetes";
                            
                            if (aiRiskLevel === "Normal" || aiRiskLevel === "low") {
                                risk = "Aman";
                                status = "Kondisi Normal";
                            } else if (aiRiskLevel === "Prediabetes" || aiRiskLevel === "medium") {
                                risk = "Risiko Sedang";
                                status = "Indikasi Prediabetes";
                            } else if (aiRiskLevel === "high" || aiRiskLevel === "Diabetes") {
                                risk = "Risiko Tinggi";
                                status = "Indikasi Diabetes";
                            }

                            let finalScore = score;
                            if (parsed.mode === "questionnaire") {
                                if (aiRiskLevel === "low") finalScore = 25;
                                else if (aiRiskLevel === "medium") finalScore = 55;
                                else if (aiRiskLevel === "high") finalScore = 85;
                            }

                            setRiskData({ score: finalScore, risk, status });
                        }
                    } catch (e) {}
                }
            }
        };

        fetchAiResult();
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const user = JSON.parse(
                localStorage.getItem("currentUser") ||
                sessionStorage.getItem("currentUser")
            );
            
            if (user && user.id) {
                try {
                    const response = await api.get(`/api/auth/profile/${user.id}`);
                    setCurrentUser(response.data);
                    localStorage.setItem("currentUser", JSON.stringify(response.data));
                } catch (error) {
                    console.error("Gagal mengambil data user:", error);
                    setCurrentUser(user);
                }
            }
        };

        getUser();

        window.addEventListener("focus", getUser);
        return () => window.removeEventListener("focus", getUser);       
    }, []);

    // Mengubah status task hanya secara lokal (tidak langsung ke AI)
    const handleToggleTask = (taskName) => {
        if (isCompletedToday) return; // Jangan izinkan ubah jika sudah selesai
        setTasks(prev => ({ ...prev, [taskName]: !prev[taskName] }));
    };

    // Fungsi Submit Harian yang menyamakan dengan Rencana 90 Hari
    const handleDailySubmit = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            const sleepVal = tasks.tidur ? 7.5 : 0;
            const walkVal = tasks.langkah ? 30 : 0;
            const nutVal = tasks.nutrisi ? 85 : 0;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    day: day > 0 ? day : 1,
                    sleep_hours: tasks.tidur ? parseFloat(sleepVal) : null,
                    walking_minutes: tasks.langkah ? parseInt(walkVal) : null,
                    nutrition_score: tasks.nutrisi ? parseFloat(nutVal) : null
                })
            });
            const data = await res.json();
            if (res.ok) {
                setIsCompletedToday(true);
                // Sinkronisasi AI
                submitDailyTracking({
                    user_id: currentUser.id,
                    day: day > 0 ? day : 1,
                    sleep_hours: tasks.tidur ? 7.5 : 0,
                    walking_minutes: tasks.langkah ? 30 : 0,
                    nutrition_score: tasks.nutrisi ? 72 : 0
                }).catch(e => console.error("Gagal sync tracking harian ke AI:", e));

                // Refresh data XP, Level, dan Streak secara instan tanpa reload halaman
                try {
                    const planRes = await api.get(`/api/plan/${currentUser.id}`);
                    if (planRes.data.enrolled) {
                        setStreak(planRes.data.currentStreak);
                        setLevel(planRes.data.level || 1);
                        setXp(planRes.data.xp || 0);
                        setXpToNextLevel(planRes.data.xpToNextLevel || 100);
                    }
                } catch (err) {
                    console.error("Gagal refresh plan data otomatis", err);
                }

            } else {
                alert(data.message || "Gagal menyimpan data harian");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hour = new Date().getHours();
    let greeting = "Selamat Pagi";
    if (hour >= 12 && hour < 15) greeting = "Selamat Siang";
    else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
    else if (hour >= 18) greeting = "Selamat Malam";

    // Fetch Plan Data untuk Day dan Streak
    useEffect(() => {
        const fetchPlanData = async () => {
            const user = JSON.parse(
                localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
            );
            if (user && user.id) {
                try {
                    const res = await api.get(`/api/plan/${user.id}`);
                    setIsEnrolled(res.data.enrolled);
                    if (res.data.enrolled) {
                        setDay(res.data.day);
                        setStreak(res.data.currentStreak);
                        setLevel(res.data.level || 1);
                        setXp(res.data.xp || 0);
                        setXpToNextLevel(res.data.xpToNextLevel || 100);
                        setPlanTargets(res.data.targets);
                        if (res.data.todayTracking) {
                            setIsCompletedToday(true);
                            setTasks({
                                tidur: !!res.data.todayTracking.sleep_hours,
                                langkah: !!res.data.todayTracking.walking_minutes,
                                nutrisi: !!res.data.todayTracking.nutrition_score
                            });
                        } else {
                            setIsCompletedToday(false);
                            setTasks({
                                tidur: false,
                                langkah: false,
                                nutrisi: false
                            });
                        }
                    }
                } catch (e) {
                    console.error("Gagal mengambil data plan 90 hari", e);
                }
            }
        };
        fetchPlanData();

        // Tambahkan listener agar saat user buka HP/Aplikasi lagi dari background, data plan langsung ter-refresh
        window.addEventListener("focus", fetchPlanData);
        return () => window.removeEventListener("focus", fetchPlanData);
    }, []);

    // Tentukan warna berdasarkan risiko
    const getRiskStyles = () => {
        if (!riskData) return { 
            bg: "bg-gradient-to-br from-[#0072CE] to-[#003A68] text-white shadow-indigo-500/20", 
            btnText: "text-indigo-600" 
        };
        if (riskData.risk === "Risiko Tinggi") return { 
            bg: "bg-gradient-to-br from-red-600 to-rose-500 text-white shadow-red-500/30", 
            btnText: "text-red-600" 
        };
        if (riskData.risk === "Risiko Sedang") return { 
            bg: "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/30", 
            btnText: "text-orange-600" 
        };
        return { 
            bg: "bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-emerald-500/30", 
            btnText: "text-emerald-700" 
        };
    };

    const riskStyles = getRiskStyles();
    return (
        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
            <Sidebar />

            <div className="flex-1 p-4 sm:p-6 lg:ml-8 lg:p-6">
                <div className="max-w-5xl mx-auto w-full">
                    
                    
                    <div className="flex items-center gap-3 mb-6 lg:mb-8">
                        <img src={currentUser?.profile_image ? `${import.meta.env.VITE_API_URL}${currentUser.profile_image}` : defaultAvatar} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"/>
                        <div className="min-w-0">
                            <p className="text-sm text-gray-500 hidden sm:block">
                                {greeting}
                            </p>

                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 truncate">
                                Halo, {currentUser?.fullname || "User"}👋
                            </h2>
                        </div>
                    </div>

                    
                    <div className={`mt-6 sm:mt-10 max-w-5xl w-full ${riskStyles.bg} p-6 sm:p-8 lg:p-10 rounded-[24px] shadow-xl transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden`}>
                        {/* Decorative Background Glow */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/5 rounded-full blur-2xl pointer-events-none"></div>

                        {/* Kiri: Teks & Info */}
                        <div className="w-full md:w-auto flex-1 relative z-10 text-center md:text-left">
                            <p className="text-xs sm:text-sm opacity-90 font-bold tracking-widest uppercase mb-2">Status Kesehatan Anda</p>
                            
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-2 tracking-tight drop-shadow-sm">
                                {riskData ? riskData.status : "Belum dievaluasi"}
                            </h3>

                            <p className="text-sm sm:text-base mt-4 opacity-90 leading-relaxed max-w-lg font-medium mx-auto md:mx-0">
                                Pantau dan lakukan penilaian secara berkala untuk mengetahui potensi risiko prediabetes dan menjaga kesehatan Anda.
                            </p>
                        </div>

                        {/* Kanan: Skor Raksasa & Tombol */}
                        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-6 relative z-10 border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-10">
                            {riskData ? (
                                <div className="text-center md:text-right">
                                    <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Skor Risiko</p>
                                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none drop-shadow-lg tracking-tighter">
                                        {riskData.score}<span className="text-3xl sm:text-4xl opacity-70 ml-1">%</span>
                                    </h1>
                                </div>
                            ) : null}

                            <button 
                                onClick={() => navigate(riskData ? "/hasil" : "/analisis")}
                                className={`w-full md:w-auto bg-white ${riskStyles.btnText} font-extrabold py-3.5 px-8 text-sm sm:text-base rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2`}
                            >
                                {riskData ? "Lihat Detail Analisis" : "Cek Risiko Sekarang"}
                                <span className="material-symbols-outlined text-[20px]">{riskData ? "query_stats" : "arrow_forward"}</span>
                            </button>
                        </div>
                    </div>

                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 max-w-5xl w-full">
                        {/* Streak Card */}
                        <div className="bg-white rounded-2xl shadow-sm sm:shadow-md p-4 sm:p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <span className="text-xl">🔥</span>
                                <h3 className="text-gray-700 font-medium text-sm sm:text-base">Streak</h3>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{streak}</h1>

                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Hari Aktif</p>

                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
                                <div
                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Level Card */}
                        <div className="bg-white rounded-2xl shadow-sm sm:shadow-md p-4 sm:p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <span className="text-xl">⚡</span>
                                <h3 className="text-gray-700 font-medium text-sm sm:text-base">Level</h3>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{level}</h1>

                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs sm:text-sm text-gray-500">XP: {xp}</p>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
                                <div
                                    className="bg-gradient-to-r from-orange-400 to-amber-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((xp / (xp + xpToNextLevel)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Intervensi Card */}

                        <div className="bg-white rounded-2xl shadow-sm sm:shadow-md p-4 sm:p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <span className="text-xl">📈</span>
                                <h3 className="text-gray-700 font-medium text-sm sm:text-base">Intervensi</h3>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{day}/90</h1>

                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Hari</p>

                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-[#0072CE] h-1.5 sm:h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((day / 90) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tracking Harian */}
                    {isEnrolled && (
                        <div className="mt-8 max-w-5xl w-full">
                            <div className="flex justify-between items-center mb-4 pl-2">
                                <h2 className="font-semibold text-gray-800 text-lg">Target hari ini</h2>
                                <span className="text-sm font-bold text-[#0072CE]">Hari {day}</span>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex justify-end items-center mb-6">
                                    {isCompletedToday && (
                                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold">
                                            ✓ Tersimpan
                                        </span>
                                    )}
                                </div>
                                
                                <form onSubmit={handleDailySubmit} className="space-y-4">
                                    {/* Item Tidur */}
                                    <div 
                                        onClick={() => handleToggleTask('tidur')}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                        tasks.tidur ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-gray-300'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={tasks.tidur} readOnly className="sr-only peer" disabled={isCompletedToday} />
                                                <div className="w-6 h-6 bg-white border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-500 flex items-center justify-center transition-colors">
                                                    {tasks.tidur && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-2xl ${tasks.tidur ? 'opacity-50 grayscale' : ''}`}>😴</span>
                                                <span className={`text-sm sm:text-base font-medium ${tasks.tidur ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    Tidur Sesuai Target ({planTargets?.sleep || 7.5} Jam)
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-600 ${tasks.tidur ? 'opacity-50' : ''}`}>+10 XP</span>
                                    </div>

                                    {/* Item Langkah */}
                                    <div 
                                        onClick={() => handleToggleTask('langkah')}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                        tasks.langkah ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-gray-300'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={tasks.langkah} readOnly className="sr-only peer" disabled={isCompletedToday} />
                                                <div className="w-6 h-6 bg-white border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-500 flex items-center justify-center transition-colors">
                                                    {tasks.langkah && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-2xl ${tasks.langkah ? 'opacity-50 grayscale' : ''}`}>🚶</span>
                                                <span className={`text-sm sm:text-base font-medium ${tasks.langkah ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    Aktivitas Harian ({planTargets?.walking || 30} Menit)
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-600 ${tasks.langkah ? 'opacity-50' : ''}`}>+20 XP</span>
                                    </div>

                                    {/* Item Nutrisi */}
                                    <div 
                                        onClick={() => handleToggleTask('nutrisi')}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                        tasks.nutrisi ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-gray-300'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={tasks.nutrisi} readOnly className="sr-only peer" disabled={isCompletedToday} />
                                                <div className="w-6 h-6 bg-white border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-500 flex items-center justify-center transition-colors">
                                                    {tasks.nutrisi && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-2xl ${tasks.nutrisi ? 'opacity-50 grayscale' : ''}`}>🥗</span>
                                                <span className={`text-sm sm:text-base font-medium ${tasks.nutrisi ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    Makan Sehat (Sesuai Target)
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-600 ${tasks.nutrisi ? 'opacity-50' : ''}`}>+20 XP</span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="w-full mt-6 bg-gradient-to-r from-[#0072CE] to-[#3E97FF] hover:from-[#005ea6] hover:to-[#0072CE] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                        disabled={isCompletedToday || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Menyimpan...
                                            </>
                                        ) : isCompletedToday ? (
                                            <>
                                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                Selesai untuk Hari Ini
                                            </>
                                        ) : (
                                            "Simpan Progress Harian"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
