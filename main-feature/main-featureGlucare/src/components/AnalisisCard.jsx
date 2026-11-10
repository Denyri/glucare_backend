function AnalisisCard({ icon, title, description, tags, tagBg, tagText, footerText, footerColor, onClick }) {
    return (
        <div
            onClick={onClick}
            className="p-7 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm cursor-pointer hover:shadow-card hover:-translate-y-1 hover:border-blue-400 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
        >
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full pointer-events-none group-hover:bg-blue-100/50 transition-colors"></div>

            <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 mb-5 group-hover:scale-105 transition-transform">
                    <img src={icon} alt={title} className="w-full h-full object-contain" />
                </div>

                <h3 className="font-bold font-display text-xl text-slate-900 mb-2 leading-tight group-hover:text-[#0062E3] transition-colors">
                    {title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            style={{ background: tagBg, color: tagText }}
                            className="px-2.5 py-1 text-xs rounded-lg font-semibold font-mono border border-current/10"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span style={{ color: footerColor }} className="font-bold text-xs">
                    {footerText}
                </span>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#0062E3] group-hover:translate-x-1 transition-all text-[20px]">
                    arrow_forward
                </span>
            </div>
        </div>
    );
}

export default AnalisisCard;