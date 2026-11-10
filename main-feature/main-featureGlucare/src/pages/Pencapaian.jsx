import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderEvaluasiPencapaian from "../components/HeaderEvaluasiPencapaian";
import StatsCard from "../components/StatsCard";
import AchivementCard from "../components/AchievementCard";
import { useSidebar } from "../hooks/useSidebar";
import BelumDiraih from "../components/BelumDiraih";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    Droplets,
    Flame,
    Activity,
    Trophy,
    Zap,
    Award,
    ShieldCheck,
    ArrowLeft,
    Lock
} from "lucide-react";

const ALL_ACHIEVEMENTS = [
    { id: "FIRST_STEP", icon: Sparkles, title: "First Step", description: "Lakukan pelacakan protokol harian pertama kali", xp: 50, tier: "Bronze" },
    { id: "GLUCOSE_TRACKER", icon: Droplets, title: "Glucose Tracker", description: "Masukkan data gula darah puasa (GDP) pertama", xp: 50, tier: "Bronze" },
    { id: "STREAK_7", icon: Flame, title: "Week Warrior", description: "Pertahankan kepatuhan 7 hari berturut-turut", xp: 100, tier: "Silver" },
    { id: "STREAK_14", icon: Activity, title: "Consistency Master", description: "Pertahankan kepatuhan 14 hari berturut-turut", xp: 200, tier: "Silver" },
    { id: "STREAK_30", icon: Trophy, title: "Monthly Master", description: "Selesaikan 30 hari penuh intervensi Fase 1", xp: 500, tier: "Gold" },
    { id: "LEVEL_5", icon: Zap, title: "Level 5 Achiever", description: "Mencapai Tingkat Metabolik Level 5", xp: 300, tier: "Gold" },
    { id: "LEVEL_10", icon: Award, title: "Level 10 Master", description: "Mencapai Tingkat Metabolik Level 10 Puncak", xp: 500, tier: "Platinum" },
    { id: "PROGRAM_COMPLETED", icon: ShieldCheck, title: "Program Completed", description: "Menuntaskan seluruh 90 Hari Program Intervensi GluCare", xp: 1000, tier: "Platinum" },
];

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Pencapaian() {
    const { isOpen } = useSidebar();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userAchievements, setUserAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await api.get(`/api/plan/${user.id}`);
                const data = res.data;
                const ach = data?.achievements || data?.data?.achievements;
                if (ach) {
                    setUserAchievements(ach);
                }
            } catch (error) {
                console.error("Gagal mengambil data pencapaian:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAchievements();
    }, [user?.id]);

    const earned = ALL_ACHIEVEMENTS.filter((a) => userAchievements.includes(a.id));
    const locked = ALL_ACHIEVEMENTS.filter((a) => !userAchievements.includes(a.id));

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderEvaluasiPencapaian
                    title="Pencapaian & Lencana Klinis"
                    subtitle="Apresiasi konsistensi pembentukan kebiasaan sehat berbasis bukti ilmiah"
                />

                <div className="px-6 sm:px-10 py-8 max-w-6xl mx-auto space-y-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/rencana")}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0062E3] transition-colors group"
                    >
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </div>
                        <span>Kembali ke Rencana 90 Hari</span>
                    </button>

                    {/* Stats Trio */}
                    <StatsCard />

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-purple-600"></div>
                            <p className="text-xs text-slate-500 font-mono">Memuat koleksi lencana...</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Section: Lencana Diraih */}
                            <section>
                                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">
                                            <Award className="w-5 h-5" strokeWidth={2.2} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold font-display text-slate-900">
                                                Lencana Berhasil Diraih
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Anda telah mengumpulkan{" "}
                                                <strong className="text-emerald-700 font-bold">{earned.length}</strong> dari{" "}
                                                {ALL_ACHIEVEMENTS.length} lencana protokol.
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        {Math.round((earned.length / ALL_ACHIEVEMENTS.length) * 100)}% Koleksi
                                    </span>
                                </div>

                                {earned.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {earned.map((item) => (
                                            <AchivementCard key={item.id} {...item} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center shadow-sm">
                                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                                            <Lock className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 mb-1">
                                            Belum Ada Lencana yang Terbuka
                                        </h3>
                                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                            Lakukan pelacakan kepatuhan pertama Anda di menu Rencana 90 Hari untuk membuka lencana "First Step"!
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Section: Lencana Terkunci */}
                            <section>
                                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200/80">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold font-display text-slate-900">
                                            Lencana Menanti Anda
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Tuntaskan target harian untuk membuka lencana eksklusif berikut:
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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