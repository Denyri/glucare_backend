import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import bgPark from "../assets/Taman Cerah di Tepi Sungai lang=_id_ (1).png";
import Phone3D from "./Phone3D";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
    const navigate = useNavigate();

    const heroRef = useRef(null);
    const bgImageRef = useRef(null);
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // ── GSAP Entry & Parallax Scroll Animations ────────────────────
    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Text & CTAs Stagger In
            if (leftColRef.current?.children) {
                gsap.fromTo(
                    [...leftColRef.current.children],
                    { y: 25, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        stagger: 0.09,
                        ease: "power2.out"
                    }
                );
            }

            // 2. 3D Phone Mockup Entrance
            if (rightColRef.current) {
                gsap.fromTo(
                    rightColRef.current,
                    { y: 35, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.85,
                        ease: "power2.out",
                        delay: 0.12
                    }
                );
            }

            // 3. Parallax Depth on Scroll
            if (bgImageRef.current) {
                gsap.to(bgImageRef.current, {
                    yPercent: 10,
                    scale: 1.05,
                    ease: "none",
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }

            // Subtle opposing parallax for Phone foreground
            if (rightColRef.current) {
                gsap.to(rightColRef.current, {
                    yPercent: -5,
                    ease: "none",
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative overflow-hidden w-full min-h-screen flex items-center pt-24 pb-12 lg:pt-28 lg:pb-14"
        >
            {/* ── Background: High-Res Crystal-Clear Park Image with Parallax ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <img
                    ref={bgImageRef}
                    src={bgPark}
                    alt="Taman Cerah di Tepi Sungai"
                    className="w-full h-full object-cover object-bottom transform will-change-transform scale-[1.03]"
                />

                {/* Soft atmospheric gradient wash across the entire left area to ensure font legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/45 to-transparent pointer-events-none select-none z-1" />
                <div className="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-transparent to-white/30 pointer-events-none select-none z-1" />
            </div>

            {/* ── Main Hero Content ────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full">
                    
                    {/* ── Left Column: Clean Elevated Typography & CTAs (Span 7) ────── */}
                    <div ref={leftColRef} className="lg:col-span-7 space-y-6 lg:space-y-6.5 py-4 relative z-10">

                        {/* Ambient Soft Radial Glow behind text container to guarantee razor-sharp contrast */}
                        <div className="absolute -left-16 -top-16 w-[620px] h-[620px] bg-gradient-to-br from-white/95 via-white/75 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

                        {/* Display Headline: Baloo 2 ExtraBold, Perfectly Aligned Flush Left */}
                        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[4.85rem] text-[#0A1D37] tracking-tight leading-[1.08] select-none">
                            <span className="block drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">Langkah Kecil</span>
                            <span className="block drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">untuk Hidup</span>
                            <span className="relative inline-block text-[#00A896] drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">
                                Lebih Sehat
                                {/* Cheerful radiating sunburst rays on upper right */}
                                <span className="absolute -right-7 sm:-right-9 -top-1 pointer-events-none select-none text-[#00A896]">
                                    <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                        <path d="M6 14C11 10 18 6 26 4" />
                                        <path d="M4 20C10 17 18 15 25 14" strokeWidth="2.6" />
                                        <path d="M5 26C11 25 17 24 23 24" strokeWidth="2.2" />
                                    </svg>
                                </span>
                            </span>
                        </h1>

                        {/* Body / Description: Clean, High Contrast & Neat */}
                        <p className="font-body font-medium text-base sm:text-lg lg:text-[1.2rem] text-[#132A45] leading-relaxed max-w-xl drop-shadow-[0_1px_8px_rgba(255,255,255,0.95)]">
                            GluCare membantu kamu mengetahui risiko prediabetes lebih awal dan membangun kebiasaan hidup sehat melalui program intervensi 90 hari berbasis AI.
                        </p>

                        {/* Action Buttons: Clean & Perfectly Aligned */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-1 relative z-30 pointer-events-auto">
                            <Link
                                to="/login"
                                id="hero-cta-mulai"
                                className="font-button font-semibold inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:px-9 sm:py-4.5 rounded-full bg-[#00A896] hover:bg-[#009485] active:bg-[#008274] active:scale-95 text-white text-base sm:text-lg shadow-xl shadow-teal-700/30 hover:shadow-teal-700/45 hover:-translate-y-0.5 transition-all cursor-pointer select-none relative z-30"
                            >
                                <span>Mulai Sekarang</span>
                                <span className="text-xl">→</span>
                            </Link>

                            <button
                                id="hero-cta-video"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsVideoModalOpen(true);
                                }}
                                className="font-button font-semibold inline-flex items-center justify-center gap-3 px-7 py-4 sm:px-8 sm:py-4.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white active:scale-95 text-[#112340] text-base sm:text-lg border border-slate-200/90 shadow-md shadow-slate-900/10 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group select-none relative z-30"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#112340] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <span>Lihat Video</span>
                            </button>
                        </div>

                        {/* Trust & Clinical Feature Indicators Row */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00A896] flex items-center justify-center text-xs font-bold shadow-2xs">✓</span>
                                <span className="drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">Skrining Cepat & Akurat</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00A896] flex items-center justify-center text-xs font-bold shadow-2xs">✓</span>
                                <span className="drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">Rekomendasi Nutrisi AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00A896] flex items-center justify-center text-xs font-bold shadow-2xs">✓</span>
                                <span className="drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">100% Akses Gratis</span>
                            </div>
                        </div>

                    </div>

                    {/* ── Right Column: 3D Interactive Smartphone Turntable (Span 5) ───── */}
                    <div className="lg:col-span-5 relative flex flex-col items-center justify-center w-full">
                        <div ref={rightColRef} className="relative z-10 w-full flex justify-center lg:justify-end">
                            <Phone3D />
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Interactive Video Modal ──────────────────────────────────── */}
            {isVideoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
                        <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
                                <h3 className="text-sm font-bold">GluCare — Video Promosi & Gaya Hidup Sehat</h3>
                            </div>
                            <button
                                onClick={() => setIsVideoModalOpen(false)}
                                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="relative aspect-video bg-black">
                            <video
                                autoPlay
                                loop
                                controls
                                className="w-full h-full object-cover"
                            >
                                <source src="/videos/hero-bg.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}