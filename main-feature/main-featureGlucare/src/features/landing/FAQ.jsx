import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClinicalBadge from "./ui/ClinicalBadge";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
    {
        category: "Klinis & AI",
        q: "Apa itu GluCare dan bagaimana AI mendeteksi risiko prediabetes?",
        a: "GluCare adalah platform kesehatan metabolik berbasis kecerdasan buatan. Model AI kami dilatih menggunakan dataset representatif National Health and Nutrition Examination Survey (NHANES) 2021–2023 dari CDC, khusus untuk kelompok usia dewasa muda (20–40 tahun). AI menganalisis korelasi glukosa darah puasa, HbA1c, profil lipid (rasio TG/HDL), dan tekanan darah untuk memberikan estimasi risiko yang akurat.",
    },
    {
        category: "Klinis & AI",
        q: "Apakah saya harus punya hasil lab darah untuk menggunakan GluCare?",
        a: "Tidak harus! GluCare menyediakan dua mode asesmen: Mode Lab (bagi Anda yang memiliki hasil tes laboratorium darah) dan Mode Kuesioner (berbasis faktor risiko non-invasif seperti riwayat keluarga, lingkar pinggang, pola aktivitas, dan hipertensi). Keduanya memberikan estimasi risiko serta rekomendasi tindak lanjut.",
    },
    {
        category: "Program",
        q: "Apa itu Protokol Intervensi 90 Hari GluCare?",
        a: "Protokol 90 Hari adalah intervensi gaya hidup terstruktur dalam 3 fase berbasis sains: Fase 1 (Hari 1–30: Stabilisasi Irama Sirkadian & Hidrasi), Fase 2 (Hari 31–60: Optimasi Metabolik & Latihan Resistensi Insulin), dan Fase 3 (Hari 61–90: Konsolidasi Kebiasaan Sehat Jangka Panjang). Anda dipandu setiap hari dengan target realistis.",
    },
    {
        category: "Keamanan",
        q: "Apakah data biometrik dan privasi saya terlindungi?",
        a: "Ya, 100%. GluCare mematuhi standar privasi data medis yang ketat. Seluruh transmisi data dienkripsi end-to-end, dan data biometrik Anda tidak akan pernah dibagikan atau dijual ke pihak ketiga mana pun tanpa persetujuan eksplisit Anda.",
    },
    {
        category: "Umum",
        q: "Apakah asesmen dan rekomendasi di GluCare sepenuhnya gratis?",
        a: "Ya. Akses skrining risiko awal, simulasi interaktif ADA, serta panduan dasar intervensi metabolik dapat diakses secara gratis untuk mendukung pencegahan prediabetes di Indonesia.",
    },
];

export default function FAQ() {
    const [active, setActive] = useState(0); // open first item by default
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".faq-item-anim", {
                y: 25,
                opacity: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 78%",
                    toggleActions: "play none none reverse",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const toggle = (i) => {
        setActive(active === i ? null : i);
    };

    return (
        <section ref={sectionRef} className="py-24 px-6 bg-slate-50/60 border-b border-slate-100">
            <div className="max-w-3xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-3">
                    <ClinicalBadge variant="clinical">
                        Frequently Asked Questions
                    </ClinicalBadge>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Pertanyaan Umum Seputar{" "}
                        <span className="text-blue-600">GluCare</span>
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                        Pelajari bagaimana sistem klinis, validasi NHANES, dan protokol intervensi GluCare bekerja untuk Anda.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-3.5">
                    {faqs.map((faq, i) => {
                        const isOpen = active === i;
                        return (
                            <div
                                key={i}
                                className={`faq-item-anim rounded-2xl border transition-all duration-200 overflow-hidden ${
                                    isOpen
                                        ? "bg-white border-blue-200/80 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10"
                                        : "bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                                }`}
                            >
                                <button
                                    id={`faq-btn-${i}`}
                                    onClick={() => toggle(i)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                                >
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {faq.category}
                                        </span>
                                        <h3 className={`font-bold text-sm sm:text-base transition-colors ${
                                            isOpen ? "text-blue-600" : "text-slate-900"
                                        }`}>
                                            {faq.q}
                                        </h3>
                                    </div>
                                    <div
                                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-transform duration-200 ${
                                            isOpen ? "bg-blue-600 text-white rotate-180" : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100/80">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}