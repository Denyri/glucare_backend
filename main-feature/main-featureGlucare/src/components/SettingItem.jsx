import { FaChevronRight } from "react-icons/fa";

export default function SettingItem({ icon: Icon, label, onClick }) {
    return (
        <div
            onClick={onClick}
            className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition group"
        >
            <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0062E3] flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                    <Icon />
                </div>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-[#0062E3] transition-colors">
                    {label}
                </span>
            </div>

            <FaChevronRight className="text-slate-400 group-hover:text-[#0062E3] group-hover:translate-x-0.5 transition-all text-xs" />
        </div>
    );
}