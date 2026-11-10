import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import bgPark from "../assets/Taman Cerah di Tepi Sungai lang=_id_ (1).png";
import Phone3D from "./Phone3D";
import ClinicalBadge from "./ui/ClinicalBadge";

gsap.registerPlugin(ScrollTrigger);

export default function HeroFeatureShowcase() {
    const navigate = useNavigate();

    // ── Layout & Animation Refs ────────────────────────────────────
    const pinnedSectionRef = useRef(null);
    const stageContainerRef = useRef(null);
    const heroBgRef = useRef(null);
    const heroTextColRef = useRef(null);
    const phoneStageRef = useRef(null);
    const phoneRef = useRef(null);
    const showcaseHeaderRef = useRef(null);
    const showcaseOverlayRef = useRef(null);
    const leftCardsColRef = useRef(null);
    const rightCardsColRef = useRef(null);

    // ── Hero CTA Button Refs & Anim Handles ────────────────────────
    const ctaBtnMulaiRef = useRef(null);
    const ctaBtnVideoRef = useRef(null);
    const arrowIconRef = useRef(null);
    const playIconRef = useRef(null);
    const floatAnimRef = useRef(null);
    const arrowBounceAnimRef = useRef(null);

    // ── Card Anchor Points (Inner Edge facing phone) ───────────────
    const cardAnchor1Ref = useRef(null);
    const cardAnchor2Ref = useRef(null);
    const cardAnchor3Ref = useRef(null);
    const cardAnchor4Ref = useRef(null);

    // ── Interactive State ──────────────────────────────────────────
    const [activeFeature, setActiveFeature] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [lineCoords, setLineCoords] = useState(null);

    // ── Function to Calculate Precise Line Coordinates from 3D Model ──
    const updateCoordinates = useCallback(() => {
        if (!stageContainerRef.current) return;
        const stageRect = stageContainerRef.current.getBoundingClientRect();

        const getElCenter = (el) => {
            if (!el) return { x: 0, y: 0 };
            const rect = el.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2 - stageRect.left,
                y: rect.top + rect.height / 2 - stageRect.top,
            };
        };

        const phonePins = phoneRef.current?.getAnchorCoords?.();
        if (
            phonePins &&
            cardAnchor1Ref.current &&
            cardAnchor2Ref.current &&
            cardAnchor3Ref.current &&
            cardAnchor4Ref.current
        ) {
            setLineCoords({
                line1: {
                    start: {
                        x: phonePins.pin1.clientX - stageRect.left,
                        y: phonePins.pin1.clientY - stageRect.top,
                    },
                    end: getElCenter(cardAnchor1Ref.current),
                },
                line2: {
                    start: {
                        x: phonePins.pin2.clientX - stageRect.left,
                        y: phonePins.pin2.clientY - stageRect.top,
                    },
                    end: getElCenter(cardAnchor2Ref.current),
                },
                line3: {
                    start: {
                        x: phonePins.pin3.clientX - stageRect.left,
                        y: phonePins.pin3.clientY - stageRect.top,
                    },
                    end: getElCenter(cardAnchor3Ref.current),
                },
                line4: {
                    start: {
                        x: phonePins.pin4.clientX - stageRect.left,
                        y: phonePins.pin4.clientY - stageRect.top,
                    },
                    end: getElCenter(cardAnchor4Ref.current),
                },
            });
        }
    }, []);

    // ── Master GSAP ScrollTrigger Orchestration ────────────────────
    useEffect(() => {
        updateCoordinates();
        window.addEventListener("resize", updateCoordinates);

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // ─────────────────────────────────────────────────────────────
            // 1. DESKTOP EXPERIENCE (≥ 1024px): Seamless Apple-Style Pinned Showcase
            // ─────────────────────────────────────────────────────────────
            mm.add("(min-width: 1024px)", () => {
                const calcHeroOffsetX = () => {
                    const width = window.innerWidth;
                    if (width >= 1280) return 360;
                    return 320;
                };

                const heroOffsetX = calcHeroOffsetX();

                // ── Initial State Setup for Hero ───────────────────────────
                // 1. Hero Text visible
                if (heroTextColRef.current?.children) {
                    gsap.fromTo(
                        [...heroTextColRef.current.children],
                        { y: 30, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            stagger: 0.08,
                            ease: "power2.out",
                        }
                    );
                }

                // 2. Button GSAP pop entrance & micro-interactions
                if (ctaBtnMulaiRef.current && ctaBtnVideoRef.current) {
                    gsap.fromTo(
                        [ctaBtnMulaiRef.current, ctaBtnVideoRef.current],
                        { y: 24, opacity: 0, scale: 0.92 },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.85,
                            delay: 0.3,
                            stagger: 0.12,
                            ease: "back.out(1.6)",
                        }
                    );
                }

                if (arrowIconRef.current) {
                    arrowBounceAnimRef.current = gsap.to(arrowIconRef.current, {
                        x: 4,
                        duration: 0.8,
                        repeat: -1,
                        yoyo: true,
                        ease: "power1.inOut",
                        delay: 1.15,
                    });
                }

                // 3. Phone placed on the right column
                gsap.set(phoneStageRef.current, { x: heroOffsetX, opacity: 1 });

                // 3. Strictly hide Showcase elements in Hero mode (0% visibility, no stray elements)
                gsap.set(showcaseHeaderRef.current, { autoAlpha: 0, y: -25 });
                gsap.set(showcaseOverlayRef.current, { autoAlpha: 0 });
                gsap.set(leftCardsColRef.current, { autoAlpha: 0, x: -50 });
                gsap.set(rightCardsColRef.current, { autoAlpha: 0, x: 50 });
                gsap.set(".callout-line-path", { strokeDashoffset: 400 });

                // ── Master Scrub Timeline ──────────────────────────────────
                const masterTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: pinnedSectionRef.current,
                        start: "top top",
                        end: "+=1700",
                        pin: stageContainerRef.current,
                        scrub: 1.2,
                        anticipatePin: 1,
                        onUpdate: (self) => {
                            const p = self.progress; // 0.0 -> 1.0

                            // ── Three.js Smooth Phone Rotation Interpolation ──
                            // From Hero tilt (-0.18 rad Z, -0.24 rad Y, -0.06 rad X)
                            // To Showcase upright (0.0 rad Z, 0.0 rad Y, 0.0 rad X)
                            if (phoneRef.current?.setTargetRotation) {
                                const rotProgress = Math.min(1, Math.max(0, (p - 0.12) / 0.45));
                                const easeProgress = gsap.parseEase("power2.inOut")(rotProgress);

                                const rotZ = -0.18 * (1 - easeProgress);
                                const rotY = -0.24 * (1 - easeProgress);
                                const rotX = -0.06 * (1 - easeProgress);

                                phoneRef.current.setTargetRotation(rotX, rotY, rotZ);
                            }

                            // Keep line coordinates dynamically updated during scrub
                            if (p > 0.42 && p < 0.98) {
                                updateCoordinates();
                            }
                        },
                    },
                });

                // Phase 1 (p: 0.00 -> 0.35): Fade out Hero Text & Background Park
                masterTl.to(
                    heroTextColRef.current,
                    {
                        autoAlpha: 0,
                        y: -45,
                        pointerEvents: "none",
                        ease: "power2.inOut",
                        duration: 0.35,
                    },
                    0
                );

                masterTl.to(
                    heroBgRef.current,
                    {
                        opacity: 0,
                        scale: 1.04,
                        ease: "power2.inOut",
                        duration: 0.4,
                    },
                    0
                );

                // Phase 2 (p: 0.15 -> 0.58): Glide 3D Phone from Right Column to Center (x: heroOffsetX -> 0)
                masterTl.to(
                    phoneStageRef.current,
                    {
                        x: 0,
                        ease: "power2.inOut",
                        duration: 0.45,
                    },
                    0.15
                );

                // Phase 3 (p: 0.38 -> 0.65): Fade in Showcase Header cleanly below navbar
                masterTl.to(
                    showcaseHeaderRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        ease: "power3.out",
                        duration: 0.28,
                    },
                    0.38
                );

                // Phase 4 (p: 0.48 -> 0.75): Fade in Callout Overlay (Beacons & Lines) & Slide in Cards
                masterTl.to(
                    showcaseOverlayRef.current,
                    {
                        autoAlpha: 1,
                        duration: 0.25,
                        ease: "power2.out",
                    },
                    0.48
                );

                masterTl.to(
                    leftCardsColRef.current,
                    {
                        autoAlpha: 1,
                        x: 0,
                        ease: "power3.out",
                        duration: 0.3,
                    },
                    0.48
                );

                masterTl.to(
                    rightCardsColRef.current,
                    {
                        autoAlpha: 1,
                        x: 0,
                        ease: "power3.out",
                        duration: 0.3,
                    },
                    0.48
                );

                // Phase 5 (p: 0.65 -> 0.88): Draw SVG Pointer Lines from Bezel to Cards
                masterTl.to(
                    ".callout-line-path",
                    {
                        strokeDashoffset: 0,
                        stagger: 0.05,
                        ease: "power2.out",
                        duration: 0.25,
                    },
                    0.65
                );

                // Phase 6 (p: 0.88 -> 1.00): Rest / Showcase hold
                masterTl.to({}, { duration: 0.12 }, 0.88);
            });

            // ─────────────────────────────────────────────────────────────
            // 2. MOBILE & TABLET EXPERIENCE (< 1024px): Responsive Flow
            // ─────────────────────────────────────────────────────────────
            mm.add("(max-width: 1023px)", () => {
                gsap.set(phoneStageRef.current, { x: 0 });
                gsap.set(heroTextColRef.current, { autoAlpha: 1, pointerEvents: "auto" });
                gsap.set(leftCardsColRef.current, { autoAlpha: 1, pointerEvents: "auto" });
                gsap.set(rightCardsColRef.current, { autoAlpha: 1, pointerEvents: "auto" });
                gsap.set(showcaseHeaderRef.current, { autoAlpha: 1, y: 0 });

                ScrollTrigger.create({
                    trigger: phoneStageRef.current,
                    start: "top 80%",
                    end: "top 25%",
                    scrub: 1,
                    onUpdate: (self) => {
                        const p = self.progress;
                        if (phoneRef.current?.setTargetRotation) {
                            const rotZ = -0.18 * (1 - p);
                            const rotY = -0.24 * (1 - p);
                            phoneRef.current.setTargetRotation(-0.06 * (1 - p), rotY, rotZ);
                        }
                    },
                });

                gsap.fromTo(
                    ".feature-card-item",
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: leftCardsColRef.current,
                            start: "top 85%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
                if (ctaBtnMulaiRef.current && ctaBtnVideoRef.current) {
                    gsap.fromTo(
                        [ctaBtnMulaiRef.current, ctaBtnVideoRef.current],
                        { y: 20, opacity: 0, scale: 0.94 },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.7,
                            stagger: 0.1,
                            ease: "back.out(1.5)",
                            delay: 0.2,
                        }
                    );
                }
            });
        }, pinnedSectionRef);

        const initTimer = setTimeout(updateCoordinates, 400);

        return () => {
            clearTimeout(initTimer);
            window.removeEventListener("resize", updateCoordinates);
            ctx.revert();
        };
    }, [updateCoordinates]);

    // ── GSAP Button Hover & Click Micro-interactions ───────────────
    const handleMulaiEnter = () => {
        if (arrowBounceAnimRef.current) arrowBounceAnimRef.current.pause();
        gsap.to(ctaBtnMulaiRef.current, {
            scale: 1.05,
            boxShadow: "0 22px 35px -5px rgba(0, 168, 150, 0.45)",
            duration: 0.25,
            ease: "power2.out",
        });
        if (arrowIconRef.current) {
            gsap.to(arrowIconRef.current, {
                x: 6,
                duration: 0.25,
                ease: "power2.out",
            });
        }
    };

    const handleMulaiLeave = () => {
        gsap.to(ctaBtnMulaiRef.current, {
            scale: 1,
            boxShadow: "0 12px 25px -5px rgba(0, 168, 150, 0.3)",
            duration: 0.3,
            ease: "power2.out",
        });
        if (arrowIconRef.current) {
            gsap.to(arrowIconRef.current, {
                x: 0,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    if (arrowBounceAnimRef.current) arrowBounceAnimRef.current.play();
                },
            });
        }
    };

    const handleVideoEnter = () => {
        gsap.to(ctaBtnVideoRef.current, {
            scale: 1.04,
            boxShadow: "0 16px 30px -6px rgba(17, 35, 64, 0.18)",
            duration: 0.25,
            ease: "power2.out",
        });
        if (playIconRef.current) {
            gsap.to(playIconRef.current, {
                scale: 1.2,
                rotate: 10,
                duration: 0.3,
                ease: "back.out(2)",
            });
        }
    };

    const handleVideoLeave = () => {
        gsap.to(ctaBtnVideoRef.current, {
            scale: 1,
            boxShadow: "0 6px 18px -4px rgba(17, 35, 64, 0.08)",
            duration: 0.3,
            ease: "power2.out",
        });
        if (playIconRef.current) {
            gsap.to(playIconRef.current, {
                scale: 1,
                rotate: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    };

    // ── Smooth Horizontal Departure & Arrival S-Curve ──────────────
    const createCurvedPath = (start, end) => {
        if (!start || !end) return "";
        const dx = end.x - start.x;
        const p1x = start.x + dx * 0.45;
        const p2x = start.x + dx * 0.55;
        return `M ${start.x} ${start.y} C ${p1x} ${start.y}, ${p2x} ${end.y}, ${end.x} ${end.y}`;
    };

    return (
        <section
            ref={pinnedSectionRef}
            id="beranda"
            className="relative w-full bg-[#F4F8FF] overflow-visible scroll-mt-20"
        >
            {/* Anchor untuk Fitur Showcase di fase tengah scrub pin GSAP */}
            <div id="fitur" className="absolute top-[850px] pointer-events-none" />

            {/* ── Viewport Stage Container (Pinned on Desktop) ─────────── */}
            <div
                ref={stageContainerRef}
                className="relative w-full min-h-screen lg:h-screen overflow-hidden flex flex-col justify-center items-center py-16 lg:py-0"
            >
                {/* ── Layer 1: Hero Background Park ───────────────────────────── */}
                <div
                    ref={heroBgRef}
                    className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
                >
                    <img
                        src={bgPark}
                        alt="Taman Cerah di Tepi Sungai"
                        className="w-full h-full object-cover object-bottom scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent z-1" />
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-transparent to-white/40 z-1" />
                </div>

                {/* Soft Showcase Stage Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-50/20 via-white/50 to-slate-100/30 pointer-events-none z-0" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-teal-200/20 via-sky-200/15 to-blue-200/15 rounded-full blur-3xl pointer-events-none z-0" />

                {/* ── Layer 2: Showcase Header (Positioned cleanly below Navbar) ── */}
                <div
                    ref={showcaseHeaderRef}
                    className="lg:absolute lg:top-20 xl:top-22 left-1/2 lg:-translate-x-1/2 w-full max-w-3xl px-4 text-center z-30 pointer-events-none mb-6 lg:mb-0"
                >
                    <div className="space-y-1.5">
                        <ClinicalBadge variant="clinical" className="font-subheading font-semibold shadow-xs">
                            Ekosistem Pemulihan Terpadu
                        </ClinicalBadge>
                        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[2.1rem] text-slate-900 tracking-tight leading-tight">
                            Satu Aplikasi, Transformasi{" "}
                            <span className="text-[#00A896]">Metabolik Menyeluruh.</span>
                        </h2>
                        <p className="font-body text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed hidden sm:block">
                            Pantau glukosa, bangun kebiasaan baru, dan pulihkan metabolisme tubuh langkah demi langkah.
                        </p>
                    </div>
                </div>

                {/* ── Layer 3: Showcase Callout Overlay (Lines + Beacons on Titanium Bezel) ── */}
                <div
                    ref={showcaseOverlayRef}
                    className="absolute inset-0 pointer-events-none z-25 hidden lg:block"
                >
                    {/* SVG Connector Lines */}
                    {lineCoords && (
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ overflow: "visible" }}
                        >
                            <defs>
                                <filter id="glow-callout" x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="3" result="glow" />
                                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                                </filter>
                            </defs>

                            {/* Line 1: Left Bezel Notch -> Card 1 */}
                            <path
                                d={createCurvedPath(lineCoords.line1.start, lineCoords.line1.end)}
                                fill="none"
                                stroke={activeFeature === 1 ? "#00A896" : "#94A3B8"}
                                strokeWidth={activeFeature === 1 ? "3" : "1.8"}
                                strokeDasharray="400"
                                filter={activeFeature === 1 ? "url(#glow-callout)" : undefined}
                                className="callout-line-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 1 ? 0.95 : 0.25}
                            />

                            {/* Line 2: Left Bezel Upper -> Card 2 */}
                            <path
                                d={createCurvedPath(lineCoords.line2.start, lineCoords.line2.end)}
                                fill="none"
                                stroke={activeFeature === 2 ? "#2563EB" : "#94A3B8"}
                                strokeWidth={activeFeature === 2 ? "3" : "1.8"}
                                strokeDasharray="400"
                                filter={activeFeature === 2 ? "url(#glow-callout)" : undefined}
                                className="callout-line-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 2 ? 0.95 : 0.25}
                            />

                            {/* Line 3: Right Bezel Habits -> Card 3 */}
                            <path
                                d={createCurvedPath(lineCoords.line3.start, lineCoords.line3.end)}
                                fill="none"
                                stroke={activeFeature === 3 ? "#0284C7" : "#94A3B8"}
                                strokeWidth={activeFeature === 3 ? "3" : "1.8"}
                                strokeDasharray="400"
                                filter={activeFeature === 3 ? "url(#glow-callout)" : undefined}
                                className="callout-line-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 3 ? 0.95 : 0.25}
                            />

                            {/* Line 4: Right Bezel ADA -> Card 4 */}
                            <path
                                d={createCurvedPath(lineCoords.line4.start, lineCoords.line4.end)}
                                fill="none"
                                stroke={activeFeature === 4 ? "#059669" : "#94A3B8"}
                                strokeWidth={activeFeature === 4 ? "3" : "1.8"}
                                strokeDasharray="400"
                                filter={activeFeature === 4 ? "url(#glow-callout)" : undefined}
                                className="callout-line-path transition-all duration-300"
                                opacity={activeFeature === null || activeFeature === 4 ? 0.95 : 0.25}
                            />
                        </svg>
                    )}

                    {/* 4 Pulsing Beacons sitting directly on Titanium Bezel Edge */}
                    {lineCoords && (
                        <>
                            {/* Beacon 1: Left Bezel Notch (Dual-Mode AI) */}
                            <div
                                style={{ left: lineCoords.line1.start.x, top: lineCoords.line1.start.y }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-auto cursor-pointer"
                                onMouseEnter={() => setActiveFeature(1)}
                                onMouseLeave={() => setActiveFeature(null)}
                            >
                                <div className={`relative w-full h-full transition-transform duration-300 ${activeFeature === 1 ? "scale-140" : ""}`}>
                                    <span className="absolute inset-0 rounded-full bg-[#00A896] animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-[#00A896] ring-2 ring-white shadow-md shadow-teal-500/50" />
                                </div>
                            </div>

                            {/* Beacon 2: Left Bezel Upper (90-Day Protocol) */}
                            <div
                                style={{ left: lineCoords.line2.start.x, top: lineCoords.line2.start.y }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-auto cursor-pointer"
                                onMouseEnter={() => setActiveFeature(2)}
                                onMouseLeave={() => setActiveFeature(null)}
                            >
                                <div className={`relative w-full h-full transition-transform duration-300 ${activeFeature === 2 ? "scale-140" : ""}`}>
                                    <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-blue-600 ring-2 ring-white shadow-md shadow-blue-500/50" />
                                </div>
                            </div>

                            {/* Beacon 3: Right Bezel Mid-Lower (Bio-Habits) */}
                            <div
                                style={{ left: lineCoords.line3.start.x, top: lineCoords.line3.start.y }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-auto cursor-pointer"
                                onMouseEnter={() => setActiveFeature(3)}
                                onMouseLeave={() => setActiveFeature(null)}
                            >
                                <div className={`relative w-full h-full transition-transform duration-300 ${activeFeature === 3 ? "scale-140" : ""}`}>
                                    <span className="absolute inset-0 rounded-full bg-sky-500 animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-sky-600 ring-2 ring-white shadow-md shadow-sky-500/50" />
                                </div>
                            </div>

                            {/* Beacon 4: Right Bezel Lower (ADA Standard) */}
                            <div
                                style={{ left: lineCoords.line4.start.x, top: lineCoords.line4.start.y }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-auto cursor-pointer"
                                onMouseEnter={() => setActiveFeature(4)}
                                onMouseLeave={() => setActiveFeature(null)}
                            >
                                <div className={`relative w-full h-full transition-transform duration-300 ${activeFeature === 4 ? "scale-140" : ""}`}>
                                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                    <span className="relative block w-full h-full rounded-full bg-emerald-600 ring-2 ring-white shadow-md shadow-emerald-500/50" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Main Centered Stage Container ─────────────────────────── */}
                <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-10 z-20 flex flex-col lg:flex-row items-center justify-center min-h-[560px] lg:h-full">
                    
                    {/* ── HERO TEXT LAYER (Desktop: absolute left, Mobile: natural top) ── */}
                    <div
                        ref={heroTextColRef}
                        className="lg:absolute lg:left-8 xl:left-12 lg:w-[540px] xl:w-[600px] space-y-5 lg:space-y-6 py-4 z-30 pointer-events-auto"
                    >
                        <div className="absolute -left-16 -top-16 w-[540px] h-[540px] bg-gradient-to-br from-white/95 via-white/80 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

                        {/* Display Headline */}
                        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[4.15rem] text-[#0A1D37] tracking-tight leading-[1.08] select-none">
                            <span className="block drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">Langkah Kecil</span>
                            <span className="block drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">untuk Hidup</span>
                            <span className="relative inline-block text-[#00A896] drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">
                                Lebih Sehat
                                <span className="absolute -right-7 sm:-right-9 -top-1 pointer-events-none select-none text-[#00A896]">
                                    <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                        <path d="M6 14C11 10 18 6 26 4" />
                                        <path d="M4 20C10 17 18 15 25 14" strokeWidth="2.6" />
                                        <path d="M5 26C11 25 17 24 23 24" strokeWidth="2.2" />
                                    </svg>
                                </span>
                            </span>
                        </h1>

                        {/* Body Description */}
                        <p className="font-body font-medium text-base sm:text-lg lg:text-[1.12rem] text-[#132A45] leading-relaxed max-w-xl drop-shadow-[0_1px_8px_rgba(255,255,255,0.95)]">
                            Prediabetes bisa dicegah dan dibalikkan. Kenali risiko gula darahmu lebih awal tanpa cemas, dan bangun kembali metabolisme tubuhmu lewat panduan 90 hari berbasis sains klinis.
                        </p>

                        {/* Action Buttons with GSAP Micro-animations */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-1 relative z-30 pointer-events-auto">
                            <Link
                                to="/login"
                                ref={ctaBtnMulaiRef}
                                id="hero-cta-mulai"
                                onMouseEnter={handleMulaiEnter}
                                onMouseLeave={handleMulaiLeave}
                                className="font-button font-semibold inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full bg-[#00A896] hover:bg-[#009485] active:scale-95 text-white text-base sm:text-lg shadow-xl shadow-teal-700/30 cursor-pointer select-none transition-transform will-change-transform relative z-30"
                            >
                                <span>Cek Risiko Gratis</span>
                                <span ref={arrowIconRef} className="text-xl inline-block will-change-transform">→</span>
                            </Link>

                            <button
                                ref={ctaBtnVideoRef}
                                id="hero-cta-video"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsVideoModalOpen(true);
                                }}
                                onMouseEnter={handleVideoEnter}
                                onMouseLeave={handleVideoLeave}
                                className="font-button font-semibold inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-white/95 backdrop-blur-md hover:bg-white active:scale-95 text-[#112340] text-base sm:text-lg border border-slate-200/90 shadow-md shadow-slate-900/10 cursor-pointer group select-none transition-transform will-change-transform relative z-30"
                            >
                                <div
                                    ref={playIconRef}
                                    className="w-8 h-8 rounded-full bg-[#112340] text-white flex items-center justify-center will-change-transform"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <span>Tonton Cara Kerja</span>
                            </button>
                        </div>

                        {/* Trust & Clinical Feature Indicators */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00A896] flex items-center justify-center text-xs font-bold shadow-2xs">✓</span>
                                <span className="drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">Skrining Cepat (&lt; 2 Menit)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00A896] flex items-center justify-center text-xs font-bold shadow-2xs">✓</span>
                                <span className="drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">Rekomendasi Nutrisi AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-[#00A896] flex items-center justify-center text-xs font-bold shadow-2xs">✓</span>
                                <span className="drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">100% Gratis & Terlindungi</span>
                            </div>
                        </div>
                    </div>

                    {/* ── SHOWCASE LEFT CARDS (Clean Flank on Left) ─────────────── */}
                    <div
                        ref={leftCardsColRef}
                        className="space-y-4 lg:space-y-5 flex flex-col justify-center z-20 lg:absolute lg:left-6 xl:left-12 lg:w-[310px] xl:w-[335px] pointer-events-auto my-6 lg:my-0"
                    >
                        {/* Card 1: Dual-Mode AI Assessment */}
                        <div
                            onMouseEnter={() => setActiveFeature(1)}
                            onMouseLeave={() => setActiveFeature(null)}
                            className={`feature-card-item relative bg-white/95 backdrop-blur-md rounded-2xl p-4.5 sm:p-5 border transition-all duration-300 shadow-md ${
                                activeFeature === 1
                                    ? "border-[#00A896] shadow-xl shadow-teal-500/15 -translate-y-0.5"
                                    : "border-slate-200/90 hover:border-teal-300"
                            }`}
                        >
                            {/* Card Anchor Pin (Right Edge) */}
                            <div
                                ref={cardAnchor1Ref}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#00A896] shadow-xs hidden lg:block"
                            />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#00A896] text-[11px] font-bold border border-teal-200/60">
                                        <span>⚡ Skrining Cerdas</span>
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-400">01</span>
                                </div>
                                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                                    Asesmen Risiko Dual-Mode AI
                                </h3>
                                <p className="font-body text-slate-600 text-xs leading-relaxed">
                                    Pilih cara skrining ternyamanmu: unggah hasil lab darah atau jawab kuesioner gaya hidup non-invasif tanpa perlu jarum suntik.
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">Gula Darah Puasa</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">Kadar HbA1c</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">Profil Lipid</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Protokol 90 Hari */}
                        <div
                            onMouseEnter={() => setActiveFeature(2)}
                            onMouseLeave={() => setActiveFeature(null)}
                            className={`feature-card-item relative bg-white/95 backdrop-blur-md rounded-2xl p-4.5 sm:p-5 border transition-all duration-300 shadow-md ${
                                activeFeature === 2
                                    ? "border-blue-500 shadow-xl shadow-blue-500/15 -translate-y-0.5"
                                    : "border-slate-200/90 hover:border-blue-300"
                            }`}
                        >
                            {/* Card Anchor Pin (Right Edge) */}
                            <div
                                ref={cardAnchor2Ref}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-xs hidden lg:block"
                            />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/60">
                                        <span>📅 Program 90 Hari</span>
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-400">02</span>
                                </div>
                                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                                    Protokol Intervensi 3 Fase
                                </h3>
                                <p className="font-body text-slate-600 text-xs leading-relaxed">
                                    Rencana bertahap terbukti klinis: <span className="font-medium text-slate-800">Stabilisasi Ritme Hidup</span> (H 1–30), <span className="font-medium text-slate-800">Optimasi Insulin</span> (H 31–60), dan <span className="font-medium text-slate-800">Proteksi Jangka Panjang</span> (H 61–90).
                                </p>
                                <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[10px] font-semibold text-blue-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span>Target harian adaptif & pengingat ramah</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 3D SMARTPHONE CENTERPIECE (Pristine Display, Clean Flank) ── */}
                    <div
                        ref={phoneStageRef}
                        className="relative flex flex-col items-center justify-center w-full max-w-[390px] sm:max-w-[420px] z-20 my-4 lg:my-0 lg:mt-24 xl:mt-28"
                    >
                        <div className="relative w-full flex justify-center">
                            <Phone3D
                                ref={phoneRef}
                                initialRotZ={-0.18}
                                initialRotY={-0.24}
                                initialRotX={-0.06}
                                showControls={true}
                                showBadge={false}
                                heightClass="h-[490px] sm:h-[520px] md:h-[540px] lg:h-[550px] xl:h-[560px]"
                            />
                        </div>
                    </div>

                    {/* ── SHOWCASE RIGHT CARDS (Clean Flank on Right) ────────────── */}
                    <div
                        ref={rightCardsColRef}
                        className="space-y-4 lg:space-y-5 flex flex-col justify-center z-20 lg:absolute lg:right-6 xl:right-12 lg:w-[310px] xl:w-[335px] pointer-events-auto my-6 lg:my-0"
                    >
                        {/* Card 3: Daily Bio-Habit Tracking */}
                        <div
                            onMouseEnter={() => setActiveFeature(3)}
                            onMouseLeave={() => setActiveFeature(null)}
                            className={`feature-card-item relative bg-white/95 backdrop-blur-md rounded-2xl p-4.5 sm:p-5 border transition-all duration-300 shadow-md ${
                                activeFeature === 3
                                    ? "border-sky-500 shadow-xl shadow-sky-500/15 -translate-y-0.5"
                                    : "border-slate-200/90 hover:border-sky-300"
                            }`}
                        >
                            {/* Card Anchor Pin (Left Edge) */}
                            <div
                                ref={cardAnchor3Ref}
                                className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-sky-600 shadow-xs hidden lg:block"
                            />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200/60">
                                        <span>👟 4 Pilar Kebiasaan</span>
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-400">03</span>
                                </div>
                                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                                    Pelacakan Kebiasaan Kunci
                                </h3>
                                <p className="font-body text-slate-600 text-xs leading-relaxed">
                                    Bentuk rutinitas yang disukai tubuh: 7.000+ langkah untuk serapan gula otot, nutrisi seimbang minim lonjakan gula, dan tidur pulas 7–8 jam.
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
                                    <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded">7.000+ Langkah</span>
                                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Rendah Gula</span>
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Tidur 7-8 Jam</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Kepatuhan Standar Medis ADA */}
                        <div
                            onMouseEnter={() => setActiveFeature(4)}
                            onMouseLeave={() => setActiveFeature(null)}
                            className={`feature-card-item relative bg-white/95 backdrop-blur-md rounded-2xl p-4.5 sm:p-5 border transition-all duration-300 shadow-md ${
                                activeFeature === 4
                                    ? "border-emerald-500 shadow-xl shadow-emerald-500/15 -translate-y-0.5"
                                    : "border-slate-200/90 hover:border-emerald-300"
                            }`}
                        >
                            {/* Card Anchor Pin (Left Edge) */}
                            <div
                                ref={cardAnchor4Ref}
                                className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 shadow-xs hidden lg:block"
                            />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                                        <span>📋 Standar Medis ADA</span>
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-400">04</span>
                                </div>
                                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                                    Standar Klinis Terpercaya (ADA)
                                </h3>
                                <p className="font-body text-slate-600 text-xs leading-relaxed">
                                    Mengacu pada pedoman resmi American Diabetes Association untuk mengenali batas kritis prediabetes sebelum berkembang menjadi diabetes permanen.
                                </p>
                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                                    <span className="text-slate-500">Target Normal:</span>
                                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">HbA1c &lt; 5.7% (Bebas Prediabetes)</span>
                                </div>
                            </div>
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
                                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
