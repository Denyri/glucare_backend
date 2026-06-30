export default function AchivementCard ({
    icon, title, description, xp
}) {
    return (
        <div className="relative group w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0072CE]/20 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            {/* Decorative Gradient Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0072CE]/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0072CE]/10 to-[#3E97FF]/5 flex items-center justify-center text-3xl mb-5 shadow-inner border border-white group-hover:rotate-6 transition-transform duration-300">
                    <span className="drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{icon}</span>
                </div>
                
                <h3 className="text-lg font-extrabold text-gray-800 mb-2 group-hover:text-[#0072CE] transition-colors">
                    {title}
                </h3>
                
                <p className="text-sm text-gray-500 mb-6 h-10 line-clamp-2 leading-relaxed">
                    {description}
                </p>
                
                <div className="bg-gradient-to-r from-[#0072CE] to-[#3E97FF] text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-1 group-hover:shadow-blue-500/40 transition-shadow"> 
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    +{xp} XP                
                </div>
            </div>
        </div>
    );
}