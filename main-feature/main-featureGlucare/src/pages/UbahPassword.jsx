import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FiEye, FiEyeOff } from "react-icons/fi";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useSidebar } from "../hooks/useSidebar";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import api from "../api";

export default function ChangePassword() {
    const { isOpen } = useSidebar();
    const navigate = useNavigate();
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
        setForm((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    const isChanged = () => {
        return (
            form.oldPassword ||
            form.newPassword ||
            form.confirmPassword
            );
        };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isChanged()) return;
        
        if (form.newPassword !== form.confirmPassword) {
            setAlert({ type: "error", message: "Password baru tidak sama"});
            return;
        }       

        if (form.newPassword.length < 8) {
            setAlert({ type: "warning", message: "Password minimal 8 karakter"});
            return;
        }

        try {
            const currentUser = JSON.parse(
                localStorage.getItem("currentUser") ||
                sessionStorage.getItem("currentUser")
            );

            await api.put(`/api/auth/change-password/${currentUser.id}`, {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword
            });

            setAlert({ type: "success", message: "Password berhasil diubah"});
            setTimeout(() => {
                navigate("/pengaturan");
            }, 1500);
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Gagal mengubah password" });
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

                <div className="flex-1 flex flex-col">
                    <div
                        className={`flex-1 transition-all duration-300 ${
                            isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                                
                                <HeaderAnalisis title="Ubah kata sandi" subtitle="Ubah kata sandi Anda"/>
                                
                                <div className="p-6 max-w-2xl">
                                    {alert && (
                                        <div className="mb-4">
                                            <Alert type={alert.type} message={alert.message} onClose={()=> setAlert(null)}/>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="text-sm font-medium">Old Password</label>
                                            <div className="relative w-full mt-1">
                                                <input
                                                type={showOldPassword ? "text" : "password"}
                                                name="oldPassword"
                                                value={form.oldPassword}
                                                onChange={handleChange}
                                                placeholder="Masukkan password lama"
                                                className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showOldPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                                </button>
                                            </div>
                                        </div>

             
                                        <div>
                                            <label className="text-sm font-medium">New Password</label>
                                            <div className="relative w-full mt-1">
                                                <input
                                                type={showNewPassword ? "text" : "password"}
                                                name="newPassword"
                                                value={form.newPassword}
                                                onChange={handleChange}
                                                placeholder="Masukkan password baru"
                                                className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none pr-10"/>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                                </button>
                                            </div>
                                        </div>
             
                                        <div>
                                            <label className="text-sm font-medium">Confirm Password</label>
                                            <div className="relative w-full mt-1">
                                                <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Ulangi password baru"
                                                className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-6">
                                            <Button type="submit" variant="primary">
                                            Ubah kata sandi
                                            </Button>
                                        </div>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
            );
}