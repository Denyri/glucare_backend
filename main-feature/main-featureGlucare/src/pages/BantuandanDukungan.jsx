import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useSidebar } from "../hooks/useSidebar";
import { useState } from "react";
import FAQItem from "../components/FAQItem";
import ContactCard from "../components/ContactCard";

export default function BantuandanDukungan() {
    const { isOpen } = useSidebar();
    const [search, setSearch] = useState("");

    const faqs = [
        {
            pertanyaan: "Bagaimana cara mengubah profil atau nomor kontak?",
            jawaban: "Buka menu Akun & Pengaturan, lalu klik tombol 'Edit Informasi Profil' untuk memperbarui data diri, nomor telepon, atau alamat email Anda.",
        },
        {
            pertanyaan: "Apakah GluCare tersedia dalam versi aplikasi seluler (Android / iOS)?",
            jawaban: "Ya, GluCare mendukung antarmuka responsif PWA dan aplikasi mobile untuk pencatatan harian yang lebih praktis kapan saja.",
        },
        {
            pertanyaan: "Apakah layanan GluCare membebankan biaya berlangganan?",
            jawaban: "Seluruh fitur skrining risiko metabolik dan modul pendampingan intervensi 90 hari dapat diakses secara gratis oleh pengguna terdaftar.",
        },
        {
            pertanyaan: "Bagaimana AI GluCare menghitung risiko diabetes?",
            jawaban: "GluCare mengintegrasikan model Machine Learning (Gradient Boosting) yang dilatih dengan 9.200+ catatan data survei kesehatan representatif NHANES CDC (2021–2023) dengan AUC-ROC 0.887.",
        },
    ];

    const filteredFaqs = faqs.filter(
        (item) =>
            item.pertanyaan.toLowerCase().includes(search.toLowerCase()) ||
            item.jawaban.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Bantuan & Dukungan Pengguna"
                    subtitle="Temukan jawaban cepat seputar penggunaan GluCare atau hubungi tim bantuan klinis kami"
                />

                <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Cari pertanyaan, kendala, atau panduan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0062E3] focus:ring-2 focus:ring-[#0062E3]/10 shadow-sm transition"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* FAQ List */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                <span className="material-symbols-outlined text-[#0062E3] text-[20px]">help_outline</span>
                                <h3 className="font-bold font-display text-sm text-slate-900">Pertanyaan yang Sering Diajukan</h3>
                            </div>

                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((item, index) => (
                                    <FAQItem key={index} {...item} />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic py-4 text-center">
                                    Tidak ditemukan pertanyaan yang cocok dengan "{search}".
                                </p>
                            )}
                        </div>

                        {/* Contact Card */}
                        <ContactCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
