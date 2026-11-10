import { useNavigate } from "react-router-dom";

export default function OptimasiTargetAkhir() {
    const navigate = useNavigate();

    const targets = [
        { label: "Gula Darah Puasa (GDP)", target: "95–105 mg/dL", note: "Mendekati ambang batas normal klinis ADA" },
        { label: "Sensitivitas Insulin Otot", target: "Meningkat 30–35%", note: "Aktivasi reguler transporter GLUT4" },
        { label: "Total Aktivitas Fisik", target: "200 menit/minggu", note: "Kombinasi aerobik + 2x latihan resistensi" },
        { label: "Komposisi Tubuh", target: "Lingkar Pinggang Turun 2–4 cm", note: "Reduksi lemak viseral sentral" },
    ];

    const phases = [
        {
            number: 1,
            title: "Stabilisasi Dasar",
            day: "Hari 1–30 · Gula ≤ 40g/hari",
            active: false,
        },
        {
            number: 2,
            title: "Optimasi Metabolik",
            day: "Hari 31–60 · Gula ≤ 30g/hari",
            active: true,
        },
        {
            number: 3,
            title: "Konsolidasi & Retensi",
            day: "Hari 61–90 · Gula ≤ 25g/hari",
            active: false,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Target Akhir Fase 2 Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Milestone Evaluasi Klinis · Hari ke-60
                </span>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                        <span className="material-symbols-outlined text-[22px]">fitness_center</span>
                    </div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                        Target Akhir Fase 2 (Optimasi Metabolik)
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {targets.map((item, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                                <p className="text-sm font-extrabold font-mono text-purple-700 mt-0.5">{item.target}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Perjalanan 90 Hari Roadmap */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
                <h3 className="font-bold font-display text-slate-900 mb-6">
                    Lintasan Program 90 Hari
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {phases.map((phase) => (
                        <div
                            key={phase.number}
                            className={`p-4 rounded-xl border transition-all ${
                                phase.active
                                    ? "bg-purple-50/60 border-purple-300 ring-1 ring-purple-400/20"
                                    : "bg-slate-50 border-slate-200 opacity-75"
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                                        phase.active ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"
                                    }`}
                                >
                                    {phase.number}
                                </div>
                                <h4 className="font-bold text-sm text-slate-800">{phase.title}</h4>
                            </div>
                            <p className="text-xs font-mono text-slate-500">{phase.day}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigasi ke Fase 3 */}
            <div className="flex justify-between items-center pt-2">
                <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                    onClick={() => navigate("/stabilisasi")}
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Kembali ke Fase 1</span>
                </button>

                <button
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition"
                    onClick={() => navigate("/konsolidasi")}
                >
                    <span>Lanjut ke Fase 3: Konsolidasi & Retensi</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}