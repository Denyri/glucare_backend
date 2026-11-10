export default function ProfileItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0062E3] flex items-center justify-center text-sm shrink-0">
                <Icon />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-bold text-slate-800 truncate">{value}</span>
            </div>
        </div>
    );
}