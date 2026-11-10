import { useNavigate } from "react-router-dom";

export default function OptimasiRingkasan() {
    const navigate = useNavigate();

    const targets = [
        {
            title: "Batas Gula Harian",
            value: "≤ 30g / hari",
            desc: "Pengurangan lebih ketat dari Fase 1 untuk sensitivitas reseptor",
            icon: "water_drop",
            color: "text-amber-600 bg-amber-50"
        },
        {
            title: "Aktivitas + Latihan Beban",
            value: "200 menit / mgg",
            desc: "Termasuk 2x latihan resistensi fungsional (squat, push-up)",
            icon: "fitness_center",
            color: "text-purple-600 bg-purple-50"
        },
        {
            title: "Tidur Berkualitas",
            value: "7.5 jam / malam",
            desc: "Fase tidur dalam (deep sleep) untuk perbaikan jaringan seluler",
            icon: "bedtime",
            color: "text-indigo-600 bg-indigo-50"
        },
        {
            title: "Serat Prebiotik",
            value: "≥ 30g / hari",
            desc: "Serat larut air untuk memperlambat laju absorpsi glukosa",
            icon: "eco",
            color: "text-emerald-600 bg-emerald-50"
        },
    ];

    const focusItems = [
        {
            title: "Latihan Beban Tubuh 2x Seminggu",
            desc: "Merangsang translokasi transporter glukosa GLUT4 otot rangka tanpa bergantung pada insulin",
            tag: "Aktivasi GLUT4",
            color: "text-purple-700 bg-purple-50 border-purple-200",
            icon: "exercise"
        },
        {
            title: "Protokol Post-Prandial Walk (15 Menit)",
            desc: "Jalan santai tepat 10–15 menit setelah makan besar untuk meredam lonjakan glukosa puncak",
            tag: "Spike Blunting",
            color: "text-blue-700 bg-blue-50 border-blue-200",
            icon: "directions_walk"
        },
        {
            title: "Peningkatan Serat Larut (Inulin & Beta-Glukan)",
            desc: "Membentuk gel viskos di usus halus yang menurunkan indeks glikemik hidangan",
            tag: "Glikemik Kontrol",
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            icon: "nutrition"
        },
        {
            title: "Manajemen Jendela Makan (Meal Spacing)",
            desc: "Beri jarak minimal 4 jam antar waktu makan untuk memberi kesempatan pankreas beristirahat",
            tag: "Pankreas Recovery",
            color: "text-amber-700 bg-amber-50 border-amber-200",
            icon: "hourglass_bottom"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Clinical Evidence Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 sm:p-7">
                <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">biotech</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 font-display">
                            Landasan Klinis Fase 2: Peningkatan Kapasitas Penyerapan GLUT4
                        </h2>
                        <p className="text-slate-600 mt-1.5 text-xs sm:text-sm leading-relaxed">
                            Di fase kedua, fondasi awal telah terbentuk. Fokus dialihkan untuk meningkatkan translokasi transporter glukosa <strong>GLUT4</strong> pada otot rangka melalui kombinasi latihan resistensi dan kontrol glikemik. Menurut studi di <em>Journal of Clinical Endocrinology & Metabolism (JCEM, 2022)</em>, latihan kekuatan 2x/minggu meningkatkan pembuangan glukosa perifer otot hingga <strong>35%</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Target Harian Grid */}
            <section>
                <h3 className="font-bold font-display text-slate-900 mb-4 text-base">
                    Target Protokol Fase 2
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
                    Pilar Optimalisasi Metabolik
                </h3>
                <div className="space-y-3">
                    {focusItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-purple-300 transition"
                        >
                            <div className="flex items-start sm:items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shrink-0">
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
                    onClick={() => navigate("/rencana")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                >
                    <span>Lanjutkan ke Dasbor 90 Hari</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}