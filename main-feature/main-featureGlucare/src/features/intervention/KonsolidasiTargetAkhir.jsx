import { useNavigate } from "react-router-dom";

export default function KonsolidasiTargetAkhir() {
    const navigate = useNavigate();

    const targets = [
        { label: "Gula Darah Puasa (GDP)", target: "< 100 mg/dL", note: "Zona Normal Standar Klinis ADA" },
        { label: "Estimasi HbA1c", target: "< 5.7%", note: "Bebas dari kategori risiko Prediabetes" },
        { label: "Aktivitas Fisik Berkelanjutan", target: "250 menit/minggu", note: "Menjadi kebiasaan otomatis tanpa paksaan" },
        { label: "Retensi Gaya Hidup", target: "100% Otonom", note: "Rencana pemeliharaan mandiri seumur hidup" },
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
            active: false,
        },
        {
            number: 3,
            title: "Konsolidasi & Retensi",
            day: "Hari 61–90 · Gula ≤ 25g/hari",
            active: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Target Akhir Fase 3 Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Milestone Puncak · Hari ke-90
                </span>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                    </div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                        Target Akhir Fase 3 (Puncak Program 90 Hari)
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {targets.map((item, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                                <p className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5">{item.target}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Perjalanan 90 Hari Roadmap */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
                <h3 className="font-bold font-display text-slate-900 mb-6">
                    Lintasan Lengkap Program 90 Hari
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {phases.map((phase) => (
                        <div
                            key={phase.number}
                            className={`p-4 rounded-xl border transition-all ${
                                phase.active
                                    ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/20"
                                    : "bg-slate-50 border-slate-200 opacity-75"
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                                        phase.active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
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

            {/* Navigasi & Evaluasi */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                    onClick={() => navigate("/optimasi")}
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Kembali ke Fase 2</span>
                </button>

                <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0062E3] hover:bg-[#0052be] text-white rounded-xl text-sm font-bold shadow-md transition"
                    onClick={() => navigate("/evaluasi")}
                >
                    <span>Buka Lembar Evaluasi Klinis Lengkap</span>
                    <span className="material-symbols-outlined text-[18px]">assessment</span>
                </button>
            </div>
        </div>
    );
}