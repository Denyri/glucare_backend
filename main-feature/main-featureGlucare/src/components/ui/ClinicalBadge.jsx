import React from "react";

/**
 * ClinicalBadge
 * Displays health risk or clinical verification status using ADA color standards.
 * Variants: 'optimal' | 'warning' | 'danger' | 'clinical' | 'neutral'
 */
export default function ClinicalBadge({ 
    variant = "optimal", 
    children, 
    icon, 
    className = "" 
}) {
    const variantStyles = {
        optimal: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
        warning: "bg-amber-50 text-amber-900 border-amber-200/60",
        danger: "bg-rose-50 text-rose-900 border-rose-200/60",
        clinical: "bg-blue-50 text-blue-800 border-blue-200/60",
        neutral: "bg-slate-100 text-slate-700 border-slate-200/80",
    };

    const dotColors = {
        optimal: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-rose-500",
        clinical: "bg-blue-600",
        neutral: "bg-slate-400",
    };

    return (
        <span 
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${variantStyles[variant] || variantStyles.neutral} ${className}`}
        >
            {icon ? (
                icon
            ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral} animate-pulse`} />
            )}
            {children}
        </span>
    );
}
