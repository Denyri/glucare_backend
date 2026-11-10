import { useState } from "react";
import {
    Flame,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Snowflake,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Trophy,
    ShieldCheck
} from "lucide-react";
import ClinicalBadge from "./ui/ClinicalBadge";

export default function StreakCalendar({
    streak = 0,
    longestStreak = 0,
    freezeCount = 0,
    isCheckedInToday = false,
    weeklyDays = [],
    monthlyDays = [],
    onQuickCheckin,
    isCheckingIn = false,
}) {
    const [showMonthView, setShowMonthView] = useState(false);

    // Format Indonesian day names
    const getDayName = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr + "T00:00:00Z");
        const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        return days[date.getUTCDay()];
    };

    const getDayNumber = (dateStr) => {
        if (!dateStr) return "";
        return dateStr.split("-")[2];
    };

    // Calculate consistency rate from 30 days
    const consistencyRate = (() => {
        if (!monthlyDays || monthlyDays.length === 0) return 0;
        const validCheckins = monthlyDays.filter(
            (d) => d.type === "checkin" || d.type === "freeze_used"
        ).length;
        const elapsedDays = monthlyDays.filter(
            (d) => d.type !== "future"
        ).length;
        if (elapsedDays === 0) return 0;
        return Math.round((validCheckins / elapsedDays) * 100);
    })();

    return (
        <div className="group relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/70 via-slate-200/40 to-slate-200/20 shadow-xl">
            <div className="bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-8 space-y-6">

                {/* Header: Title, Streak Counter & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ClinicalBadge variant="clinical">
                                Smart Streak Engine
                            </ClinicalBadge>
                            {isCheckedInToday ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Aktif Hari Ini
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    Perlu Check-in
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Kalender Konsistensi & Streak</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                            Pertahankan rutinitas 3 pilar setiap hari untuk membangun resiliensi metabolik.
                        </p>
                    </div>

                    {/* Stats Pill Badges */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Current Streak */}
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 shadow-2xs">
                            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                                <Flame className="w-4 h-4 fill-white" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80">Streak</div>
                                <div className="text-sm font-black font-mono leading-none">{streak} Hari</div>
                            </div>
                        </div>

                        {/* Best Streak */}
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 shadow-2xs">
                            <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                                <Trophy className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Terbaik</div>
                                <div className="text-sm font-black font-mono leading-none">{longestStreak} Hari</div>
                            </div>
                        </div>

                        {/* Freeze Count */}
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sky-50 border border-sky-200/70 text-sky-900 shadow-2xs">
                            <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                                <Snowflake className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700/80">Perlindungan</div>
                                <div className="text-sm font-black font-mono leading-none">{freezeCount} Freeze</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7-Day Rolling Calendar Strip */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                            7 Hari Terakhir
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowMonthView(!showMonthView)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                        >
                            <span>{showMonthView ? "Tutup Kalender 30 Hari" : "Lihat Kalender 30 Hari"}</span>
                            {showMonthView ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                        {weeklyDays.map((item, idx) => {
                            const isCheckin = item.type === "checkin";
                            const isFreeze = item.type === "freeze_used";
                            const isToday = item.type === "today";
                            const isMissed = item.type === "missed";
                            const isFuture = item.type === "future";

                            return (
                                <div
                                    key={item.date || idx}
                                    className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all ${
                                        isCheckin
                                            ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20 scale-100"
                                            : isFreeze
                                            ? "bg-gradient-to-b from-sky-400 to-sky-500 text-white border-sky-400 shadow-sm"
                                            : isToday
                                            ? isCheckedInToday
                                                ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                                                : "bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/30"
                                            : isMissed
                                            ? "bg-slate-50 border-slate-200/80 text-slate-400"
                                            : "bg-white border-slate-100 text-slate-300"
                                    }`}
                                >
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                        isCheckin || isFreeze || (isToday && isCheckedInToday) ? "text-white/80" : "text-slate-400"
                                    }`}>
                                        {getDayName(item.date)}
                                    </span>

                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono my-1 ${
                                        isCheckin || isFreeze || (isToday && isCheckedInToday)
                                            ? "bg-white/20 text-white"
                                            : isToday
                                            ? "bg-amber-200/60 text-amber-900"
                                            : "bg-slate-100 text-slate-600"
                                    }`}>
                                        {isCheckin || (isToday && isCheckedInToday) ? (
                                            <Flame className="w-4 h-4 fill-white" />
                                        ) : isFreeze ? (
                                            <Snowflake className="w-4 h-4" />
                                        ) : (
                                            getDayNumber(item.date)
                                        )}
                                    </div>

                                    <span className={`text-[9px] font-semibold mt-1 ${
                                        isCheckin || (isToday && isCheckedInToday)
                                            ? "text-white"
                                            : isToday
                                            ? "text-amber-700 font-bold"
                                            : "text-slate-400"
                                    }`}>
                                        {isCheckin || (isToday && isCheckedInToday)
                                            ? "Berhasil"
                                            : isFreeze
                                            ? "Freeze"
                                            : isToday
                                            ? "Hari Ini"
                                            : isMissed
                                            ? "Absen"
                                            : "Nanti"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Expandable 30-Day Monthly Calendar Grid */}
                {showMonthView && (
                    <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Riwayat Konsistensi 30 Hari
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                {consistencyRate}% Kepatuhan
                            </span>
                        </div>

                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                            {monthlyDays.map((item, idx) => {
                                const isCheckin = item.type === "checkin";
                                const isFreeze = item.type === "freeze_used";
                                const isToday = item.type === "today";
                                const isMissed = item.type === "missed";

                                return (
                                    <div
                                        key={item.date || idx}
                                        title={`${item.date}: ${item.type}`}
                                        className={`h-11 rounded-xl flex flex-col items-center justify-center p-1 border text-center transition-all ${
                                            isCheckin
                                                ? "bg-emerald-500 border-emerald-600 text-white shadow-2xs"
                                                : isFreeze
                                                ? "bg-sky-400 border-sky-500 text-white"
                                                : isToday
                                                ? isCheckedInToday
                                                    ? "bg-emerald-500 border-emerald-600 text-white"
                                                    : "bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-400/30"
                                                : isMissed
                                                ? "bg-slate-50 border-slate-200 text-slate-400"
                                                : "bg-white border-slate-100 text-slate-300"
                                        }`}
                                    >
                                        <span className="text-[10px] font-mono font-bold leading-none">
                                            {getDayNumber(item.date)}
                                        </span>
                                        <span className="text-[8px] opacity-80 leading-none mt-0.5">
                                            {getDayName(item.date)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Check-in Berhasil
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-sky-400 inline-block" /> Freeze Perlindungan
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 inline-block" /> Hari Ini
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200 inline-block" /> Tidak Ada Aktivitas
                            </span>
                        </div>
                    </div>
                )}

                {/* Quick Check-in Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                    <div className="text-xs text-slate-600 text-center sm:text-left">
                        {isCheckedInToday ? (
                            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Anda sudah check-in untuk hari ini. Streak bertambah dan tersimpan aman di server!
                            </span>
                        ) : (
                            <span className="text-slate-600">
                                Selesaikan checklist 3 pilar atau tekan <strong>Check-in Cepat</strong> untuk mempertahankan streak Anda.
                            </span>
                        )}
                    </div>

                    {!isCheckedInToday && (
                        <button
                            type="button"
                            onClick={onQuickCheckin}
                            disabled={isCheckingIn}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Flame className="w-4 h-4 fill-white" />
                            <span>{isCheckingIn ? "Mencatat Streak..." : "Check-in Cepat Hari Ini (+1 Streak)"}</span>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
