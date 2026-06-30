import Navbar from "../components/Navbar";
import CTASection from "../components/CTAsection";
import Footer from "../components/Footer";

import enterHealthData from "../assets/how-it0works/Enter-Health-Data.png";
import riskAnalysis from "../assets/how-it0works/Risk-Analisis.png";
import healthInsight from "../assets/how-it0works/Health-Insight.png";
import improveLifestyle from "../assets/how-it0works/Improve-Lifestyle.png";

export default function CaraKerja() {
    const steps = [
        {
            number: 1,
            title: "Masukkan Data Kesehatan Anda",
            description:
                "Isi informasi kesehatan Anda seperti usia, berat badan, riwayat keluarga, dan kebiasaan hidup untuk mendapatkan penilaian risiko yang akurat.",
            image: enterHealthData,
        },
        {
            number: 2,
            title: "Analisis Risiko",
            description:
                "Sistem kami akan menganalisis data kesehatan Anda untuk menilai risiko pra-diabetes berdasarkan berbagai faktor.",
            image: riskAnalysis,
        },
        {
            number: 3,
            title: "Terima Rekomendasi Gaya Hidup",
            description:
                "Berdasarkan hasil analisis, Anda akan menerima rekomendasi gaya hidup yang dipersonalisasi untuk mengurangi risiko pra-diabetes.",
            image: healthInsight,
        },
        {
            number: 4,
            title: "Meningkatkan Gaya Hidup",
            description:
                "Dapatkan rekomendasi pribadi untuk pola makan yang lebih sehat, olahraga, dan kebiasaan sehari-hari.",
            image: improveLifestyle,
        },
    ];

    return (
        <div className="font-[Poppins]">
            <Navbar />

            <section className="px-6 sm:px-12 md:px-[100px] mt-24 py-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold">Bagaimana Cara Kerja Glucare?</h2>

                <p className="text-left mt-[10px] mb-[50px] text-[#666]">
                    Sistem kami membantu Anda memahami risiko pra-diabetes dengan
                    menganalisis data kesehatan Anda dan memberikan rekomendasi gaya hidup
                    yang dipersonalisasi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-20">
                    {steps.map((step) => (
                        <div key={step.number} className="text-left p-5">
                            <div className="bg-[#eee] w-10 h-10 rounded-xl flex items-center justify-center font-bold mb-[10px]">
                                {step.number}
                            </div>

                            <h3 className="text-lg sm:text-xl font-semibold mb-3">{step.title}</h3>

                            <p className="text-[#555] leading-relaxed">
                                {step.description}
                            </p>

                            <img
                                src={step.image}
                                alt={step.title}
                                className="w-full max-w-[250px] rounded-[15px] mt-[15px]"
                            />
                        </div>
                    ))}
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
}