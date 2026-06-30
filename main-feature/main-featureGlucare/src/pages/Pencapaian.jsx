import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderEvaluasiPencapaian from "../components/HeaderEvaluasiPencapaian";
import StatsCard from "../components/StatsCard";
import AchivementCard from "../components/AchievementCard";
import { useSidebar } from "../hooks/useSidebar";
import BelumDiraih from "../components/BelumDiraih";

const ALL_ACHIEVEMENTS = [
    { id: "FIRST_STEP", icon: "⭐", title: "First Step", description: "Lakukan pelacakan harian pertama", xp: 50 },
    { id: "GLUCOSE_TRACKER", icon: "🩸", title: "Glucose Tracker", description: "Masukan data gula darah pertama", xp: 50 },
    { id: "STREAK_7", icon: "🔥", title: "Week Warrior", description: "Aktif 7 hari berturut-turut", xp: 100 },
    { id: "STREAK_14", icon: "💪", title: "Consistency Master", description: "Aktif 14 hari berturut-turut", xp: 200 },
    { id: "STREAK_30", icon: "🏆", title: "Monthly Master", description: "Aktif 30 hari berturut-turut", xp: 500 },
    { id: "LEVEL_5", icon: "🌟", title: "Level 5 Achiever", description: "Mencapai Level 5", xp: 300 },
    { id: "LEVEL_10", icon: "👑", title: "Level 10 Master", description: "Mencapai Level 10", xp: 500 },
    { id: "PROGRAM_COMPLETED", icon: "🚀", title: "Program Completed", description: "Menyelesaikan program 90 Hari", xp: 1000 },
];

export default function Evaluasi() {
    const { isOpen } = useSidebar();
    const [userAchievements, setUserAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser"));
                if (!user || !user.id) return;
                
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/${user.id}`);
                const data = await res.json();
                if (res.ok && data.achievements) {
                    setUserAchievements(data.achievements);
                }
            } catch (error) {
                console.error("Gagal mengambil data pencapaian:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    const earned = ALL_ACHIEVEMENTS.filter(a => userAchievements.includes(a.id));
    const locked = ALL_ACHIEVEMENTS.filter(a => !userAchievements.includes(a.id));

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                <HeaderEvaluasiPencapaian
                    title="Pencapaian"
                    subtitle="Pantau intervensi metabolik harianmu"
                />
                <div className="px-8 lg:px-12 py-8 space-y-12">
                    <StatsCard 
                        fromColor="from-[#0072CE]" 
                        toColor="to-[#3E97FF]" />

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#0072CE]"></div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Section: Diraih */}
                            <section>
                                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                                        <span className="material-symbols-outlined">workspace_premium</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                                            Pencapaian Diraih
                                        </h2>
                                        <p className="text-sm text-gray-500">Anda telah mengumpulkan <span className="font-bold text-green-500">{earned.length}</span> lencana</p>
                                    </div>
                                </div>

                                {earned.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                                        {earned.map((item) => (
                                            <AchivementCard key={item.id} {...item} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center">
                                        <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-gray-300 text-4xl mb-4 shadow-sm">
                                            <span className="material-symbols-outlined text-[40px]">lock_clock</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada pencapaian</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">Selesaikan tugas harian dan raih target Anda untuk membuka berbagai lencana eksklusif di sini.</p>
                                    </div>
                                )}
                            </section>

                            {/* Section: Belum Diraih */}
                            <section>
                                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                                            Lencana Terkunci
                                        </h2>
                                        <p className="text-sm text-gray-500">Ada <span className="font-bold text-gray-700">{locked.length}</span> lencana menanti Anda</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {locked.map((item) => (
                                        <BelumDiraih key={item.id} {...item} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}