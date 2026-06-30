function HeaderEvaluasiPencapaian({title, subtitle}) {
    return (
        <div className="w-full bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#A78BFA] text-white p-8 sm:p-8 lg:p-18 relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight">
                    {title}
                </h1>

                {subtitle && (
                    <p className="text-xs sm:text-sm lg:text-base mt-1 sm:mt-2 opacity-90 leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>

        </div>
    );
}

export default HeaderEvaluasiPencapaian;