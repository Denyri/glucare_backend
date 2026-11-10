import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import Alert from "../components/Alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services";
import ClinicalBadge from "../components/ui/ClinicalBadge";
import {
    User,
    Users,
    Calendar,
    Phone,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Sparkles
} from "lucide-react";

export default function InputData() {
    const { user, isCompleted, hasAnalysis, updateUser } = useAuth();
    const [alert, setAlert] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama: "",
        jeniskelamin: "",
        tanggallahir: "",
        noTelp: "",
    });

    useEffect(() => {
        if (isCompleted) {
            if (hasAnalysis) {
                navigate("/beranda", { replace: true });
            } else {
                navigate("/analisis", { replace: true });
            }
        } else if (user) {
            setFormData((prev) => ({
                ...prev,
                nama: user.fullname || user.nama || "",
                jeniskelamin: user.gender || "",
                tanggallahir: user.birth_date ? user.birth_date.split("T")[0] : "",
            }));
        }
    }, [user, isCompleted, hasAnalysis, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Live calculate age from birth date
    const calculatedAge = (() => {
        if (!formData.tanggallahir) return null;
        const birth = new Date(formData.tanggallahir);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nama.trim() || !formData.jeniskelamin || !formData.tanggallahir || !formData.noTelp.trim()) {
            setAlert({
                type: "error",
                message: "Semua data profil wajib diisi untuk kalibrasi estimasi klinis.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await authService.inputData({
                userId: user?.id,
                ...formData,
            });

            if (response && response.user) {
                updateUser(response.user);
            }

            setAlert({
                type: "success",
                message: "Profil berhasil disimpan! Mengalihkan ke pemilihan skrining...",
            });

            setTimeout(() => {
                navigate("/analisis");
            }, 800);
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Gagal menyimpan data profil. Silakan coba lagi.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col justify-between">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-28 pb-16">
                <div className="w-full max-w-xl space-y-6">

                    {/* Stepper Progress Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                            <span className="text-blue-600 font-bold flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                                Profil Dasar
                            </span>
                            <span className="text-slate-400 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">2</span>
                                Skrining AI
                            </span>
                            <span className="text-slate-400 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">3</span>
                                Program 90 Hari
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 w-1/3" />
                        </div>
                    </div>

                    {/* 21st.dev Double-Bezel Card Container */}
                    <div className="rounded-3xl p-1 bg-gradient-to-b from-slate-200/70 via-slate-200/40 to-slate-200/20 shadow-xl">
                        <div className="bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-10 space-y-6">

                            {/* Header */}
                            <div className="text-center space-y-2.5">
                                <ClinicalBadge variant="clinical">
                                    Langkah 1 dari 3: Personalisasi Profil
                                </ClinicalBadge>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Lengkapi Data Diri Anda
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                    Data identitas dan usia diperlukan untuk kalibrasi model machine learning deteksi risiko prediabetes.
                                </p>
                            </div>

                            {alert && (
                                <div className="animate-in fade-in duration-200">
                                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                
                                {/* Nama Lengkap */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-blue-600" />
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        name="nama"
                                        placeholder="Nama lengkap sesuai identitas"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                                    />
                                </div>

                                {/* Gender & Tanggal Lahir Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-blue-600" />
                                            Jenis Kelamin
                                        </label>
                                        <select
                                            name="jeniskelamin"
                                            value={formData.jeniskelamin}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer font-medium"
                                        >
                                            <option value="" disabled>Pilih Jenis Kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                Tanggal Lahir
                                            </span>
                                            {calculatedAge !== null && (
                                                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                    Usia: {calculatedAge} Th
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="date"
                                            name="tanggallahir"
                                            value={formData.tanggallahir}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Nomor Telepon / WhatsApp */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                                        Nomor Telepon / WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        name="noTelp"
                                        placeholder="Contoh: 081234567890"
                                        value={formData.noTelp}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Digunakan untuk pengingat streak harian dan notifikasi rencana intervensi.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <span>{isSubmitting ? "Menyimpan Data..." : "Simpan Profil & Lanjut ke Skrining AI"}</span>
                                        {!isSubmitting && (
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Trust Footer */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Data profil dienkripsi untuk kepatuhan privasi medis GluCare.</span>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}