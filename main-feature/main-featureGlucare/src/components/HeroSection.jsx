import heroImage from "../assets/HeroSection.png";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <section
            className="relative h-screen flex items-center bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/0" />

            <div className="relative z-10 text-white max-w-xl px-8 sm:px-14 md:px-20">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    Selamat Datang di Glucare
                </h1>

                <p className="text-base sm:text-lg my-6 sm:my-8">
                    Ambil kendali atas risiko diabetes Anda dan mulailah hidup yang lebih sehat.
                </p>

                <p className="text-sm mb-8 sm:mb-12 leading-7">
                    Pahami risiko diabetes Anda, ikuti panduan kesehatan yang
                    dipersonalisasi, dan pantau kemajuan Anda dengan mudah di satu tempat.
                </p>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-3 rounded-lg bg-[#0072CE] text-white hover:bg-gradient-to-r hover:from-[#0072CE] hover:to-[#003A68] transition">
                        Mulai
                    </button>

                    <button className="px-6 py-3 rounded-lg bg-[#0072CE] text-white hover:bg-gradient-to-r hover:from-[#0072CE] hover:to-[#003A68] transition">
                        Unduh Aplikasi
                    </button>
                </div>
            </div>
        </section>
    );
}