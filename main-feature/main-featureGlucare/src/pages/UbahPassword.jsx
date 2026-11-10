import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FiEye, FiEyeOff } from "react-icons/fi";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useSidebar } from "../hooks/useSidebar";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

export default function ChangePassword() {
    const { isOpen } = useSidebar();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [alert, setAlert] = useState(null);

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const isChanged = () => {
        return form.oldPassword || form.newPassword || form.confirmPassword;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isChanged()) return;

        if (form.newPassword !== form.confirmPassword) {
            setAlert({ type: "error", message: "Konfirmasi kata sandi baru tidak sesuai." });
            return;
        }

        if (form.newPassword.length < 8) {
            setAlert({ type: "warning", message: "Kata sandi baru minimal harus 8 karakter." });
            return;
        }

        try {
            await authService.changePassword(user.id, {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
            });

            setAlert({ type: "success", message: "Kata sandi berhasil diperbarui." });
            setTimeout(() => {
                navigate("/pengaturan");
            }, 1500);
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Gagal mengubah kata sandi." });
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Ubah Kata Sandi"
                    subtitle="Perbarui kata sandi akun Anda untuk menjaga keamanan data medis"
                />

                <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
                    <button
                        onClick={() => navigate("/pengaturan")}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0062E3] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Kembali ke Pengaturan</span>
                    </button>

                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                        {alert && (
                            <div className="mb-5">
                                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-700">Kata Sandi Saat Ini</label>
                                <div className="relative w-full mt-1.5">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        name="oldPassword"
                                        required
                                        value={form.oldPassword}
                                        onChange={handleChange}
                                        placeholder="Masukkan kata sandi lama"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showOldPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Kata Sandi Baru</label>
                                <div className="relative w-full mt-1.5">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        required
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        placeholder="Minimal 8 karakter"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Konfirmasi Kata Sandi Baru</label>
                                <div className="relative w-full mt-1.5">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Ulangi kata sandi baru"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button type="submit" variant="primary">
                                    Simpan Kata Sandi Baru
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}