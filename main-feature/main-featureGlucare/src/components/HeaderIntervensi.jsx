import { useNavigate, useLocation } from "react-router-dom";

function HeaderIntervensi() {
    const navigate = useNavigate();
    const location = useLocation();

    const currentDay =18;

    const phases = [
        {
            label: "Fase 1",
            path: "/stabilisasi",
            number: 1,
        },
        {
            label: "Fase 2",
            path: "/optimasi",
            number: 2,
        },
        {
            label: "Fase 3",
            path: "/konsolidasi",
            number : 3,
        },
    ];

    const getPhaseStatus = (phaseNumber) => {
        if (currentDay >= 1 && currentDay <= 30) {
            if (phaseNumber === 1) return "Sedang Berjalan";
            return "Belum Mulai";
        }

        if (currentDay >= 31 && currentDay <= 60) {
            if (phaseNumber === 1) return "Selesai";
            if (phaseNumber === 2) return "Sedang Berjalan";
            return "Belum Mulai";
        }

        if (currentDay >= 61 && currentDay <= 90) {
            if (phaseNumber < 3) return "Selesai";
            return "Sedang Berjalan";
        }

        return "Belum Mulai";
    };

    const phaseConfig = {
        "/stabilisasi": {
            gradient: "from-[#003D8C] to-[#3E97FF]",
            activeButton: "bg-white text-[#0057D9]",
            inactiveButton: "bg-blue-400/40 text-white hover:bg-blue-400/60",
            title: "🌱 Stabilisasi Dasar",
            subtitle: "Bangun pondasi metabolisme yang sehat",
            day: "Fase 1 : Hari 1-30",
            subtitleColor: "text-blue-100",
        },

        "/optimasi": {
            gradient: "from-[#5B21B6] to-[#A855F7]",
            activeButton: "bg-white text-[#7C3AED]",
            inactiveButton: "bg-purple-400/30 text-white hover:bg-purple-400/50",
            title: "⚡ Optimasi Metabolik",
            subtitle: "Tingkatkan sensitivitas insulin dan energi",
            day: "Fase 2 : Hari 31-60",
            subtitleColor: "text-purple-100",
        },

        "/konsolidasi": {
            gradient: "from-[#065F46] to-[#34D399]",
            activeButton: "bg-white text-[#16A34A]",
            inactiveButton: "bg-green-400/30 text-white hover:bg-green-400/50",
            title: "🌿 Konsolidasi",
            subtitle: "Pertahankan kebiasaan sehat jangka panjang",
            day: "Fase 3 : Hari 61-90",
            subtitleColor: "text-green-100",
        },
    };

    const currentConfig = phaseConfig[location.pathname] || phaseConfig["/stabilisasi"];
    const currentPhase = phases.find(
        (phase) => phase.path === location.pathname
    );

    const status = getPhaseStatus(currentPhase.number);

    return (
        <div className={`bg-gradient-to-r ${currentConfig.gradient} px-6 py-4`}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span className="text-white font-medium text-sm">
                    {status}
                </span>
            </div>

            <p className="text-sm text-white/65 mt-4 mb-4">
                {currentConfig.day}
            </p>

            <h1 className="text-2xl font-bold text-white">
                {currentConfig.title}
            </h1>

            <p className={`${currentPhase.subtitleColor} mt-2`}>
                {currentConfig.subtitle}
            </p>

            <div className="flex justify-center gap-4 mt-8">
                {phases.map((phase, index) => {
                    const isActive = location.pathname === phase.path;

                    return (
                        <button
                            key={index}
                            onClick={() => navigate(phase.path)}
                            className={`px-6 py-2 rounded-xl font-medium transition ${
                                isActive
                                    ? currentConfig.activeButton
                                    : currentConfig.inactiveButton
                            }`}
                        >
                            {phase.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default HeaderIntervensi;