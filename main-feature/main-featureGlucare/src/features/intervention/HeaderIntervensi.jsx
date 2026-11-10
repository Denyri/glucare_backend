import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function HeaderIntervensi() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [currentDay, setCurrentDay] = useState(1);

    useEffect(() => {
        if (!user?.id) return;
        api.get(`/api/plan/${user.id}`)
            .then((res) => {
                if (res.data?.day) setCurrentDay(res.data.day);
            })
            .catch(() => {});
    }, [user?.id]);

    const phases = [
        {
            label: "Fase 1: Stabilisasi",
            path: "/stabilisasi",
            number: 1,
            range: "Hari 1-30",
        },
        {
            label: "Fase 2: Optimasi",
            path: "/optimasi",
            number: 2,
            range: "Hari 31-60",
        },
        {
            label: "Fase 3: Konsolidasi",
            path: "/konsolidasi",
            number: 3,
            range: "Hari 61-90",
        },
    ];

    const getPhaseStatus = (phaseNumber) => {
        if (currentDay >= 1 && currentDay <= 30) {
            if (phaseNumber === 1) return { text: "Fase Aktif Saat Ini", bg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30" };
            return { text: "Fase Berikutnya", bg: "bg-white/10 text-white/70 border-white/10" };
        }
        if (currentDay >= 31 && currentDay <= 60) {
            if (phaseNumber === 1) return { text: "Selesai", bg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30" };
            if (phaseNumber === 2) return { text: "Fase Aktif Saat Ini", bg: "bg-amber-400/20 text-amber-200 border-amber-400/30" };
            return { text: "Fase Berikutnya", bg: "bg-white/10 text-white/70 border-white/10" };
        }
        if (currentDay >= 61) {
            if (phaseNumber < 3) return { text: "Selesai", bg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30" };
            return { text: "Fase Aktif Saat Ini", bg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30" };
        }
        return { text: "Fase Terjadwal", bg: "bg-white/10 text-white/70 border-white/10" };
    };

    const phaseConfig = {
        "/stabilisasi": {
            gradient: "from-blue-900 via-[#0062E3] to-cyan-700",
            title: "Stabilisasi Dasar",
            subtitle: "Bangun fondasi metabolik, eliminasi gula tambahan, dan atur ritme sirkadian tubuh.",
            day: "Fase 1 · Hari 1–30",
            badgeColor: "text-blue-100",
            icon: "water_drop",
            primaryColor: "#0062E3"
        },
        "/optimasi": {
            gradient: "from-purple-950 via-purple-700 to-indigo-800",
            title: "Optimasi Metabolik",
            subtitle: "Tingkatkan stimulasi transporter GLUT4 otot rangka melalui latihan kekuatan dan pengetatan beban glikemik.",
            day: "Fase 2 · Hari 31–60",
            badgeColor: "text-purple-100",
            icon: "fitness_center",
            primaryColor: "#7C3AED"
        },
        "/konsolidasi": {
            gradient: "from-emerald-950 via-teal-800 to-cyan-900",
            title: "Konsolidasi & Retensi",
            subtitle: "Kunci homeostasis metabolik jangka panjang, bangun fleksibilitas metabolik, dan cegah kekambuhan secara otonom.",
            day: "Fase 3 · Hari 61–90",
            badgeColor: "text-emerald-100",
            icon: "verified_user",
            primaryColor: "#059669"
        },
    };

    const currentConfig = phaseConfig[location.pathname] || phaseConfig["/stabilisasi"];
    const currentPhase = phases.find((phase) => phase.path === location.pathname) || phases[0];
    const status = getPhaseStatus(currentPhase.number);

    return (
        <div className={`relative bg-gradient-to-r ${currentConfig.gradient} text-white px-6 sm:px-10 py-8 lg:py-10 overflow-hidden shadow-lg`}>
            {/* Background Glow Overlay */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Top Nav & Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate("/rencana")}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/15 transition-all"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Kembali ke Rencana 90 Hari
                    </button>

                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md ${status.bg}`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {status.text}
                    </div>
                </div>

                {/* Title & Info */}
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/20 text-xs font-semibold text-white/90 mb-3 border border-white/10 font-mono">
                        <span className="material-symbols-outlined text-[15px]">{currentConfig.icon}</span>
                        {currentConfig.day} · Hari Pengguna ke-{currentDay}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight leading-tight">
                        {currentConfig.title}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-white/85 leading-relaxed font-normal">
                        {currentConfig.subtitle}
                    </p>
                </div>

                {/* Phase Switcher Tabs */}
                <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 p-1.5 bg-black/20 backdrop-blur-md rounded-2xl w-fit border border-white/15">
                    {phases.map((phase) => {
                        const isActive = location.pathname === phase.path;
                        return (
                            <button
                                key={phase.number}
                                onClick={() => navigate(phase.path)}
                                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    isActive
                                        ? "bg-white text-slate-900 shadow-md scale-100"
                                        : "text-white/80 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                                    isActive ? "bg-slate-900 text-white" : "bg-white/20 text-white"
                                }`}>
                                    {phase.number}
                                </span>
                                <span>{phase.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default HeaderIntervensi;