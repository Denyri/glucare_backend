import { useState } from "react";

const faqs = [
    {
        question: "Apa itu Glucare?",
        answer:
        "Glucare adalah aplikasi yang mendeteksi gejala pradiabetes menggunakan data klinis atau kuesioner gaya hidup.",
    },
    {
        question: "Bagaimana Glucare bekerja?",
        answer:
        "Anda memasukkan data klinis atau mengisi kuesioner lalu AI menganalisis kondisi Anda.",
    },
    {
        question: "Bagaimana cara memulai dengan Glucare?",
        answer:
        "Masuk atau unduh aplikasinya lalu ikuti panduan dari sistem.",
    },
    {
        question: "Apakah Glucare sepernuhnya gratis digunakan?",
        answer:
        "Ya, Saat ini Glucare sepenuhnya gratis untuk Anda",
    },
];

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState(null);

    return (
        <section className="py-12 sm:py-20 px-4 sm:px-5 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
                Pertanyaan yang sering diajukan
            </h2>

            {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200">
                    <button
                        onClick={() =>
                            setActiveIndex(activeIndex === index ? null : index)
                        }
                        className="w-full py-5 text-left text-base sm:text-xl font-semibold"
                    >
                        {faq.question}
                    </button>

                    {activeIndex === index && (
                        <p className="pb-5 text-sm sm:text-base text-gray-600">{faq.answer}</p>
                    )}
                </div>
            ))}
        </section>
    );
}