import { useNavigate } from "react-router-dom";

export default function KonsolidasiRingkasan() {
    const navigate = useNavigate();

    const targets = [
        {
            title: "Batas Gula Harian",
            value: "≤ 25g / hari",
            desc: "Standar WHO: < 5% dari total asupan energi harian",
            icon: "verified",
            color: "text-emerald-600 bg-emerald-50"
        },
        {
            title: "Aktivitas Permanen",
            value: "250 menit / mgg",
            desc: "Gaya hidup aktif terintegrasi secara alami seumur hidup",
            icon: "directions_run",
            color: "text-blue-600 bg-blue-50"
        },
        {
            title: "Tidur Restoratif",
            value: "8.0 jam / malam",
            desc: "Ritme sirkadian stabil mencegah lonjakan glukosa hepar",
            icon: "bedtime",
            color: "text-indigo-600 bg-indigo-50"
        },
        {
            title: "Pemantauan Mandiri",
            value: "1x per 14 hari",
            desc: "Pengecekan berkala untuk deteksi dini variabilitas glukosa",
            icon: "monitor_heart",
            color: "text-rose-600 bg-rose-50"
        },
    ];

    const focusItems = [
        {
            title: "Membangun Fleksibilitas Metabolik",
            desc: "Kemampuan tubuh beralih mulus antara membakar karbohidrat dan membakar asam lemak tanpa 'sugar crash'",
            tag: "Metabolic Flexibility",
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            icon: "all_inclusive"
        },
        {
            title: "Protokol Makan di Luar & Acara Sosial",
            desc: "Strategi memilih urutan santapan: serat dulu, lalu protein/lemak, dan karbohidrat di akhir (Food Sequencing)",
            tag: "Food Sequencing",
            color: "text-blue-700 bg-blue-50 border-blue-200",
            icon: "restaurant"
        },
        {
            title: "Regulasi Stres & Penurunan Hormon Kortisol",
            desc: "Stres psikologis kronis memicu glukoneogenesis hepar tak terkendali. Lakukan latihan napas 4-7-8 harian",
            tag: "Kortisol Management",
            color: "text-purple-700 bg-purple-50 border-purple-200",
            icon: "self_improvement"
        },
        {
            title: "Rencana Pemeliharaan Mandiri Seumur Hidup",
            desc: "Mengubah 90 hari intervensi menjadi identitas gaya hidup baru tanpa merasa terkekang atau tersiksa",
            tag: "Habit Retention",
            color: "text-teal-700 bg-teal-50 border-teal-200",
            icon: "workspace_premium"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Clinical Evidence Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 sm:p-7">
                <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">verified_user</span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 font-display">
                            Landasan Klinis Fase 3: Homeostasis & Proteksi Jangka Panjang
                        </h2>
                        <p className="text-slate-600 mt-1.5 text-xs sm:text-sm leading-relaxed">
                            Fase ketiga bertujuan mengunci stabilitas metabolik baru ke dalam memori seluler. Studi tindak lanjut 10 tahun <em>DPP Outcomes Study (DPPOS)</em> membuktikan bahwa subjek yang berhasil mempertahankan kebiasaan sehat selama 90 hari memiliki insidensi diabetes tipe 2 yang <strong>34–58% lebih rendah</strong> dibanding kelompok kontrol secara persisten selama 1 dekade.
                        </p>
                    </div>
                </div>
            </div>

            {/* Target Harian Grid */}
            <section>
                <h3 className="font-bold font-display text-slate-900 mb-4 text-base">
                    Target Protokol Fase 3
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
                    Pilar Retensi & Konsolidasi
                </h3>
                <div className="space-y-3">
                    {focusItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-emerald-300 transition"
                        >
                            <div className="flex items-start sm:items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
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
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                    <span>Lanjutkan ke Dasbor 90 Hari</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}