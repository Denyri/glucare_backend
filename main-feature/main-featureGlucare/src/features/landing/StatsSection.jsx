import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
    { value: 95, suffix: "%", label: "Akurasi Prediksi AI", desc: "Tervalidasi pada dataset klinis NHANES" },
    { value: 653, suffix: "", label: "Kohort Uji Validasi", desc: "Data representatif dewasa muda 20–40 thn" },
    { value: 90, suffix: " Hari", label: "Protokol Terstruktur", desc: "3 Fase intervensi gaya hidup & nutrisi" },
    { value: 3, suffix: "x", label: "Peluang Reversal", desc: "Lebih tinggi saat terdeteksi pada fase prediabetes" },
];

export default function StatsSection() {
    const sectionRef = useRef(null);
    const numRefs = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".stat-box", {
                y: 30,
                opacity: 0,
                stagger: 0.1,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });

            stats.forEach((stat, i) => {
                const el = numRefs.current[i];
                if (!el) return;
                ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: "top 80%",
                    once: true,
                    onEnter: () => {
                        gsap.fromTo(
                            { val: 0 },
                            { val: stat.value },
                            {
                                duration: 1.6,
                                ease: "power2.out",
                                onUpdate() {
                                    el.textContent =
                                        Math.round(this.targets()[0].val).toLocaleString() +
                                        stat.suffix;
                                },
                            }
                        );
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 px-6 bg-slate-50/70 border-b border-slate-100">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="stat-box bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all text-center flex flex-col justify-center"
                        >
                            <div
                                ref={(el) => (numRefs.current[i] = el)}
                                className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono tracking-tight mb-2"
                            >
                                0{s.suffix}
                            </div>
                            <div className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                                {s.label}
                            </div>
                            <div className="text-xs text-slate-500 leading-snug">
                                {s.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
