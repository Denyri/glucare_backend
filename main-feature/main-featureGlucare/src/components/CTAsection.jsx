import { useNavigate } from "react-router-dom";

export default function CTASection() {
    const navigate = useNavigate();

    return (
        <section className="py-[60px] px-4 sm:px-5 flex justify-center">
            <div className="w-full max-w-[1100px] rounded-xl px-4 sm:px-5 py-[60px] text-center text-white bg-gradient-to-r from-[#0072CE] to-[#003A68]">
                <h2 className="text-xl sm:text-[28px] font-bold mb-[30px]">
                    Program Kesehatan yang Dibuat Khusus untuk Anda
                </h2>

                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 rounded-lg bg-[#0072CE] text-white hover:bg-gradient-to-r hover:from-[#0072CE] hover:to-[#003A68] transition border border-white/30">
                    Cek Risiko Sekarang
                </button>
            </div>
        </section>
    );
}