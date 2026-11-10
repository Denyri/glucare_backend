import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Phone3D from "./Phone3D";
import ClinicalBadge from "./ui/ClinicalBadge";

gsap.registerPlugin(ScrollTrigger);

export default function PhoneFeatureShowcase() {
    const sectionRef = useRef(null);
    const phoneRef = useRef(null);
    const containerRef = useRef(null);

    // Active hovered card for interactive highlighting
    const [activeFeature, setActiveFeature] = useState(null);

    // Feature Cards and Phone Anchors coordinates
    const [lineCoords, setLineCoords] = useState(null);

    // Anchor & Card DOM Refs
    const phoneAnchor1Ref = useRef(null); // Dynamic Island (Top)
    const phoneAnchor2Ref = useRef(null); // Program 90 Hari (Upper)
    const phoneAnchor3Ref = useRef(null); // Habit Grid (Center)
    const phoneAnchor4Ref = useRef(null); // Insight AI (Lower)

    const card1Ref = useRef(null);
    const card2Ref = useRef(null);
    const card3Ref = useRef(null);
    const card4Ref = useRef(null);

    // ── Function to compute precise SVG line coordinates ─────────────
    const updateCoordinates = () => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        const getRelCoords = (el, attachSide = "right") => {
            if (!el) return { x: 0, y: 0 };
            const rect = el.getBoundingClientRect();
            return {
                x: attachSide === "left"
                    ? rect.left - containerRect.left
                    : attachSide === "center"
                    ? rect.left + rect.width / 2 - containerRect.left
                    : rect.right - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top,
            };
        };

        if (
            phoneAnchor1Ref.current &&
            phoneAnchor2Ref.current &&
            phoneAnchor3Ref.current &&
            phoneAnchor4Ref.current &&
            card1Ref.current &&
            card2Ref.current &&
            card3Ref.current &&
            card4Ref.current
        ) {
            setLineCoords({
                // Line 1: Dynamic Island -> Left Card 1
                line1: {
                    start: getRelCoords(phoneAnchor1Ref.current, "center"),
                    end: getRelCoords(card1Ref.current, "right"),
                },
                // Line 2: Program 90 Hari -> Left Card 2
                line2: {
                    start: getRelCoords(phoneAnchor2Ref.current, "center"),
                    end: getRelCoords(card2Ref.current, "right"),
                },
                // Line 3: Bio-Habit Grid -> Right Card 3
                line3: {
                    start: getRelCoords(phoneAnchor3Ref.current, "center"),
                    end: getRelCoords(card3Ref.current, "left"),
                },
                // Line 4: Insight AI -> Right Card 4
                line4: {
                    start: getRelCoords(phoneAnchor4Ref.current, "center"),
                    end: getRelCoords(card4Ref.current, "left"),
                },
            });
        }
    };

    // ── GSAP ScrollTrigger Animation Orchestration ─────────────────
    useEffect(() => {
        updateCoordinates();
        window.addEventListener("resize", updateCoordinates);

        const ctx = gsap.context(() => {
            // 1. Phone Smooth Rotation on Scroll
            // Transitions from tilted hero angle (-0.18 rad / -0.24 rad) to upright (0.0 / 0.0)
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top 75%",
                end: "top 25%",
                scrub: 1.2,
                onUpdate: (self) => {
                    const progress = self.progress; // 0.0 to 1.0
                    // Interpolate rotation:
                    // Z goes from -0.18 to 0.0 (upright)
                    // Y goes from -0.24 to 0.0 (facing directly forward)
                    const rotZ = -0.18 * (1 - progress);
                    const rotY = -0.24 * (1 - progress);
                    if (phoneRef.current?.setTargetRotation) {
                        phoneRef.current.setTargetRotation(-0.06 * (1 - progress), rotY, rotZ);
                    }
                },
            });

            // 2. Animate Callout Lines and Feature Cards into view
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 65%",
                    toggleActions: "play none none reverse",
                },
            });

            // Pulse in the beacons
            tl.fromTo(
                ".beacon-dot",
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(2)" }
            );

            // Draw SVG Callout Lines
            tl.fromTo(
                ".callout-path",
                { strokeDashoffset: 400, opacity: 0 },
                { strokeDashoffset: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: "power2.out" },
                "-=0.2"
            );

            // Slide in Feature Cards
            tl.fromTo(
                ".feature-card-left",
                { x: -40, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out" },
                "-=0.7"
            );

            tl.fromTo(
                ".feature-card-right",
                { x: 40, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out" },
                "-=0.7"
            );
        }, sectionRef);

        const timer = setTimeout(updateCoordinates, 300);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", updateCoordinates);
            ctx.revert();
        };
    }, []);

    // Helper to generate smooth cubic Bezier curve string
    const createCurvedPath = (start, end) => {
        if (!start || !end) return "";
        const midX = (start.x + end.x) / 2;
        return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
    };

    return (
        <section
            ref={sectionRef}
            className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F4F8FF] via-white to-slate-50 relative overflow-hidden border-t border-slate-200/80"
        >
            {/* Ambient Background Gradient Orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-teal-100/40 via-sky-100/30 to-blue-100/25 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto space-y-12 lg:space-y-16">
                
                {/* ── Section Header ────────────────────────────────────── */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <ClinicalBadge variant="clinical" className="font-subheading font-semibold">
                        Arsitektur Fitur Terintegrasi
                    </ClinicalBadge>
                    <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
                        Eksplorasi Fitur Klinis dalam{" "}
                        <span className="text-[#00A896]">Satu Ekosistem Cerdas.</span>
                    </h2>
                    <p className="font-body font-normal text-slate-600 text-base sm:text-lg leading-relaxed">
                        Ponsel pintar Anda menjadi pusat intervensi metabolik 90 hari. Setiap tombol, grafik, dan modul didesain berdasarkan sains untuk mencegah diabetes tipe 2 sejak dini.
                    </p>
                </div>

                {/* ── Centerpiece 3D Phone with Interactive Callout Lines ──── */}
                <div
                    ref={containerRef}
                    className="relative w-full min-h-[720px] lg:min-h-[820px] flex items-center justify-center py-6"
                >
                    {/* ── Interactive Connecting SVG Lines Layer (Desktop Only) ─ */}
                    {lineCoords && (
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden lg:block"
                            style={{ overflow: "visible" }}
                        >
                            <defs>
                                {/* Linear Gradients for flowing lines */}
                                <linearGradient id="grad-teal-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#00A896" />
                                    <stop offset="100%" stopColor="#2563EB" />
                                </linearGradient>
                                <linearGradient id="grad-blue-teal" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2563EB" />
                                    <stop offset="100%" stopColor="#00A896" />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="glow" />
                                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                                </filter>
                            </defs>

                            {/* Line 1: Dynamic Island -> Left Card 1 */}
                            <path
                                d={createCurvedPath(lineCoords.line1.start, lineCoords.line1.end)}
                                fill="none"
                                stroke={activeFeature === 1 ? "#00A896" : "#64748B"}
                                strokeWidth={activeFeature === 1 ? "3" : "2"}
                                strokeDasharray="300"
                                filter={activeFeature === 1 ? "url(#glow)" : undefined}
                                className="callout-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 1 ? 0.9 : 0.3}
                            />

                            {/* Line 2: Program 90 Hari -> Left Card 2 */}
                            <path
                                d={createCurvedPath(lineCoords.line2.start, lineCoords.line2.end)}
                                fill="none"
                                stroke={activeFeature === 2 ? "#2563EB" : "#64748B"}
                                strokeWidth={activeFeature === 2 ? "3" : "2"}
                                strokeDasharray="300"
                                filter={activeFeature === 2 ? "url(#glow)" : undefined}
                                className="callout-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 2 ? 0.9 : 0.3}
                            />

                            {/* Line 3: Bio-Habit Grid -> Right Card 3 */}
                            <path
                                d={createCurvedPath(lineCoords.line3.start, lineCoords.line3.end)}
                                fill="none"
                                stroke={activeFeature === 3 ? "#0284C7" : "#64748B"}
                                strokeWidth={activeFeature === 3 ? "3" : "2"}
                                strokeDasharray="300"
                                filter={activeFeature === 3 ? "url(#glow)" : undefined}
                                className="callout-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 3 ? 0.9 : 0.3}
                            />

                            {/* Line 4: Insight AI -> Right Card 4 */}
                            <path
                                d={createCurvedPath(lineCoords.line4.start, lineCoords.line4.end)}
                                fill="none"
                                stroke={activeFeature === 4 ? "#059669" : "#64748B"}
                                strokeWidth={activeFeature === 4 ? "3" : "2"}
                                strokeDasharray="300"
                                filter={activeFeature === 4 ? "url(#glow)" : undefined}
                                className="callout-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 4 ? 0.9 : 0.3}
                            />
                        </svg>
                    )}

                    {/* ── 3-Column Layout: Left Cards | 3D Phone | Right Cards ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full z-20">
                        
                        {/* ── Left Column: Cards 1 & 2 (Span 4) ────────────────── */}
                        <div className="lg:col-span-4 space-y-6 sm:space-y-8 flex flex-col justify-center order-2 lg:order-1">
                            
                            {/* Card 1: Dual-Mode AI Clinical Engine */}
                            <div
                                ref={card1Ref}
                                onMouseEnter={() => setActiveFeature(1)}
                                onMouseLeave={() => setActiveFeature(null)}
                                className={`feature-card-left bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border transition-all duration-300 shadow-md ${
                                    activeFeature === 1
                                        ? "border-[#00A896] shadow-xl shadow-teal-500/10 -translate-y-1"
                                        : "border-slate-200/80 hover:border-teal-300"
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#00A896] text-xs font-bold border border-teal-200/60">
                                            <span>⚡ Dynamic Notch AI</span>
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-400">01</span>
                                    </div>
                                    <h3 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
                                        Dual-Mode AI Assessment
                                    </h3>
                                    <p className="font-body text-slate-600 text-sm leading-relaxed">
                                        Skrining prediktif fleksibel menggunakan <strong className="text-slate-800">Mode Lab</strong> (glukosa puasa & HbA1c) atau <strong className="text-slate-800">Mode Kuesioner</strong> non-invasif tanpa jarum suntik.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">Glukosa Puasa</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">HbA1c</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">Profil Lipid</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: 90-Day Protocol Progression */}
                            <div
                                ref={card2Ref}
                                onMouseEnter={() => setActiveFeature(2)}
                                onMouseLeave={() => setActiveFeature(null)}
                                className={`feature-card-left bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border transition-all duration-300 shadow-md ${
                                    activeFeature === 2
                                        ? "border-blue-500 shadow-xl shadow-blue-500/10 -translate-y-1"
                                        : "border-slate-200/80 hover:border-blue-300"
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                                            <span>📅 Program 90 Hari</span>
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-400">02</span>
                                    </div>
                                    <h3 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
                                        Protokol Intervensi 3 Fase
                                    </h3>
                                    <p className="font-body text-slate-600 text-sm leading-relaxed">
                                        Panduan langkah demi langkah membalikkan resistensi insulin: <span className="font-medium text-slate-800">Stabilisasi Dasar (Hari 1–30)</span>, <span className="font-medium text-slate-800">Optimasi (Hari 31–60)</span>, dan <span className="font-medium text-slate-800">Konsolidasi (Hari 61–90)</span>.
                                    </p>
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-blue-700">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span>Progres harian terukur & gamifikasi streak</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* ── Center Column: 3D Phone Stage & Beacon Overlay (Span 4) ─ */}
                        <div className="lg:col-span-4 relative flex flex-col items-center justify-center order-1 lg:order-2">
                            
                            {/* 3D Phone Component */}
                            <div className="relative z-10 w-full flex justify-center">
                                <Phone3D
                                    ref={phoneRef}
                                    initialRotZ={-0.18}
                                    initialRotY={-0.24}
                                    initialRotX={-0.06}
                                    showControls={true}
                                    showBadge={false}
                                    heightClass="h-[600px] sm:h-[640px] md:h-[680px] lg:h-[710px]"
                                />
                            </div>

                            {/* ── Beacon Points Overlay on Phone Display (Desktop) ── */}
                            <div className="absolute inset-0 pointer-events-none hidden lg:block z-30">
                                
                                {/* Beacon 1: Dynamic Island (Top Center) */}
                                <div
                                    ref={phoneAnchor1Ref}
                                    className={`beacon-dot absolute left-1/2 -translate-x-1/2 top-[16%] w-4 h-4 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                                        activeFeature === 1 ? "scale-150" : ""
                                    }`}
                                    onMouseEnter={() => setActiveFeature(1)}
                                    onMouseLeave={() => setActiveFeature(null)}
                                >
                                    <span className="absolute inset-0 rounded-full bg-[#00A896] animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-[#00A896] ring-2 ring-white shadow-md shadow-teal-500/50" />
                                </div>

                                {/* Beacon 2: Program 90 Hari (Upper Center) */}
                                <div
                                    ref={phoneAnchor2Ref}
                                    className={`beacon-dot absolute left-1/2 -translate-x-1/2 top-[32%] w-4 h-4 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                                        activeFeature === 2 ? "scale-150" : ""
                                    }`}
                                    onMouseEnter={() => setActiveFeature(2)}
                                    onMouseLeave={() => setActiveFeature(null)}
                                >
                                    <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-blue-600 ring-2 ring-white shadow-md shadow-blue-500/50" />
                                </div>

                                {/* Beacon 3: Bio-Habit Grid (Middle Center) */}
                                <div
                                    ref={phoneAnchor3Ref}
                                    className={`beacon-dot absolute left-1/2 -translate-x-1/2 top-[52%] w-4 h-4 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                                        activeFeature === 3 ? "scale-150" : ""
                                    }`}
                                    onMouseEnter={() => setActiveFeature(3)}
                                    onMouseLeave={() => setActiveFeature(null)}
                                >
                                    <span className="absolute inset-0 rounded-full bg-sky-500 animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-sky-600 ring-2 ring-white shadow-md shadow-sky-500/50" />
                                </div>

                                {/* Beacon 4: Insight AI & ADA (Lower Center) */}
                                <div
                                    ref={phoneAnchor4Ref}
                                    className={`beacon-dot absolute left-1/2 -translate-x-1/2 top-[68%] w-4 h-4 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                                        activeFeature === 4 ? "scale-150" : ""
                                    }`}
                                    onMouseEnter={() => setActiveFeature(4)}
                                    onMouseLeave={() => setActiveFeature(null)}
                                >
                                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-emerald-600 ring-2 ring-white shadow-md shadow-emerald-500/50" />
                                </div>

                            </div>

                        </div>

                        {/* ── Right Column: Cards 3 & 4 (Span 4) ───────────────── */}
                        <div className="lg:col-span-4 space-y-6 sm:space-y-8 flex flex-col justify-center order-3">
                            
                            {/* Card 3: Daily Bio-Habit Tracking */}
                            <div
                                ref={card3Ref}
                                onMouseEnter={() => setActiveFeature(3)}
                                onMouseLeave={() => setActiveFeature(null)}
                                className={`feature-card-right bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border transition-all duration-300 shadow-md ${
                                    activeFeature === 3
                                        ? "border-sky-500 shadow-xl shadow-sky-500/10 -translate-y-1"
                                        : "border-slate-200/80 hover:border-sky-300"
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/60">
                                            <span>👟 4 Bio-Habit Tracker</span>
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-400">03</span>
                                    </div>
                                    <h3 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
                                        Daily Bio-Habit Tracking
                                    </h3>
                                    <p className="font-body text-slate-600 text-sm leading-relaxed">
                                        Catat 7.000+ langkah harian untuk penyerapan glukosa otot, nutrisi rendah indeks glikemik (Low-GI), serta tidur berkualitas 7–8 jam menjaga stabilitas kortisol.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                                        <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md">7.420 langkah</span>
                                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">Pola Sehat</span>
                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">7h 45m Tidur</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Kepatuhan Standar Medis ADA */}
                            <div
                                ref={card4Ref}
                                onMouseEnter={() => setActiveFeature(4)}
                                onMouseLeave={() => setActiveFeature(null)}
                                className={`feature-card-right bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border transition-all duration-300 shadow-md ${
                                    activeFeature === 4
                                        ? "border-emerald-500 shadow-xl shadow-emerald-500/10 -translate-y-1"
                                        : "border-slate-200/80 hover:border-emerald-300"
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                                            <span>📋 Standar Medis ADA</span>
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-400">04</span>
                                    </div>
                                    <h3 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
                                        Kepatuhan Ambang Batas ADA
                                    </h3>
                                    <p className="font-body text-slate-600 text-sm leading-relaxed">
                                        Mengacu pada pedoman klinis American Diabetes Association: FPG 100–125 mg/dL dan HbA1c 5.7–6.4% sebagai jendela intervensi emas pencegahan diabetes tipe 2.
                                    </p>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                                        <span className="text-slate-500">Ambang Batas Intervensi:</span>
                                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">HbA1c &lt; 5.7%</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
