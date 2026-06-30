export default function ActivityChart({ dailyData, currentDay }) {
    if (!dailyData || !Array.isArray(dailyData) || dailyData.length === 0) {
        return (
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-500">directions_walk</span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800">Aktivitas Fisik</h3>
                        <p className="text-xs text-gray-400">7 Hari Terakhir</p>
                    </div>
                </div>
                <div className="h-40 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400 font-medium">Belum ada data aktivitas minggu ini.</p>
                </div>
            </div>
        );
    }

    const validCurrentDay = currentDay || 1;
    const last7Days = [];
    
    // Selalu buat 7 bar (H-6 hingga Hari Ini) agar tampilan konsisten
    for (let i = 6; i >= 0; i--) {
        const dayIndex = validCurrentDay - i;
        const record = dailyData.find(x => parseInt(x.day_index) === dayIndex);
        
        last7Days.push({
            dayIndex: dayIndex,
            dayLabel: dayIndex > 0 ? `H-${dayIndex}` : '-',
            value: record ? (parseInt(record.walking_minutes) || 0) : 0,
            isToday: i === 0
        });
    }

    // Hitung stat
    const maxVal = Math.max(30, ...last7Days.map(d => d.value)); // minimum scale 30 agar bar tidak terlalu penuh
    const totalMinutes = last7Days.reduce((acc, curr) => acc + curr.value, 0);
    const avgMinutes = last7Days.length > 0 ? Math.round(totalMinutes / last7Days.length) : 0;

    return (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-6">
            {/* Header Dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0072CE]/10 to-[#3E97FF]/10 flex items-center justify-center border border-[#0072CE]/20">
                        <span className="material-symbols-outlined text-[#0072CE] text-2xl">directions_walk</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-extrabold text-gray-800 tracking-tight mb-0.5">Tren Aktivitas</h3>
                        <p className="text-sm text-gray-400 font-medium">7 Hari Terakhir</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100/50">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-xl font-black text-gray-800 leading-none">{totalMinutes} <span className="text-xs text-gray-500 font-bold">mnt</span></p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-[#0072CE] uppercase tracking-wider mb-1">Rata-rata</p>
                        <p className="text-xl font-black text-[#0072CE] leading-none">{avgMinutes} <span className="text-xs text-[#0072CE]/70 font-bold">mnt/hr</span></p>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-56 mt-4 pb-6">
                {/* Background Grid Lines (Y-Axis) */}
                <div className="absolute inset-0 flex flex-col justify-between z-0 pb-6">
                    {[100, 50, 0].map((percent, i) => (
                        <div key={i} className="relative w-full flex items-center">
                            <span className="absolute -left-2 sm:-left-4 -translate-x-full text-[10px] font-bold text-gray-300 w-8 text-right">
                                {Math.round((percent / 100) * maxVal)}
                            </span>
                            <div className={`w-full border-t ${percent === 0 ? 'border-gray-200' : 'border-dashed border-gray-100'}`}></div>
                        </div>
                    ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-between pl-8 sm:pl-10 pr-2 sm:pr-4 z-10 pb-[25px]">
                    {last7Days.map((item, i) => {
                        const percent = (item.value / maxVal) * 100;
                        const heightStr = `${Math.max(2, percent)}%`;
                        
                        return (
                            <div key={i} className="flex flex-col items-center flex-1 group">
                                <div className="h-[160px] w-full flex items-end justify-center relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap shadow-xl z-20">
                                        {item.value} menit
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                    </div>
                                    
                                    {/* Bar */}
                                    <div
                                        className={`w-full max-w-[28px] sm:max-w-[36px] rounded-t-xl transition-all duration-500 cursor-pointer relative overflow-hidden
                                            ${item.isToday 
                                                ? 'bg-gradient-to-t from-[#0072CE] to-[#3E97FF] shadow-[0_4px_15px_rgba(0,114,206,0.3)]' 
                                                : item.value > 0 
                                                    ? 'bg-gradient-to-t from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300' 
                                                    : 'bg-gray-100'
                                            }
                                        `}
                                        style={{ height: heightStr }}
                                    >
                                        {/* Highlight kilap di bagian atas bar (khusus hari ini) */}
                                        {item.isToday && <div className="absolute top-0 left-0 w-full h-2 bg-white/20"></div>}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col items-center w-full">
                                    <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap ${item.isToday ? 'text-[#0072CE] bg-[#0072CE]/10 px-2.5 py-1 rounded-full' : 'text-gray-400'}`}>
                                        {item.isToday ? 'Hari Ini' : item.dayLabel}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}