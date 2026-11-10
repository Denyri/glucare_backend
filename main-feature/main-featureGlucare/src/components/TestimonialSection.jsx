import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClinicalBadge from "./ui/ClinicalBadge";
import { Star, ShieldCheck, TrendingDown, Award } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
    {
        name: "Dimas Prasetyo",
        age: 29,
        profession: "Software Engineer, Jakarta",
        rating: 5,
        beforeAfter: {
            from: "Gula Darah Puasa 118 mg/dL",
            to: "94 mg/dL (Normal)",
            metric: "Turun 24 mg/dL",
        },
        quote:
            "Sering lembur dan begadang bikin hasil MCU saya divonis prediabetes. Mengikuti panduan 90 hari GluCare membuat perubahan gaya hidup terasa realistis: jam tidur dirapikan dan target 7.000 langkah tercapai tanpa rasa tersiksa.",
        badge: "Pembalikan Prediabetes",
    },
    {
        name: "Nadira Anindya",
        age: 33,
        profession: "Product Manager, Bandung",
        rating: 5,
        beforeAfter: {
            from: "HbA1c 6.1%",
            to: "5.4% (Optimal)",
            metric: "HbA1c -0.7%",
        },
        quote:
            "Mode Kuesioner non-invasifnya sangat praktis untuk deteksi awal. Rekomendasi nutrisi dari AI membantu saya menyeimbangkan asupan karbohidrat tanpa harus diet ekstrem. Dalam 3 bulan, HbA1c saya kembali ke batas aman.",
        badge: "Sensitivitas Insulin Optimal",
    },
    {
        name: "Reza Mahendra",
        age: 27,
        profession: "Creative Director, Surabaya",
        rating: 5,
        beforeAfter: {
            from: "Skor Risiko AI: 76%",
            to: "28% (Rendah)",
            metric: "Risiko Turun 48%",
        },
        quote:
            "Smart streak habit system di dashboard bikin saya konsisten setiap hari. Dulu sering lemas di sore hari karena lonjakan gula darah, sekarang energi stabil sepanjang hari. Sangat direkomendasikan untuk generasi muda!",
        badge: "Konsistensi 90 Hari",
    },
];

export default function TestimonialSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".testimonial-card-anim",
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                        once: true,
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="testimoni"
            ref={sectionRef}
            className="py-24 px-6 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50 border-b border-slate-100 scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <ClinicalBadge variant="clinical" className="font-subheading font-semibold">
                        Kisah Sukses Nyata
                    </ClinicalBadge>
                    <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
                        Mereka yang Berhasil{" "}
                        <span className="text-blue-600">Membalikkan Risiko.</span>
                    </h2>
                    <p className="font-body text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                        Simak pengalaman para dewasa muda yang berhasil menjaga kadar glukosa dan memulihkan vitalitas metabolisme bersama GluCare.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div
                            key={idx}
                            className="testimonial-card-anim bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                        >
                            <div className="space-y-5">
                                {/* Top: Badge & Rating */}
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        {t.badge}
                                    </span>
                                    <div className="flex items-center gap-0.5 text-amber-400">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                </div>

                                {/* Metric Highlight Pill */}
                                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                                    <div className="text-xs">
                                        <div className="text-slate-500 font-medium">Sebelum vs Sesudah:</div>
                                        <div className="font-bold text-slate-800">{t.beforeAfter.to}</div>
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs">
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        <span>{t.beforeAfter.metric}</span>
                                    </div>
                                </div>

                                {/* Quote */}
                                <p className="text-slate-600 text-sm leading-relaxed italic">
                                    "{t.quote}"
                                </p>
                            </div>

                            {/* Author */}
                            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-[#00A896] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                    {t.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{t.name}, {t.age} th</h4>
                                    <p className="text-xs text-slate-500">{t.profession}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Proof Badge */}
                <div className="text-center pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 text-slate-600 text-xs font-medium border border-slate-200">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>Metodologi pembalikan gaya hidup berbasis pedoman klinis American Diabetes Association (ADA)</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
