function HeaderAnalisis({title, subtitle}) {
    return (
        <div className="w-full bg-gradient-to-r from-[#0072CE] to-[#3E97FF] text-white p-8 sm:p-8 lg:p-18 relative overflow-hidden">
            
            <div className="absolute w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full top-[-25px] sm:top-[-30px] right-4 sm:right-10 blur-sm"></div>
            <div className="absolute w-20 h-20 sm:w-28 sm:h-28 bg-white/10 rounded-full top-[-35px] sm:top-[-40px] left-8 sm:left-20 lg:left-80 blur-sm"></div>

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

export default HeaderAnalisis;