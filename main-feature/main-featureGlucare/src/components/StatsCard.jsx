import { useState, useEffect } from "react";

export default function StatsCard({ fromColor, toColor }) {
    const [statsData, setStatsData] = useState({
        streak: 0,
        level: 1,
        achievements: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser"));
                if (!user || !user.id) return;
                
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plan/${user.id}`);
                const data = await res.json();
                if (res.ok && data.enrolled) {
                    setStatsData({
                        streak: data.currentStreak || 0,
                        level: data.level || 1,
                        achievements: data.achievements ? data.achievements.length : 0
                    });
                }
            } catch (error) {
                console.error("Gagal mengambil data stats:", error);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { id:1, icon:"🔥", value:`${statsData.streak} hari`, label:"Streak" },
        { id:2, icon:"⚡", value:statsData.level, label:"Level" },
        { id:3, icon:"🏅", value:statsData.achievements, label:"Pencapaian" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map(item => (
                <div
                    key={item.id}
                    className={`bg-gradient-to-br ${fromColor} ${toColor} text-white rounded-2xl p-5 shadow-md transform hover:-translate-y-1 transition-transform duration-300`}
                >
                    <div className="text-2xl mb-2 drop-shadow-sm">{item.icon}</div>
                    <p className="text-3xl font-extrabold tracking-tight">{item.value}</p>
                    <p className="text-sm opacity-90 mt-1 font-medium">{item.label}</p>
                </div>
            ))}
        </div>
    );
}