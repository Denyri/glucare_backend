import React from "react";

/**
 * GlassCard
 * Modern card container with subtle glassmorphic backdrop, crisp border, and ambient shadow.
 */
export default function GlassCard({
    children,
    className = "",
    hoverEffect = true,
    dark = false,
    onClick,
    ...props
}) {
    const baseStyles = dark
        ? "bg-slate-900/90 text-white border-white/10 shadow-2xl backdrop-blur-xl"
        : "bg-white/95 text-slate-900 border-slate-200/80 shadow-card backdrop-blur-md";

    const hoverStyles = hoverEffect
        ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-blue-500/30 cursor-pointer"
        : "";

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border p-6 ${baseStyles} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
