import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import AnalisisCard from "../components/AnalisisCard";
import { useNavigate } from "react-router-dom";
import ilustrasi from "../assets/ilustrasi.png";
import kuesioner from "../assets/kuesioner.png";
import labtest from "../assets/labtest.png";
import { useSidebar } from "../hooks/useSidebar";
import ClinicalBadge from "../components/ui/ClinicalBadge";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Analisis() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Skrining Risiko Metabolik"
                    subtitle="Pilih metode estimasi risiko prediabetes berbasis model Machine Learning (NHANES CDC)"
                />

                <div className="p-4 sm:p-8 lg:p-10 relative min-h-[500px] max-w-6xl mx-auto space-y-8">
                    
                    {/* Onboarding Funnel Guidance Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <ClinicalBadge variant="clinical">
                                        Langkah 2 dari 3: Pilih Metode Skrining
                                    </ClinicalBadge>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Mulai Asesmen Risiko Awal Anda
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                                    {user?.fullname ? `Halo, ${user.fullname}! ` : ""}
                                    Sebelum mengaktifkan Dashboard & Program 90 Hari, pilih metode skrining yang paling sesuai dengan ketersediaan data Anda saat ini.
                                </p>
                            </div>

                            {/* Mini Stepper Tracker */}
                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0 bg-slate-50 border border-slate-200/70 px-4 py-2 rounded-2xl text-xs font-semibold">
                                <span className="flex items-center gap-1 text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4" /> Profil
                                </span>
                                <span className="text-slate-300">→</span>
                                <span className="flex items-center gap-1 text-blue-600 font-bold">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span> Skrining
                                </span>
                                <span className="text-slate-300">→</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">3</span> Dashboard
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dual-Path Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full relative z-10">
                        <AnalisisCard
                            icon={kuesioner}
                            title="Mode Kuesioner Non-Invasif"
                            description="Estimasi cepat berdasarkan anamnesis gaya hidup, durasi tidur, tingkat aktivitas fisik harian, dan riwayat kesehatan. Ideal jika belum ada hasil tes darah."
                            tags={["Cepat ~1 Menit", "Tanpa Tes Darah", "Pola Aktivitas", "Riwayat Keluarga"]}
                            tagBg="#F5F3FF"
                            tagText="#7C3AED"
                            footerText="✓ Skrining Cepat · Tanpa Hasil Lab"
                            footerColor="#7C3AED"
                            onClick={() => navigate("/kuesioner")}
                        />

                        <AnalisisCard
                            icon={labtest}
                            title="Mode Klinis & Laboratorium"
                            description="Gunakan parameter biomarker medis (Gula Darah Puasa, HbA1c, Trigliserida, HDL, & Tekanan Darah) untuk estimasi presisi tinggi berbasis kohort NHANES CDC."
                            tags={["Presisi Tinggi", "GDP & HbA1c", "Trigliserida & HDL", "Tekanan Darah"]}
                            tagBg="#EFF6FF"
                            tagText="#0062E3"
                            footerText="★ Rekomendasi Medis · Akurasi Maksimal"
                            footerColor="#0062E3"
                            onClick={() => navigate("/modeLab")}
                        />
                    </div>

                    {/* Scientific Standards Footnote */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-500 text-2xl">verified_user</span>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Standar Pengukuran ADA 2024</h4>
                                <p className="text-xs text-slate-500">
                                    Hasil skrining diklasifikasikan ke dalam 3 zona klinis: Normal (&lt; 100 mg/dL), Prediabetes (100–125 mg/dL), dan Diabetes (≥ 126 mg/dL).
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/#cara-kerja")}
                            className="text-xs font-bold text-[#0062E3] hover:underline whitespace-nowrap"
                        >
                            Pelajari Dasar Ilmiah →
                        </button>
                    </div>

                    <img
                        src={ilustrasi}
                        alt="Ilustrasi analisis"
                        className="absolute bottom-4 right-6 w-40 sm:w-52 lg:w-64 pointer-events-none opacity-20 lg:opacity-30 hidden md:block"
                    />
                </div>
            </div>
        </div>
    );
}

export default Analisis;