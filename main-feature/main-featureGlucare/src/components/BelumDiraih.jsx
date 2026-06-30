export default function BelumDiraih ({
    icon = "🔥", title,description,xp,
}) {
    return (
        <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 overflow-hidden">
            {/* Subtle background shift on hover */}
            <div className="absolute inset-0 bg-gray-50/50 group-hover:bg-transparent transition-colors duration-300"></div>
            
            <div className="relative z-10 flex items-center gap-5">
                {/* Locked Icon Container */}
                <div className="w-14 h-14 rounded-xl bg-gray-100/80 flex items-center justify-center text-3xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:bg-gray-100 group-hover:scale-105 transition-all duration-500 shadow-inner">
                    <span className="drop-shadow-sm">{icon}</span>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-gray-500 transition-colors">lock</span>
                        <p className="text-base font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{title}</p>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-sm">{description}</p>
                </div>
            </div>

            {xp && (
                <div className="relative z-10 flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-gray-100/80 group-hover:bg-gray-100 text-gray-400 group-hover:text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold transition-all">
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        +{xp} XP
                    </div>
                </div>
            )}
        </div>
    );
}