import api from "../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FiEye, FiEyeOff, FiAlertCircle, FiX } from "react-icons/fi";

export default function AuthPage() {
    const navigate = useNavigate();

    const [isActive, setIsActive] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);
    const [showPasswordSignup, setShowPasswordSignup] = useState(false);
    const [toast, setToast] = useState(null);

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const [signupData, setSignupData] = useState({
        name: "",
        email: "",
        password: "",
        agree: false,
    });

    const showError = (message) => {
        setToast({ message, id: Date.now() });
    };

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/api/auth/login`, {
                email: loginData.email,
                password: loginData.password,
            });

            const user = response.data.user;
            const token = response.data.token;

            if (loginData.remember) {
                localStorage.setItem("currentUser", JSON.stringify(user));
                localStorage.setItem("token", token);
            } else {
                sessionStorage.setItem("currentUser", JSON.stringify(user));
                sessionStorage.setItem("token", token);
            }

            navigate(response.data.redirectTo || "/beranda");
        } catch (error) {
            showError(error.response?.data?.message || "Login gagal");
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!signupData.email || !signupData.password) { showError("Semua field harus diisi"); return; }
        if (!signupData.agree) { showError("Setujui syarat & ketentuan"); return; }
        if (signupData.password.length < 8) { showError("Password minimal 8 karakter"); return; }

        try {
            const response = await api.post(`/api/auth/register`, {
                fullname: signupData.name,
                email: signupData.email,
                password: signupData.password,
            });

            sessionStorage.setItem("currentUser", JSON.stringify(response.data.user));
            sessionStorage.setItem("token", response.data.token);
            navigate("/input");
        } catch (error) {
            showError(error.response?.data?.message || "Register gagal");
        }
    };

    return (
        <div className="min-h-screen bg-white font-[Poppins]">
            <Navbar />

            
            {toast && (
                <div className="fixed top-20 inset-x-0 z-[10000] flex justify-center px-4 pointer-events-none">
                    <div
                        key={toast.id}
                        role="alert"
                        aria-live="assertive"
                        className="toast-enter pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl"
                    >
                        <div className="flex items-start gap-3 px-4 py-3">
                            <span className="mt-0.5 flex-shrink-0 text-red-500">
                                <FiAlertCircle size={20} />
                            </span>
                            <p className="flex-1 text-sm leading-snug text-gray-800">{toast.message}</p>
                            <button
                                type="button"
                                onClick={() => setToast(null)}
                                aria-label="Tutup notifikasi"
                                className="flex-shrink-0 text-gray-400 transition hover:text-gray-600">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="toast-progress h-1 bg-red-500" />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes toastSlideIn {
                    from { transform: translateY(-12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes toastShrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .toast-enter { animation: toastSlideIn 0.25s ease-out; }
                .toast-progress { animation: toastShrink 4.5s linear forwards; }
            `}</style>

            
            <div className="hidden md:flex fixed inset-0 items-center justify-center pt-24">
                <div className="relative w-[90vw] max-w-[1200px] h-[80vh] rounded-[40px] shadow-2xl overflow-hidden bg-white">

                    
                    <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ${
                        isActive ? "translate-x-full opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
                        <form onSubmit={handleLogin} autoComplete="off"
                            className="h-full flex flex-col justify-center items-center px-10">
                            <h1 className="text-4xl font-bold">Masuk</h1>
                            <p className="my-5 text-sm">Gunakan akun email untuk masuk</p>

                            <input type="email" placeholder="Email" autoComplete="off"
                                className="w-full bg-gray-100 rounded-lg p-3 mb-3"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />

                            <div className="w-full relative mb-3">
                                <input type={showPasswordLogin ? "text" : "password"} placeholder="Password"
                                    autoComplete="new-password" className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    {showPasswordLogin ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>

                            <div className="w-full flex justify-between items-center mb-4 text-sm">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={loginData.remember}
                                        onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })} />
                                    Ingatkan saya
                                </label>
                                <a href="/forgot-password" className="hover:text-[#0072ce]">Lupa Kata Sandi?</a>
                            </div>

                            <button type="submit"
                                className="bg-[#0072CE] hover:bg-gradient-to-r hover:from-[#0072CE] hover:to-[#003A68] text-white px-10 py-3 rounded-lg font-bold transition">
                                Masuk
                            </button>
                        </form>
                    </div>

                    
                    <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ${
                        isActive ? "translate-x-full opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                        <form onSubmit={handleSignup}
                            className="h-full flex flex-col justify-center items-center px-10">
                            <h1 className="text-4xl font-bold">Buat Akun</h1>
                            <p className="my-5 text-sm">Gunakan email untuk registrasi</p>

                            <input type="email" placeholder="Email"
                                className="w-full bg-gray-100 rounded-lg p-3 mb-3"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />

                            <div className="w-full relative mb-3">
                                <input type={showPasswordSignup ? "text" : "password"} placeholder="Password"
                                    autoComplete="new-password" className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                    value={signupData.password}
                                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    {showPasswordSignup ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>

                            <label className="text-sm flex gap-2 mb-4">
                                <input type="checkbox" checked={signupData.agree}
                                    onChange={(e) => setSignupData({ ...signupData, agree: e.target.checked })} />
                                <span>Saya setuju{" "}
                                    <span onClick={(e) => { e.preventDefault(); setShowModal(true); }}
                                        className="text-blue-600 underline cursor-pointer">Kebijakan Privasi</span>
                                </span>
                            </label>

                            <button type="submit"
                                className="bg-[#0072CE] hover:bg-gradient-to-r hover:from-[#0072CE] hover:to-[#003A68] text-white px-10 py-3 rounded-lg font-bold transition">
                                Daftar
                            </button>
                        </form>
                    </div>

                    
                    <div className={`absolute top-0 h-full w-1/2 bg-gradient-to-b from-[#0072CE] to-[#003A68] text-white flex flex-col justify-center items-center px-10 transition-all duration-700 ${
                        isActive ? "left-0" : "left-1/2"}`}>
                        {!isActive ? (
                            <>
                                <h1 className="text-4xl font-bold">Halo, Teman!</h1>
                                <p className="my-5 text-center">Belum punya akun?</p>
                                <button type="button" onClick={() => setIsActive(true)}
                                    className="bg-white text-black px-10 py-3 rounded-lg font-bold">Daftar</button>
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold">Selamat Datang Kembali</h1>
                                <p className="my-5 text-center">Sudah punya akun?</p>
                                <button type="button" onClick={() => setIsActive(false)}
                                    className="bg-white text-black px-10 py-3 rounded-lg font-bold">Masuk</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            
            <div className="md:hidden flex flex-col items-center px-5 pt-28 pb-10">
                
                <div className="flex w-full max-w-sm mb-6 rounded-xl overflow-hidden border border-gray-200">
                    <button
                        onClick={() => setIsActive(false)}
                        className={`flex-1 py-3 text-sm font-bold transition ${
                            !isActive ? "bg-[#0072CE] text-white" : "bg-white text-gray-500"}`}>
                        Masuk
                    </button>
                    <button
                        onClick={() => setIsActive(true)}
                        className={`flex-1 py-3 text-sm font-bold transition ${
                            isActive ? "bg-[#0072CE] text-white" : "bg-white text-gray-500"}`}>
                        Daftar
                    </button>
                </div>

                <div className="w-full max-w-sm bg-white rounded-[20px] shadow-lg p-6">
                    {!isActive ? (
                        
                        <form onSubmit={handleLogin} autoComplete="off" className="flex flex-col">
                            <h1 className="text-2xl font-bold mb-1">Masuk</h1>
                            <p className="text-sm text-gray-500 mb-5">Gunakan akun email untuk masuk</p>

                            <input type="email" placeholder="Email" autoComplete="off"
                                className="w-full bg-gray-100 rounded-lg p-3 mb-3"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />

                            <div className="w-full relative mb-3">
                                <input type={showPasswordLogin ? "text" : "password"} placeholder="Password"
                                    autoComplete="new-password" className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    {showPasswordLogin ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>

                            <div className="flex justify-between items-center mb-5 text-sm">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={loginData.remember}
                                        onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })} />
                                    Ingatkan saya
                                </label>
                                <a href="#" className="hover:text-[#0072ce]">Lupa Kata Sandi?</a>
                            </div>

                            <button type="submit"
                                className="bg-[#0072CE] text-white py-3 rounded-lg font-bold transition hover:bg-[#003A68]">
                                Masuk
                            </button>
                        </form>
                    ) : (
                        
                        <form onSubmit={handleSignup} className="flex flex-col">
                            <h1 className="text-2xl font-bold mb-1">Buat Akun</h1>
                            <p className="text-sm text-gray-500 mb-5">Gunakan email untuk registrasi</p>

                            <input type="email" placeholder="Email"
                                className="w-full bg-gray-100 rounded-lg p-3 mb-3"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />

                            <div className="w-full relative mb-3">
                                <input type={showPasswordSignup ? "text" : "password"} placeholder="Password"
                                    autoComplete="new-password" className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                    value={signupData.password}
                                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    {showPasswordSignup ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>

                            <label className="text-sm flex gap-2 mb-5">
                                <input type="checkbox" checked={signupData.agree}
                                    onChange={(e) => setSignupData({ ...signupData, agree: e.target.checked })} />
                                <span>Saya setuju{" "}
                                    <span onClick={(e) => { e.preventDefault(); setShowModal(true); }}
                                        className="text-blue-600 underline cursor-pointer">Kebijakan Privasi</span>
                                </span>
                            </label>

                            <button type="submit"
                                className="bg-[#0072CE] text-white py-3 rounded-lg font-bold transition hover:bg-[#003A68]">
                                Daftar
                            </button>
                        </form>
                    )}
                </div>
            </div>

            
            {showModal && (
                <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4">
                    <div className="bg-white w-full max-w-[400px] max-h-[80vh] rounded-2xl p-5 relative flex flex-col">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="absolute right-4 top-3 text-2xl cursor-pointer">×</button>

                        <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-4 pr-8">
                            Kebijakan Privasi & Syarat Ketentuan
                        </h2>

                        <div className="overflow-y-auto mt-2 pr-2 text-sm leading-7 text-black">
                            <h3 className="text-lg font-semibold">Kebijakan Privasi</h3>
                            <p>Kami menghargai privasi Anda. Informasi yang kami kumpulkan:</p>
                            <ul className="list-disc pl-5">
                                <li>Data akun (Nama, Email)</li>
                                <li>Data pengguna aplikasi</li>
                            </ul>
                            <br />
                            <p>Kami menggunakan data untuk:</p>
                            <ul className="list-disc pl-5">
                                <li>Meningkatkan layanan</li>
                                <li>Memberikan pengalaman pengguna lebih baik</li>
                            </ul>
                            <br />
                            <h3 className="text-lg font-semibold">Syarat & Ketentuan</h3>
                            <p>Dengan menggunakan aplikasi ini, Anda setuju untuk:</p>
                            <ul className="list-disc pl-5">
                                <li>Tidak menyalahgunakan layanan</li>
                                <li>Tidak melanggar hukum</li>
                                <li>Menjaga keamanan akun</li>
                            </ul>
                            <br />
                            <p>Kami berhak:</p>
                            <ul className="list-disc pl-5">
                                <li>Menghapus akun jika Anda melanggar aturan</li>
                                <li>Mengubah layanan sewaktu-waktu</li>
                            </ul>
                            <p className="mt-5">Terakhir diperbarui 29-03-2026</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}