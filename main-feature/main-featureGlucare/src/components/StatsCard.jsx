import { useState, useEffect } from "react";
import { Flame, Zap, Award, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function StatsCard() {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState({
        streak: 0,
        level: 1,
        achievements: 0,
        xp: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/api/plan/${user.id}`);
                const data = res.data;
                if (data && data.enrolled) {
                    setStatsData({
                        streak: data.currentStreak || 0,
                        level: data.level || 1,
                        achievements: data.achievements ? data.achievements.length : 0,
                        xp: data.xp || 0
                    });
                }
            } catch (error) {
                console.error("Gagal mengambil data stats:", error);
            }
        };
        fetchStats();
    }, [user?.id]);

    const cards = [
        {
            id: 1,
            title: "Streak Kepatuhan",
            value: `${statsData.streak}`,
            unit: "Hari",
            subtext: statsData.streak >= 7 ? "Konsistensi tinggi! Pertahankan" : "Catat harian untuk resiliensi metabolik",
            badge: "Protokol Aktif",
            icon: Flame,
            iconClass: "text-amber-500 bg-amber-500/10 ring-1 ring-amber-500/20",
            glowColor: "from-amber-500/10 via-transparent to-transparent",
            metricBar: Math.min((statsData.streak / 7) * 100, 100),
            metricLabel: `${statsData.streak % 7}/7 Siklus Mingguan`,
            barColor: "from-amber-400 to-orange-500"
        },
        {
            id: 2,
            title: "Tingkat Metabolik",
            value: `Level ${statsData.level}`,
            unit: "",
            subtext: `${statsData.xp} Total akumulasi XP`,
            badge: "Sensitivitas GLUT4",
            icon: Zap,
            iconClass: "text-blue-600 bg-blue-500/10 ring-1 ring-blue-500/20",
            glowColor: "from-blue-500/10 via-transparent to-transparent",
            metricBar: Math.min(((statsData.xp % 500) / 500) * 100, 100),
            metricLabel: `${statsData.xp % 500}/500 XP ke Tier Berikutnya`,
            barColor: "from-blue-500 to-indigo-600"
        },
        {
            id: 3,
            title: "Pencapaian Diraih",
            value: `${statsData.achievements}`,
            unit: "Lencana",
            subtext: `${statsData.achievements}/8 Lencana protokol tercapai`,
            badge: "Bukti Klinis",
            icon: Award,
            iconClass: "text-purple-600 bg-purple-500/10 ring-1 ring-purple-500/20",
            glowColor: "from-purple-500/10 via-transparent to-transparent",
            metricBar: Math.min((statsData.achievements / 8) * 100, 100),
            metricLabel: `${Math.round((statsData.achievements / 8) * 100)}% Milestone Lengkap`,
            barColor: "from-purple-500 to-indigo-500"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cards.map((item) => {
                const IconComponent = item.icon;
                return (
                    <div
                        key={item.id}
                        className="group relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/70 via-slate-100 to-slate-200/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
                    >
                        {/* Inner Core Card */}
                        <div className="relative h-full bg-white rounded-[calc(1.5rem-2px)] p-6 overflow-hidden flex flex-col justify-between">
                            {/* Subtle Ambient Radial Glow */}
                            <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${item.glowColor} rounded-full blur-2xl pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity`} />

                            {/* Top Header Row */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.iconClass} transition-transform duration-300 group-hover:scale-105`}>
                                        <IconComponent className="w-5 h-5" strokeWidth={2.2} />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100/90 text-slate-600 border border-slate-200/60">
                                        {item.badge}
                                    </span>
                                </div>

                                {/* Metric Display */}
                                <div className="space-y-0.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight font-mono tabular-nums">
                                            {item.value}
                                        </h3>
                                        {item.unit && (
                                            <span className="text-sm font-semibold text-slate-400 font-sans">
                                                {item.unit}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 tracking-tight">
                                        {item.title}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Metric Progress & Subtext */}
                            <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`bg-gradient-to-r ${item.barColor} h-1.5 rounded-full transition-all duration-700`}
                                        style={{ width: `${Math.max(item.metricBar, 6)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                                    <span className="truncate max-w-[170px]">{item.subtext}</span>
                                    <span className="font-mono text-slate-500 font-semibold text-[10px] shrink-0">
                                        {item.metricLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}