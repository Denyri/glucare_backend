import { useNavigate } from "react-router-dom";

export default function StabilisasiRingkasan() {
    const navigate = useNavigate();

    const targets = [
        {
            title: "Batas Gula Harian",
            value: "≤ 40g / hari",
            desc: "Eliminasi gula tambahan cair & makanan ultra-proses",
            icon: "water_drop",
            color: "text-amber-600 bg-amber-50"
        },
        {
            title: "Aktivitas Fisik",
            value: "150 menit / mgg",
            desc: "Jalan cepat 30 menit x 5 hari atau 20 menit tiap hari",
            icon: "directions_walk",
            color: "text-blue-600 bg-blue-50"
        },
        {
            title: "Jadwal Tidur",
            value: "7.0 jam / malam",
            desc: "Waktu tidur konsisten untuk menekan lonjakan kortisol",
            icon: "bedtime",
            color: "text-indigo-600 bg-indigo-50"
        },
        {
            title: "Hidrasi Seluler",
            value: "8–10 gelas / hari",
            desc: "Air mineral untuk mendukung filtrasi ginjal & glukosa",
            icon: "local_drink",
            color: "text-cyan-600 bg-cyan-50"
        },
    ];

    const focusItems = [
        {
            title: "Hentikan Minuman Berpemanis Dalam Kemasan",
            desc: "Mengurangi lonjakan glukosa akut hingga 40% (post-prandial spike)",
            tag: "Prioritas Utama",
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            icon: "no_drinks"
        },
        {
            title: "Transisi Karbohidrat Kompleks",
            desc: "Ganti 50% porsi nasi putih dengan beras merah, ubi, atau quinoa",
            tag: "Indeks Glikemik",
            color: "text-blue-700 bg-blue-50 border-blue-200",
            icon: "grain"
        },
        {
            title: "Disiplin Waktu Makan (Meal Timing)",
            desc: "Hindari makan larut malam (< 2 jam sebelum tidur) untuk ritme insulin stabil",
            tag: "Sirkadian",
            color: "text-purple-700 bg-purple-50 border-purple-200",
            icon: "schedule"
        },
        {
            title: "Pencatatan Harian Konsisten",
            desc: "Meningkatkan kesadaran metabolisme diri dan kepatuhan intervensi 3x lipat",
            tag: "Habit Stacking",
            color: "text-amber-700 bg-amber-50 border-amber-200",
            icon: "edit_calendar"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Clinical Evidence Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 sm:p-7">
                <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-[#0062E3] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">science</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 font-display">
                            Landasan Klinis Fase 1: Memutus Resistensi Insulin Akut
                        </h2>
                        <p className="text-slate-600 mt-1.5 text-xs sm:text-sm leading-relaxed">
                            Fase pertama berfokus pada pemutusan siklus hiperinsulinemia kronis melalui eliminasi gula sederhana. Studi klinis di <em>Diabetes Care (2021)</em> menunjukkan bahwa intervensi konsisten selama 30 hari pertama dapat mengembalikan sensitivitas reseptor insulin hepar dan otot sebesar <strong>15–20%</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Target Harian Grid */}
            <section>
                <h3 className="font-bold font-display text-slate-900 mb-4 text-base">
                    Target Protokol Harian
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {targets.map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.title}</h4>
                            <p className="text-lg font-black font-mono text-slate-900 mt-1 tabular-nums">{item.value}</p>
                            <p className="text-xs text-slate-500 mt-1.5 leading-snug">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4 Pilar Fokus Utama */}
            <section>
                <h3 className="font-bold font-display text-slate-900 mb-4 text-base">
                    Pilar Aksi Fase 1
                </h3>
                <div className="space-y-3">
                    {focusItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-blue-300 transition"
                        >
                            <div className="flex items-start sm:items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border self-start sm:self-auto shrink-0 ${item.color}`}>
                                {item.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={() => navigate("/analisis")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition"
                >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Kalibrasi Profil Risiko</span>
                </button>
            </div>
        </div>
    );
}