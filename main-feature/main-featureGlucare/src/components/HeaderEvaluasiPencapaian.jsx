function HeaderEvaluasiPencapaian({ title, subtitle }) {
    return (
        <div className="w-full bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-800 text-white px-6 sm:px-10 py-8 lg:py-10 relative overflow-hidden shadow-sm">
            {/* Subtle background glow */}
            <div className="absolute w-60 h-60 bg-white/10 rounded-full top-[-50px] right-[-50px] blur-3xl pointer-events-none"></div>
            <div className="absolute w-40 h-40 bg-purple-400/20 rounded-full bottom-[-30px] left-10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-mono font-semibold text-purple-100 mb-2.5 backdrop-blur-sm border border-white/15">
                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                    <span>GluCare Metabolic Gamification</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display leading-tight">
                    {title}
                </h1>

                {subtitle && (
                    <p className="text-xs sm:text-sm text-purple-100/90 mt-1.5 leading-relaxed max-w-2xl font-normal">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

export default HeaderEvaluasiPencapaian;