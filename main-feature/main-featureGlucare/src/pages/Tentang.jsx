import Navbar from "../components/Navbar";
import CTASection from "../components/CTAsection";
import Footer from "../components/Footer";
import heroImage from "../assets/aboutimages/Hero.jpg";
import problem1 from "../assets/aboutimages/Problem1.jpg";
import problem2 from "../assets/aboutimages/Problem2.jpg";
import problem3 from "../assets/aboutimages/Problem3.jpg";
import whyImage from "../assets/aboutimages/why.png";
import { useNavigate } from "react-router-dom";

export default function TentangKami() {
    const navigate = useNavigate();

    return (
        <div className="font-[Poppins]">
            <Navbar />

            {/* Hero Section */}
            <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between bg-[linear-gradient(270deg,rgba(0,114,206,0)_-1.04%,rgba(0,114,206,0.30)_44.9%,rgba(0,114,206,0.70)_100%)] px-6 sm:px-12 md:px-20 py-[60px] pt-[120px] md:pt-[60px] gap-10">
                <div className="flex-1 basis-[400px] md:max-w-[45%] text-center md:text-left">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[1.3] font-bold text-[#0a2a46]">
                        Membawa <span className="text-white">Solusi</span>
                        <br />
                        untuk <span className="text-white">Hidup yang Lebih Sehat</span>
                    </h1>

                    <p className="text-base sm:text-lg mt-[18px] max-w-[400px] mb-[30px] text-[#333] mx-auto md:mx-0">
                        Glucare hadir untuk membantu Anda melacak dan melindungi diri dari
                        diabetes. Kami peduli dengan kesehatan Anda dan keluarga Anda.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-3 rounded-lg bg-[#0072CE] text-white font-medium transition hover:bg-gradient-to-r hover:from-[#0072CE] hover:to-[#003A68]">
                        Cek Risiko Anda
                    </button>
                </div>

                <div className="w-full md:w-auto flex justify-center">
                    <div className="w-[280px] sm:w-[340px] md:w-full rounded-full overflow-hidden relative z-10 md:mr-[-80px]">
                        <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>

            {/* Problems Section */}
            <section className="px-6 sm:px-12 md:px-20 py-20 text-center">
                <h2 className="text-3xl md:text-4xl mb-[10px] font-bold">Masalah Saat ini</h2>
                <p className="text-[#555] mb-[50px]">Banyak orang tidak menyadari risiko kesehatan mereka.</p>

                <div className="flex justify-center gap-[30px] flex-wrap">
                    {[
                        {
                            image: problem1,
                            title: "Deteksi Terlambat",
                            desc: "Banyak orang tidak menyadari risiko kesehatan mereka.",
                        },
                        {
                            image: problem2,
                            title: "Kurangnya Kesadaran",
                            desc: "Orang seringkali meremehkan faktor risiko seperti gaya hidup dan riwayat keluarga.",
                        },
                        {
                            image: problem3,
                            title: "Tidak Ada Panduan yang Jelas",
                            desc: "Banyak individu tidak tahu langkah apa yang harus diambil untuk meningkatkan kesehatan mereka.",
                        },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="relative w-[280px] h-[350px] rounded-[20px] overflow-hidden cursor-pointer">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 w-full p-5 text-white bg-gradient-to-t from-[rgba(0,114,206,0.9)] to-[rgba(0,114,206,0)]">
                                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                                <p className="text-sm leading-[1.4]">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Glucare Section */}
            <section className="px-6 sm:px-12 md:px-20 py-20">
                <h2 className="text-center text-[28px] md:text-[32px] mb-5 font-bold">Kenapa Glucare Penting?</h2>

                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 text-[18px] md:text-[25px] leading-[1.6] text-[#333] text-center md:text-left">
                        <p className="mt-5">
                            Kesadaran dini dapat mencegah masalah kesehatan yang serius.
                            Dalam dunia medis, waktu dan kesempatan adalah segalanya.
                            Pemeriksaan sederhana hari ini bisa menjadi perbedaan antara
                            pemulihan penuh atau komplikasi permanen.
                        </p>
                        <p className="mt-5">
                            Kesadaran dini bukan hanya tren gaya hidup, tetapi juga keputusan
                            yang bisa menyelamatkan nyawa, terutama dalam mencegah diabetes.
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <img src={whyImage} alt="Why" className="w-full rounded-[15px]" />
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section className="px-6 sm:px-12 md:px-20 py-20 text-center">
                <h2 className="text-[24px] md:text-[28px] mb-[50px] font-bold">Solusi Kami</h2>

                <div className="flex justify-center gap-[40px] md:gap-[70px] flex-wrap">
                    {[
                        {
                            number: 1,
                            title: "Penilaian Risiko Kesehatan",
                            desc: "Nilai risiko kesehatan Anda melalui input data dan kuesioner.",
                        },
                        {
                            number: 2,
                            title: "Rekomendasi Personalisasi",
                            desc: "Terima rekomendasi gaya hidup, pemeriksaan, dan panduan kesehatan yang disesuaikan dengan kebutuhan Anda.",
                        },
                        {
                            number: 3,
                            title: "Rencana Kesehatan 90 Hari",
                            desc: "Ikuti program terstruktur yang dirancang untuk meningkatkan kesehatan Anda secara bertahap.",
                        },
                    ].map((item) => (
                        <div key={item.number} className="max-w-[300px]">
                            <div className="w-10 h-10 bg-black text-white font-bold flex items-center justify-center rounded-md mx-auto mb-[15px]">
                                {item.number}
                            </div>
                            <h3 className="text-base mb-[10px] font-semibold">{item.title}</h3>
                            <p className="text-sm text-[#555]">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <CTASection />
            <Footer />
        </div>
    );
}