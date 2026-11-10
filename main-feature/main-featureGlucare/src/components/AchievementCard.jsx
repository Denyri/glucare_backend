import { Zap, CheckCircle2 } from "lucide-react";

export default function AchivementCard({ icon: IconComponent, title, description, xp, tier = "Bronze" }) {
    const tierColors = {
        Bronze: "border-amber-200 bg-amber-50/70 text-amber-800",
        Silver: "border-slate-300 bg-slate-100/70 text-slate-800",
        Gold: "border-yellow-300 bg-yellow-50 text-yellow-900",
        Platinum: "border-indigo-300 bg-indigo-50 text-indigo-900",
    };

    const isFunctionIcon = typeof IconComponent === "function";

    return (
        <div className="relative group w-full bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-1 ring-slate-900/5">
            {/* Top Badge Tier */}
            <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${tierColors[tier] || tierColors.Bronze}`}>
                    {tier} Tier
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Telah Diraih
                </span>
            </div>

            <div className="flex flex-col items-center text-center">
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    {isFunctionIcon ? (
                        <IconComponent className="w-8 h-8" strokeWidth={2} />
                    ) : (
                        <span className="text-2xl">{IconComponent}</span>
                    )}
                </div>

                <h3 className="text-base font-bold font-display text-slate-900 mb-1.5 group-hover:text-[#0062E3] transition-colors">
                    {title}
                </h3>

                <p className="text-xs text-slate-500 mb-5 leading-relaxed min-h-[32px] line-clamp-2">
                    {description}
                </p>

                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0062E3] to-cyan-600 text-white text-xs font-mono font-bold shadow-sm">
                    <Zap className="w-3.5 h-3.5" />
                    <span>+{xp} XP</span>
                </div>
            </div>
        </div>
    );
}