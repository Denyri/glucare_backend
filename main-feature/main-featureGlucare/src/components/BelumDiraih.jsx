import { Lock, Zap } from "lucide-react";

export default function BelumDiraih({ icon: IconComponent, title, description, xp, tier = "Bronze" }) {
    const isFunctionIcon = typeof IconComponent === "function";

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 opacity-60 shrink-0">
                    {isFunctionIcon ? (
                        <IconComponent className="w-6 h-6" strokeWidth={1.8} />
                    ) : (
                        <Lock className="w-5 h-5 text-slate-400" />
                    )}
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <h4 className="text-sm font-bold text-slate-700 truncate">{title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 leading-snug">{description}</p>
                </div>
            </div>

            {xp && (
                <div className="shrink-0 flex items-center gap-1 text-slate-400 font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100">
                    <Zap className="w-3 h-3 text-slate-400" />
                    <span>+{xp} XP</span>
                </div>
            )}
        </div>
    );
}