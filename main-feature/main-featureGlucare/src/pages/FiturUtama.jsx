import Navbar from "../components/Navbar";
import CTASection from "../components/CTAsection";
import Footer from "../components/Footer";
import aiRiskImage from "../assets/aboutimages/AiRisk.png";
import rekomendasiImage from "../assets/aboutimages/Rekomendasi.png";
import ninetyDayImage from "../assets/aboutimages/90hari.png";

export default function FiturUtama() {
    const fiturList = [
        {
            title: "Penilaian Risiko Berbasis AI",
            description:
                "AI kami akan membantu Anda mendiagnosis risiko apa pun dari karakteristik terkena atau mendapatkan pradiabetes akibat diabetes",
            image: aiRiskImage,
            reverse: false,
        },
        {
            title: "Monitoring Progress / Evaluasi Berkala",
            description:
                "Pantau perkembangan kesehatan, checklist aktivitas harian, dan evaluasi progres Anda secara berkala.",
            image: rekomendasiImage,
            reverse: true,
        },
        {
            title: "Rencana 90 Hari",
            description:
                "AI kami akan memberikan Anda rencana 90 hari untuk kegiatan hidup sehat guna mencegah diabetes.",
            image: ninetyDayImage,
            reverse: false,
        },
    ];

    return (
        <div className="font-[Poppins]">
            <Navbar />

            <section className="px-6 sm:px-12 md:px-[100px] mt-24 py-10 text-center">
                <h2 className="mb-[50px] text-2xl sm:text-3xl font-bold">
                    Fitur Kami yang Membantu Anda Tetap Sehat
                </h2>

                {fiturList.map((fitur, index) => (
                    <div
                        key={index}
                        className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-[50px] mb-14 md:mb-20 ${
                            fitur.reverse ? "md:flex-row-reverse" : ""
                        }`}>
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h3 className="text-xl sm:text-2xl font-semibold mb-4">{fitur.title}</h3>
                            <p className="text-base text-[#555] leading-relaxed">
                                {fitur.description}
                            </p>
                        </div>

                        <img
                            src={fitur.image}
                            alt={fitur.title}
                            className="w-[240px] sm:w-[280px] md:w-[300px] rounded-[15px]"
                        />
                    </div>
                ))}
            </section>

            <CTASection />
            <Footer />
        </div>
    );
}