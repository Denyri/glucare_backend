function AnalisisCard({ icon, title, description, tags, tagBg, tagText, footerText, footerColor, onClick }) {
    return (
        <div
            onClick={onClick}
            className="p-6 bg-white rounded-xl shadow cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
        >
            <img src={icon} alt={title} className="w-10 h-10 mb-4 object-contain" />

            <h3 className="font-semibold text-lg mb-2 leading-tight">{title}</h3>

            <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">{description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        style={{ background: tagBg, color: tagText }}
                        className="px-2 py-1 text-xs rounded font-semibold"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <p style={{ color: footerColor }} className="font-semibold text-xs group-hover:scale-105 transition-transform">
                {footerText}
            </p>
        </div>
    );
}

export default AnalisisCard;