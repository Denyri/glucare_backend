import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClinicalBadge from "./ui/ClinicalBadge";

gsap.registerPlugin(ScrollTrigger);

export default function AboutFeatureSection() {
    const sectionRef = useRef(null);
    const bentoRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".bento-item", {
                y: 35,
                opacity: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    toggleActions: "play none none reverse",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 px-6 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto space-y-16">
                
                {/* Header section */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <ClinicalBadge variant="clinical">
                        Arsitektur Klinis & Intervensi
                    </ClinicalBadge>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Dirancang Khusus untuk Pencegahan Dini,{" "}
                        <span className="text-blue-600">Bukan Sekadar Perkiraan.</span>
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                        GluCare mengintegrasikan validasi saintifik National Health and Nutrition Examination Survey (NHANES) dengan protokol intervensi gaya hidup terstruktur 90 hari.
                    </p>
                </div>

                {/* Bento Grid */}
                <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

                    {/* Bento Item 1: Clinical AI Engine (Large, span 7) */}
                    <div className="bento-item lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl flex flex-col justify-between">
                        {/* Background glowing orb */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-semibold border border-blue-400/30">
                                <span>⚡ Mesin Prediksi Klinis</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Dual-Mode AI Assessment
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                                Akses analisis melalui <strong className="text-white">Mode Lab</strong> (glukosa puasa, HbA1c, profil lipid, tekanan darah) atau <strong className="text-white">Mode Kuesioner</strong> non-invasif untuk skrining mandiri tanpa jarum suntik.
                            </p>
                        </div>

                        {/* Interactive-looking Biomarker chips */}
                        <div className="relative z-10 pt-8 mt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80">
                                <div className="text-[10px] uppercase font-mono text-slate-400">Parameter 1</div>
                                <div className="text-sm font-bold text-sky-300">Fasting Glucose</div>
                                <div className="text-[11px] text-slate-400">mg/dL puasa</div>
                            </div>
                            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80">
                                <div className="text-[10px] uppercase font-mono text-slate-400">Parameter 2</div>
                                <div className="text-sm font-bold text-sky-300">HbA1c Level</div>
                                <div className="text-[11px] text-slate-400">% Glikasi Darah</div>
                            </div>
                            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80">
                                <div className="text-[10px] uppercase font-mono text-slate-400">Parameter 3</div>
                                <div className="text-sm font-bold text-sky-300">Rasio TG/HDL</div>
                                <div className="text-[11px] text-slate-400">Sensitivitas insulin</div>
                            </div>
                            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80">
                                <div className="text-[10px] uppercase font-mono text-slate-400">Parameter 4</div>
                                <div className="text-sm font-bold text-sky-300">MAP & BP</div>
                                <div className="text-[11px] text-slate-400">Vaskular arterial</div>
                            </div>
                        </div>
                    </div>

                    {/* Bento Item 2: 90-Day Protocol (Span 5) */}
                    <div className="bento-item lg:col-span-5 bg-gradient-to-br from-blue-50 via-sky-50/50 to-white rounded-3xl p-8 sm:p-10 border border-blue-100/80 shadow-card flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/25">
                                90
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Protokol Intervensi 3 Fase
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Panduan terstruktur bertahap untuk membalikkan resistensi insulin sebelum menjadi diabetes permanen.
                            </p>
                        </div>

                        {/* Phase progression steps */}
                        <div className="space-y-3 pt-6 mt-6 border-t border-blue-100">
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100/60 shadow-xs">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                                <div className="text-xs">
                                    <strong className="text-slate-800">Hari 1–30:</strong> Stabilisasi Dasar & Irama Sirkadian
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100/60 shadow-xs">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">2</span>
                                <div className="text-xs">
                                    <strong className="text-slate-800">Hari 31–60:</strong> Optimasi Metabolik & Sensitivitas Insulin
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100/60 shadow-xs">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">3</span>
                                <div className="text-xs">
                                    <strong className="text-slate-800">Hari 61–90:</strong> Konsolidasi & Pencegahan Jangka Panjang
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bento Item 3: Habit Tracking (Span 6) */}
                    <div className="bento-item lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-card flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                <span>✓ Pelacakan Gaya Hidup</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                                Daily Bio-Habit Tracking
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Catat pemenuhan target tidur 7-8 jam, target langkah harian, dan nutrisi rendah indeks glikemik. Bangun streak sehat setiap hari dengan gamifikasi positif.
                            </p>
                        </div>

                        {/* Interactive Habit Row */}
                        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
                            <div className="bg-slate-50 p-3.5 rounded-2xl text-center">
                                <span className="text-2xl mb-1 block">🌙</span>
                                <div className="text-xs font-bold text-slate-900">Tidur 7-8 Jam</div>
                                <div className="text-[10px] text-slate-500">Irama Sirkadian</div>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-2xl text-center">
                                <span className="text-2xl mb-1 block">👟</span>
                                <div className="text-xs font-bold text-slate-900">7.000+ Langkah</div>
                                <div className="text-[10px] text-slate-500">Serapan Glukosa Otot</div>
                            </div>
                            <div className="bg-slate-50 p-3.5 rounded-2xl text-center">
                                <span className="text-2xl mb-1 block">🥗</span>
                                <div className="text-xs font-bold text-slate-900">Low-GI Nutrition</div>
                                <div className="text-[10px] text-slate-500">Cegah Lonjakan Gula</div>
                            </div>
                        </div>
                    </div>

                    {/* Bento Item 4: Kepatuhan Standar Klinis ADA (Span 6) */}
                    <div className="bento-item lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-card flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                <span>📋 Standar Medis Internasional</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                                Kepatuhan Ambang Batas ADA
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Klasifikasi klinis GluCare mengacu ketat pada kriteria American Diabetes Association: Glukosa Puasa 100–125 mg/dL dan HbA1c 5.7–6.4% sebagai jendela intervensi emas.
                            </p>
                        </div>

                        {/* Risk Table Summary */}
                        <div className="pt-6 mt-6 border-t border-slate-100 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-900 font-medium">
                                <span>Normal / Optimal:</span>
                                <span className="font-mono font-bold">FPG &lt;100 mg/dL | HbA1c &lt;5.7%</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-amber-50 text-amber-900 font-medium">
                                <span>Prediabetes (Target Intervensi):</span>
                                <span className="font-mono font-bold">FPG 100–125 mg/dL | HbA1c 5.7–6.4%</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-rose-50 text-rose-900 font-medium">
                                <span>Diabetes Melitus:</span>
                                <span className="font-mono font-bold">FPG ≥126 mg/dL | HbA1c ≥6.5%</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}