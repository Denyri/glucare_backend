import { Footprints, TrendingUp, CheckCircle2 } from "lucide-react";

export default function ActivityChart({ dailyData, currentDay }) {
    const validCurrentDay = currentDay || 1;
    const last7Days = [];

    // Buat 7 bar (H-6 hingga Hari Ini)
    for (let i = 6; i >= 0; i--) {
        const dayIndex = validCurrentDay - i;
        const record = Array.isArray(dailyData)
            ? dailyData.find((x) => parseInt(x.day_index || x.day) === dayIndex)
            : null;

        last7Days.push({
            dayIndex: dayIndex,
            dayLabel: dayIndex > 0 ? `Hari ${dayIndex}` : "-",
            value: record ? parseInt(record.walking_minutes) || 0 : 0,
            isToday: i === 0,
        });
    }

    const maxVal = Math.max(45, ...last7Days.map((d) => d.value));
    const totalMinutes = last7Days.reduce((acc, curr) => acc + curr.value, 0);
    const avgMinutes = last7Days.length > 0 ? Math.round(totalMinutes / last7Days.length) : 0;
    const complianceDays = last7Days.filter((d) => d.value >= 30).length;

    return (
        <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/60 to-slate-200/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-7 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-[#0062E3] flex items-center justify-center ring-1 ring-blue-500/20">
                            <Footprints className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold font-display text-slate-900">
                                    Tren Aktivitas Fisik
                                </h3>
                                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                                    7 Hari Terakhir
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Target ADA: Minimal 30 menit jalan cepat atau aktivitas aerobik sedang per hari
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/60">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mingguan</p>
                            <p className="text-base font-extrabold font-mono text-slate-800 tabular-nums">
                                {totalMinutes} <span className="text-xs font-normal text-slate-500">menit</span>
                            </p>
                        </div>
                        <div className="w-px h-7 bg-slate-200"></div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-[#0062E3] uppercase tracking-wider">Rata-rata Harian</p>
                            <p className="text-base font-extrabold font-mono text-[#0062E3] tabular-nums">
                                {avgMinutes} <span className="text-xs font-normal text-slate-500">mnt/hr</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="relative h-56 pt-6 pb-2">
                    {/* Benchmark Line (30 Menit Target) */}
                    <div
                        className="absolute left-8 right-2 border-b border-dashed border-emerald-400/80 z-10 flex items-center justify-end pr-1 pointer-events-none"
                        style={{ bottom: `${Math.min(95, (30 / maxVal) * 100 * 0.72 + 25)}px` }}
                    >
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            Target ADA (30 mnt)
                        </span>
                    </div>

                    {/* Y-Axis lines */}
                    <div className="absolute inset-0 flex flex-col justify-between z-0 pb-7 pl-8">
                        {[100, 50, 0].map((percent, idx) => (
                            <div key={idx} className="relative w-full flex items-center">
                                <span className="absolute -left-8 text-[10px] font-mono font-semibold text-slate-400 w-6 text-right">
                                    {Math.round((percent / 100) * maxVal)}
                                </span>
                                <div className={`w-full border-t ${percent === 0 ? "border-slate-200" : "border-slate-100 border-dashed"}`}></div>
                            </div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-between pl-10 pr-4 z-10 pb-[28px]">
                        {last7Days.map((item, i) => {
                            const percent = (item.value / maxVal) * 100;
                            const heightPx = Math.max(6, (percent / 100) * 140);

                            return (
                                <div key={i} className="flex flex-col items-center flex-1 group">
                                    <div className="h-[140px] w-full flex items-end justify-center relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-9 bg-slate-900 text-white text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-30">
                                            {item.value} menit
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45"></div>
                                        </div>

                                        {/* Bar element */}
                                        <div
                                            className={`w-full max-w-[28px] sm:max-w-[36px] rounded-t-xl transition-all duration-300 relative ${
                                                item.isToday
                                                    ? "bg-gradient-to-t from-[#0062E3] to-[#0090FF] shadow-sm shadow-blue-500/30"
                                                    : item.value >= 30
                                                    ? "bg-gradient-to-t from-emerald-500 to-teal-400"
                                                    : item.value > 0
                                                    ? "bg-gradient-to-t from-blue-300 to-blue-400"
                                                    : "bg-slate-100"
                                            }`}
                                            style={{ height: `${heightPx}px` }}
                                        >
                                            {item.isToday && <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40 rounded-t-xl"></div>}
                                        </div>
                                    </div>

                                    <div className="mt-2.5 flex flex-col items-center w-full">
                                        <span
                                            className={`text-[11px] font-semibold font-mono whitespace-nowrap ${
                                                item.isToday
                                                    ? "text-[#0062E3] font-bold bg-blue-50 px-2 py-0.5 rounded-full"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {item.isToday ? "Hari Ini" : item.dayLabel}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Summary note */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{complianceDays} dari 7 hari memenuhi target 30 menit</span>
                    </span>
                    <span className="font-medium text-slate-400">
                        Aktivitas merangsang translokasi GLUT4 ke membran otot tanpa tergantung insulin
                    </span>
                </div>
            </div>
        </div>
    );
}