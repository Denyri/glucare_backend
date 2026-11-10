import { useNavigate } from "react-router-dom";
import { Droplets, Footprints, Moon, Dumbbell, Activity, CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

export default function FaseIntervensi({ currentDay = 1 }) {
    const navigate = useNavigate();

    const phases = [
        {
            number: 1,
            title: "Stabilisasi Dasar",
            subtitle: "Pondasi Ritme Sirkadian & Eliminasi Gula Sederhana",
            range: "Hari 1–30",
            path: "/stabilisasi",
            active: currentDay <= 30,
            completed: currentDay > 30,
            colorTheme: "border-blue-500/30 bg-blue-50/40 text-[#0062E3]",
            activeBadge: "bg-blue-600 text-white",
            metrics: [
                { icon: Droplets, label: "Target Gula", value: "≤ 40g/hari", color: "text-amber-700 bg-amber-50 border-amber-100" },
                { icon: Footprints, label: "Aktivitas", value: "150 mnt/mgg", color: "text-blue-700 bg-blue-50 border-blue-100" },
                { icon: Moon, label: "Tidur Terjadwal", value: "7.0 jam/hr", color: "text-indigo-700 bg-indigo-50 border-indigo-100" },
            ],
            clinicalFocus: "Fokus Klinis: Mengurangi resistensi insulin akut dan menstabilkan glukosa puasa (GDP < 110 mg/dL).",
        },
        {
            number: 2,
            title: "Optimasi Metabolik",
            subtitle: "Aktivasi Translokasi GLUT4 & Latihan Ketahanan Beban",
            range: "Hari 31–60",
            path: "/optimasi",
            active: currentDay > 30 && currentDay <= 60,
            completed: currentDay > 60,
            colorTheme: "border-purple-500/30 bg-purple-50/40 text-purple-600",
            activeBadge: "bg-purple-600 text-white",
            metrics: [
                { icon: Droplets, label: "Target Gula", value: "≤ 30g/hari", color: "text-amber-700 bg-amber-50 border-amber-100" },
                { icon: Dumbbell, label: "Aktivitas + Beban", value: "200 mnt/mgg", color: "text-purple-700 bg-purple-50 border-purple-100" },
                { icon: Moon, label: "Tidur Berkualitas", value: "7.5 jam/hr", color: "text-indigo-700 bg-indigo-50 border-indigo-100" },
            ],
            clinicalFocus: "Fokus Klinis: Merangsang penyerapan glukosa non-insulin dependen pada otot rangka (GDP 95–105 mg/dL).",
        },
        {
            number: 3,
            title: "Konsolidasi & Retensi",
            subtitle: "Homeostasis Metabolik & Resiliensi Sel Beta Jangka Panjang",
            range: "Hari 61–90",
            path: "/konsolidasi",
            active: currentDay > 60,
            completed: currentDay >= 90,
            colorTheme: "border-emerald-500/30 bg-emerald-50/40 text-emerald-600",
            activeBadge: "bg-emerald-600 text-white",
            metrics: [
                { icon: Droplets, label: "Target Gula", value: "≤ 25g/hari", color: "text-amber-700 bg-amber-50 border-amber-100" },
                { icon: Activity, label: "Kebugaran Total", value: "250 mnt/mgg", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                { icon: Moon, label: "Tidur Restoratif", value: "8.0 jam/hr", color: "text-indigo-700 bg-indigo-50 border-indigo-100" },
            ],
            clinicalFocus: "Fokus Klinis: Mempertahankan 58% reduksi progresi prediabetes secara persisten seumur hidup (GDP < 100 mg/dL).",
        },
    ];

    return (
        <div className="space-y-4">
            {phases.map((phase) => {
                const isCurrent = phase.active;
                const isDone = phase.completed;

                return (
                    <div
                        key={phase.number}
                        onClick={() => navigate(phase.path)}
                        className={`group relative rounded-3xl p-5 sm:p-6 border transition-all duration-300 cursor-pointer ${
                            isCurrent
                                ? "bg-white border-blue-500/80 shadow-[0_8px_30px_rgb(0,98,227,0.08)] ring-2 ring-blue-500/10 hover:border-blue-600"
                                : isDone
                                ? "bg-white/95 border-emerald-200/90 hover:border-emerald-300 shadow-sm"
                                : "bg-slate-50/80 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                        }`}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            {/* Left: Badge & Info */}
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-base shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                                        isCurrent
                                            ? "bg-gradient-to-br from-[#0062E3] to-[#0090FF] text-white shadow-blue-500/25"
                                            : isDone
                                            ? "bg-emerald-600 text-white shadow-emerald-500/25"
                                            : "bg-slate-100 text-slate-400 border border-slate-200"
                                    }`}
                                >
                                    {isDone ? (
                                        <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                                    ) : (
                                        phase.number
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-base font-bold font-display text-slate-900 group-hover:text-[#0062E3] transition-colors">
                                            {phase.title}
                                        </h4>
                                        <span className="text-[11px] font-mono font-bold text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60">
                                            {phase.range}
                                        </span>
                                        {isCurrent && (
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0062E3] border border-blue-200/60 animate-pulse">
                                                Fase Aktif
                                            </span>
                                        )}
                                        {isDone && (
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                                                Terselesaikan
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {phase.subtitle}
                                    </p>
                                    <p className="text-xs text-slate-600 font-medium italic pt-0.5">
                                        {phase.clinicalFocus}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Metrics & Link */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
                                {phase.metrics.map((m, idx) => {
                                    const MetricIcon = m.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${m.color} transition-colors`}
                                        >
                                            <MetricIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                                            <span>{m.value}</span>
                                        </div>
                                    );
                                })}

                                <div className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/70 text-xs font-bold text-[#0062E3] transition-all group-hover:border-blue-200">
                                    <span>Detail Protokol</span>
                                    <div className="w-5 h-5 rounded-full bg-blue-100/70 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                        <ChevronRight className="w-3.5 h-3.5 text-[#0062E3]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}