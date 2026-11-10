import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services";
import { FiEye, FiEyeOff, FiAlertCircle, FiX, FiCheckCircle } from "react-icons/fi";
import ClinicalBadge from "../components/ui/ClinicalBadge";

export default function AuthPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        remember: true,
    });

    const [signupData, setSignupData] = useState({
        name: "",
        email: "",
        password: "",
        agree: true,
    });

    const showError = (message) => {
        setToast({ type: "error", message, id: Date.now() });
    };

    const showSuccess = (message) => {
        setToast({ type: "success", message, id: Date.now() });
    };

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) {
            showError("Silakan isi alamat email dan kata sandi Anda.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.login({
                email: loginData.email,
                password: loginData.password,
            });

            const user = response.user;
            const token = response.token;

            login(user, token, loginData.remember);

            showSuccess("Berhasil masuk! Mengalihkan ke sistem...");
            setTimeout(() => {
                navigate(response.redirectTo || "/beranda");
            }, 600);
        } catch (error) {
            showError(error.response?.data?.message || "Login gagal. Periksa kembali email dan password Anda.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!signupData.name || !signupData.email || !signupData.password) {
            showError("Semua data pendaftaran wajib diisi.");
            return;
        }
        if (!signupData.agree) {
            showError("Anda harus menyetujui Kebijakan Privasi & Syarat Layanan.");
            return;
        }
        if (signupData.password.length < 8) {
            showError("Kata sandi harus minimal 8 karakter.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.register({
                fullname: signupData.name,
                email: signupData.email,
                password: signupData.password,
            });

            login(response.user, response.token, false);

            showSuccess("Registrasi berhasil! Menuju pengisian data profil...");
            setTimeout(() => {
                navigate("/input");
            }, 700);
        } catch (error) {
            showError(error.response?.data?.message || "Registrasi gagal. Email mungkin sudah terdaftar.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
            <Navbar />

            {/* Notification Toast */}
            {toast && (
                <div className="fixed top-24 inset-x-0 z-[10000] flex justify-center px-4 pointer-events-none">
                    <div
                        key={toast.id}
                        role="alert"
                        aria-live="assertive"
                        className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-xl flex items-start gap-3 bg-white ${
                            toast.type === "error"
                                ? "border-rose-200 text-rose-900"
                                : "border-emerald-200 text-emerald-900"
                        } animate-in fade-in slide-in-from-top-3 duration-200`}
                    >
                        <span className="mt-0.5 shrink-0">
                            {toast.type === "error" ? (
                                <FiAlertCircle size={20} className="text-rose-600" />
                            ) : (
                                <FiCheckCircle size={20} className="text-emerald-600" />
                            )}
                        </span>
                        <p className="flex-1 text-xs sm:text-sm font-medium leading-snug">
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Auth Container */}
            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-28 lg:py-32">
                <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
                    
                    {/* Left Panel: Clinical Branding Showcase */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-md">
                                    <img src="/logo_glucare.png" alt="GluCare" className="w-5 h-5 filter brightness-0 invert" />
                                </div>
                                <span className="text-xl font-extrabold tracking-tight">GluCare.</span>
                            </div>

                            <div className="space-y-2">
                                <ClinicalBadge variant="clinical" className="bg-blue-900/60 text-sky-200 border-blue-700/50">
                                    Pencegahan Prediabetes
                                </ClinicalBadge>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                    Kendali Kesehatan Metabolik di Tangan Anda.
                                </h2>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                                    Deteksi dini resistensi insulin sebelum menjadi diabetes permanen. Divalidasi dengan dataset NHANES CDC.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2 text-xs text-slate-300">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-300 flex items-center justify-center font-bold">✓</span>
                                    <span>Model Prediksi AI Terlatih (Akurasi 95%)</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-300 flex items-center justify-center font-bold">✓</span>
                                    <span>Protokol Intervensi Terstruktur 90 Hari</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-300 flex items-center justify-center font-bold">✓</span>
                                    <span>Standar Klinis ADA (American Diabetes Assoc.)</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 mt-8 border-t border-slate-800 text-[11px] text-slate-400">
                            🔒 Privasi data biometrik Anda dienkripsi dan terlindungi penuh.
                        </div>
                    </div>

                    {/* Right Panel: Form Area */}
                    <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
                        
                        {/* Segmented Switcher */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 max-w-sm mx-auto w-full">
                            <button
                                type="button"
                                onClick={() => setIsRegisterMode(false)}
                                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    !isRegisterMode
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                Masuk Akun
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRegisterMode(true)}
                                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    isRegisterMode
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                Daftar Baru
                            </button>
                        </div>

                        {!isRegisterMode ? (
                            /* Login Form */
                            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto w-full">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                        Masuk untuk melanjutkan monitoring kesehatan metabolik Anda.
                                    </p>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <label className="text-xs font-semibold text-slate-700">Alamat Email</label>
                                    <input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                                        <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                                            Lupa kata sandi?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Masukkan kata sandi"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={loginData.remember}
                                        onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                                    />
                                    <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer">
                                        Ingat saya di perangkat ini
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
                                >
                                    {isLoading ? "Memproses..." : "Masuk ke Dashboard →"}
                                </button>
                            </form>
                        ) : (
                            /* Register Form */
                            <form onSubmit={handleSignup} className="space-y-4 max-w-md mx-auto w-full">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Buat Akun Baru</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                        Mulai skrining dan ikuti protokol 90 hari GluCare.
                                    </p>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Anda"
                                        value={signupData.name}
                                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Alamat Email</label>
                                    <input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={signupData.email}
                                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Kata Sandi (Min. 8 Karakter)</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Buat kata sandi aman"
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="agreeTerms"
                                        checked={signupData.agree}
                                        onChange={(e) => setSignupData({ ...signupData, agree: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer mt-0.5"
                                    />
                                    <label htmlFor="agreeTerms" className="text-xs text-slate-600 cursor-pointer">
                                        Saya menyetujui{" "}
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(true)}
                                            className="text-blue-600 underline font-semibold"
                                        >
                                            Kebijakan Privasi & Syarat Layanan
                                        </button>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
                                >
                                    {isLoading ? "Mendaftarkan..." : "Daftar Akun Baru →"}
                                </button>
                            </form>
                        )}

                    </div>

                </div>
            </main>

            {/* Privacy Policy Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-3xl p-6 sm:p-8 relative flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-lg font-bold"
                        >
                            ×
                        </button>

                        <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                            Kebijakan Privasi & Ketentuan Layanan
                        </h3>

                        <div className="overflow-y-auto pr-2 text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
                            <div>
                                <h4 className="font-bold text-slate-800">1. Pengumpulan Data Biometrik</h4>
                                <p>GluCare mengumpulkan data kesehatan (glukosa darah, tekanan darah, berat badan, kebiasaan) semata-mata untuk komputasi estimasi risiko prediabetes.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">2. Keamanan & Kerahasiaan</h4>
                                <p>Seluruh data disimpan dengan standar enkripsi modern dan tidak pernah diperjualbelikan kepada broker data atau pihak asuransi tanpa izin pengguna.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">3. Batasan Tanggung Jawab Medis</h4>
                                <p>Model prediksi adalah instrumen skrining awal, bukan pengganti konsultasi atau resep dokter spesialis penyakit dalam.</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs"
                            >
                                Saya Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}