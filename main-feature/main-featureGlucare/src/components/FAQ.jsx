import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClinicalBadge from "./ui/ClinicalBadge";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
    {
        category: "Klinis & AI",
        q: "Apa itu GluCare dan bagaimana AI mendeteksi risiko prediabetes?",
        a: "GluCare adalah platform kesehatan metabolik berbasis kecerdasan buatan. Model AI kami dilatih menggunakan dataset representatif National Health and Nutrition Examination Survey (NHANES) dari CDC, khusus untuk profil usia dewasa muda (20–40 tahun). AI menganalisis korelasi glukosa darah puasa, HbA1c, profil lipid, dan tekanan darah untuk memberikan estimasi risiko yang akurat dan objektif.",
    },
    {
        category: "Pilihan Skrining",
        q: "Apakah saya wajib memiliki hasil tes laboratorium darah untuk menggunakan GluCare?",
        a: "Tidak wajib! GluCare menyediakan dua pilihan asesmen: Mode Lab (jika kamu memiliki hasil tes laboratorium darah) dan Mode Kuesioner (berbasis faktor risiko non-invasif seperti riwayat keluarga, lingkar perut, aktivitas fisik, dan tekanan darah). Keduanya memberikan estimasi risiko yang jelas serta langkah nyata yang bisa langsung kamu lakukan.",
    },
    {
        category: "Program 90 Hari",
        q: "Bagaimana cara kerja Protokol Intervensi 90 Hari GluCare?",
        a: "Protokol 90 Hari adalah pendampingan gaya hidup bertahap dalam 3 fase berbasis sains: Fase 1 (Hari 1–30: Penataan Jam Tidur & Hidrasi), Fase 2 (Hari 31–60: Peningkatan Sensitivitas Insulin & Gerak Aktif), dan Fase 3 (Hari 61–90: Penguncian Kebiasaan Sehat Jangka Panjang). Kamu akan dipandu setiap hari dengan target kecil yang mudah dicapai tanpa rasa terbebani.",
    },
    {
        category: "Keamanan Data",
        q: "Apakah data kesehatan dan privasi saya aman?",
        a: "Sangat aman. GluCare menjunjung tinggi privasi data kesehatan pengguna. Seluruh transmisi informasi dienkripsi standar industri, dan catatan kesehatanmu tidak akan pernah dibagikan atau dijual kepada pihak ketiga mana pun tanpa izin darimu.",
    },
    {
        category: "Akses & Biaya",
        q: "Apakah skrining dan panduan di GluCare sepenuhnya gratis?",
        a: "Ya, 100% gratis. Skrining risiko AI, kalkulator ambang batas ADA, serta rekomendasi kebiasaan harian dapat kamu akses tanpa biaya langganan, demi mendukung gerakan pencegahan prediabetes di Indonesia.",
    },
];

export default function FAQ() {
    const [active, setActive] = useState(0); // open first item by default
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".faq-item-anim",
                { y: 25, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.08,
                    duration: 0.6,
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

    const toggle = (i) => {
        setActive(active === i ? null : i);
    };

    return (
        <section id="faq" ref={sectionRef} className="py-24 px-6 bg-slate-50/60 border-b border-slate-100 scroll-mt-20">
            <div className="max-w-3xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-3">
                    <ClinicalBadge variant="clinical">
                        Pusat Tanya Jawab
                    </ClinicalBadge>
                    <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                        Pertanyaan Umum Seputar{" "}
                        <span className="text-blue-600">GluCare</span>
                    </h2>
                    <p className="font-body font-normal text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                        Semua yang perlu kamu ketahui tentang cara kerja skrining AI, panduan pemulihan 90 hari, dan keamanan datamu.
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
                                    className="font-subheading font-semibold w-full flex items-center justify-between px-6 py-5 text-left gap-4 cursor-pointer"
                                >
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {faq.category}
                                        </span>
                                        <h3 className={`font-subheading font-semibold text-sm sm:text-base transition-colors ${
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
                                    <div className="font-body font-normal px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100/80">
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