import React, { useState, useRef } from "react";

export default function PhoneMockup() {
    const iframeRef = useRef(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const handleReset = () => {
        setIsSpinning(false);
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ action: "reset" }, "*");
        }
    };

    const handleToggleSpin = () => {
        const nextState = !isSpinning;
        setIsSpinning(nextState);
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ action: "toggleSpin" }, "*");
        }
    };

    return (
        <div className="relative flex flex-col items-center w-full max-w-[440px] sm:max-w-[460px] mx-auto select-none">
            
            {/* ── Cheerful Radiating Accent Arcs on top-right ── */}
            <div className="absolute -top-3 right-6 sm:right-8 pointer-events-none select-none z-0 text-[#00A896] opacity-90 animate-pulse">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-6" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
                    <path d="M14 10C21 14 26 21 28 30" />
                    <path d="M22 8C29 13 34 20 36 29" strokeWidth="2.6" />
                </svg>
            </div>

            {/* ── 3D Canvas / Iframe Container ── */}
            <div className="relative w-full h-[580px] sm:h-[620px] md:h-[650px] lg:h-[680px] xl:h-[700px] flex items-center justify-center">
                {/* Soft ambient glow behind phone to blend seamlessly with park pathway */}
                <div className="absolute inset-x-6 inset-y-12 bg-gradient-to-tr from-teal-400/20 via-sky-300/15 to-emerald-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

                <iframe
                    ref={iframeRef}
                    src="/turntable-hp-3d.html?hero=1"
                    title="Model 3D GluCare Smartphone"
                    onLoad={() => setIframeLoaded(true)}
                    className="w-full h-full border-0 bg-transparent relative z-10 transition-opacity duration-500 ease-out cursor-grab active:cursor-grabbing"
                    style={{
                        opacity: iframeLoaded ? 1 : 0,
                    }}
                    allow="accelerometer; gyroscope"
                />

                {/* Loading skeleton placeholder */}
                {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <div className="w-9 h-9 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-slate-500">Memuat Model 3D Ponsel...</span>
                    </div>
                )}
            </div>

            {/* ── Interactive 3D Turntable Mini Control Pill ── */}
            <div className="relative -mt-6 sm:-mt-8 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/10 text-xs text-slate-700 transition-all hover:bg-white hover:shadow-xl">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>3D Interaktif</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">Geser untuk memutar</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <button
                    onClick={handleToggleSpin}
                    className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                        isSpinning
                            ? "bg-teal-600 text-white font-semibold"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                    title="Putar otomatis ponsel"
                >
                    {isSpinning ? "Jeda" : "Putar"}
                </button>
                <button
                    onClick={handleReset}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                    title="Atur ulang sudut awal"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
