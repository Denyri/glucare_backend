import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
    const navigate = useNavigate();
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".cta-content-anim", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="cta-content-anim relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-8 sm:px-16 py-16 sm:py-20 text-center shadow-2xl shadow-blue-500/20 text-white">
                    
                    {/* Ambient subtle light circles */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-subheading font-semibold border border-white/20">
                            <span>✨ Masa Emas Pencegahan</span>
                        </div>

                        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
                            Prediabetes Bukan Vonis Akhir. Kamu Bisa Memulihkannya Hari Ini.
                        </h2>

                        <p className="font-body font-normal text-blue-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                            Semakin cepat kamu tahu, semakin mudah tubuhmu pulih. Dapatkan evaluasi risiko gratis dan panduan langkah demi langkah menuju hidup yang lebih bugar dan berenergi.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
                            <button
                                id="cta-main-btn"
                                onClick={() => navigate("/login")}
                                className="font-button font-semibold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base bg-white text-blue-700 hover:bg-slate-50 shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-100 cursor-pointer"
                            >
                                <span>Cek Risiko Gratis Sekarang</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>

                            <button
                                id="cta-secondary-btn"
                                onClick={() => {
                                    const el = document.getElementById("cara-kerja");
                                    if (el) {
                                        el.scrollIntoView({ behavior: "smooth" });
                                    } else {
                                        navigate("/#cara-kerja");
                                    }
                                }}
                                className="font-button font-semibold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all hover:border-white/50 cursor-pointer"
                            >
                                <span>Pelajari Cara Kerja</span>
                                <span>→</span>
                            </button>
                        </div>

                        <div className="pt-4 flex flex-wrap justify-center items-center gap-5 text-xs text-blue-200/90 font-medium">
                            <span>✓ 100% Gratis Selamanya</span>
                            <span>•</span>
                            <span>✓ Hasil Instan (&lt; 2 Menit)</span>
                            <span>•</span>
                            <span>✓ Kerahasiaan Data Terjamin</span>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}