import { useNavigate } from "react-router-dom";

export default function StabilisasiTargetAkhir() {
    const navigate = useNavigate();

    const targets = [
        { label: "Gula Darah Puasa (GDP)", target: "< 110 mg/dL", note: "Penurunan dari baseline pra-intervensi" },
        { label: "Manajemen Berat Badan", target: "Turun 1–2 kg", note: "Pengurangan lemak viseral awal" },
        { label: "Kepatuhan Aktivitas Fisik", target: "150 menit/minggu", note: "30 menit jalan cepat x 5 hari" },
        { label: "Eliminasi Gula Tambahan", target: "7 Hari Berturut-turut Bebas Minuman Manis", note: "Mencegah lonjakan insulin berulang" },
    ];

    const phases = [
        {
            number: 1,
            title: "Stabilisasi Dasar",
            day: "Hari 1–30 · Gula ≤ 40g/hari",
            active: true,
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
            active: false,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Target Akhir Fase 1 Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Milestone Evaluasi Klinis · Hari ke-30
                </span>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062E3] flex items-center justify-center border border-blue-100">
                        <span className="material-symbols-outlined text-[22px]">target</span>
                    </div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                        Target Akhir Fase 1 (Stabilisasi)
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {targets.map((item, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0062E3] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                                <p className="text-sm font-extrabold font-mono text-[#0062E3] mt-0.5">{item.target}</p>
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
                                    ? "bg-blue-50/60 border-blue-300 ring-1 ring-blue-400/20"
                                    : "bg-slate-50 border-slate-200 opacity-75"
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                                        phase.active ? "bg-[#0062E3] text-white" : "bg-slate-200 text-slate-600"
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

            {/* Bukti Klinis DPP Study */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#0062E3]">verified</span>
                    <h3 className="text-base font-bold text-[#0062E3]">
                        Bukti Klinis Diabetes Prevention Program (DPP)
                    </h3>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed mb-6">
                    Penelitian acak terkontrol DPP (New England Journal of Medicine) membuktikan bahwa intervensi gaya hidup terstruktur selama 90 hari berhasil mengurangi risiko progresi ke diabetes tipe 2 sebesar <strong>58%</strong>, melampaui efektivitas intervensi farmakologis pada pasien prediabetes muda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                        <span className="text-2xl font-black font-mono text-emerald-600">↓ 58%</span>
                        <p className="text-xs font-bold text-slate-700 mt-1">Risiko Progresi Diabetes</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Penelitian Multi-Senter DPP</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                        <span className="text-2xl font-black font-mono text-[#0062E3]">&lt; 5.7%</span>
                        <p className="text-xs font-bold text-slate-700 mt-1">Target Normal HbA1c</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Standar Klinis ADA 2024</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                        <span className="text-2xl font-black font-mono text-indigo-600">↑ 35%</span>
                        <p className="text-xs font-bold text-slate-700 mt-1">Sensitivitas Insulin Sel</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Translokasi Transporter GLUT4</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition"
                    onClick={() => navigate("/optimasi")}
                >
                    <span>Lanjut ke Fase 2: Optimasi Metabolik</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}