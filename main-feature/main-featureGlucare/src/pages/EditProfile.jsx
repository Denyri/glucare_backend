import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import defaulAvatar from "../assets/Profile.jpg";
import { useSidebar } from "../hooks/useSidebar";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import Swal from "sweetalert2";

export default function EditProfile() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const { user, updateUser } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);

    const [form, setForm] = useState({
        nama: "",
        jenisKelamin: "",
        email: "",
        noTelepon: "",
        tanggalLahir: "",
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        authService.getProfile(user.id)
            .then((data) => {
                setForm({
                    nama: data.fullname || "",
                    jenisKelamin: data.gender || "",
                    email: data.email || "",
                    noTelepon: data.phone || "",
                    tanggalLahir: data.birth_date ? data.birth_date.split("T")[0] : "",
                });

                if (data.profile_image) {
                    setPreview(data.profile_image.startsWith("http")
                        ? data.profile_image
                        : `${import.meta.env.VITE_API_URL}${data.profile_image}`
                    );
                }
            })
            .catch((error) => console.log(error));
    }, [user?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "noTelepon") {
            const onlyNumber = value.replace(/\D/g, "");
            setForm((prev) => ({ ...prev, [name]: onlyNumber }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await authService.updateProfile(user.id, {
                fullname: form.nama,
                gender: form.jenisKelamin,
                email: form.email,
                phone: form.noTelepon,
                birth_date: form.tanggalLahir,
            });

            let updatedFields = { ...response.user };

            if (selectedFile) {
                const photoResponse = await authService.uploadPhoto(user.id, selectedFile);
                updatedFields.profile_image = photoResponse.imagePath;
            }

            // Update AuthContext so all components reflect the change instantly
            updateUser(updatedFields);

            Swal.fire({
                icon: "success",
                title: "Berhasil Diperbarui!",
                text: "Profil pengguna berhasil disimpan ke sistem.",
                confirmButtonText: "Selesai",
                confirmButtonColor: "#0062E3",
            }).then(() => {
                navigate("/pengaturan");
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal Menyimpan",
                text: error.response?.data?.message || "Terjadi kesalahan saat memperbarui profil.",
                confirmButtonText: "Coba Lagi",
                confirmButtonColor: "#ef4444",
            });
        }
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Edit Profil Pengguna"
                    subtitle="Perbarui data diri dan foto akun GluCare Anda"
                />

                <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
                    <button
                        onClick={() => navigate("/pengaturan")}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0062E3] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Kembali ke Pengaturan</span>
                    </button>

                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                                <img
                                    src={preview || defaulAvatar}
                                    alt="Foto Profil"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                                />
                                <div className="text-center sm:text-left space-y-2">
                                    <h4 className="text-sm font-bold text-slate-800">Foto Profil</h4>
                                    <p className="text-xs text-slate-500">Mendukung format JPG, PNG, atau WEBP maks 2MB</p>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition">
                                        <span className="material-symbols-outlined text-[16px]">upload</span>
                                        <span>Ganti Foto Profil</span>
                                        <input type="file" accept="image/*" hidden onChange={handleUpload} />
                                    </label>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="nama"
                                        required
                                        value={form.nama}
                                        onChange={handleChange}
                                        className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Jenis Kelamin</label>
                                        <select
                                            name="jenisKelamin"
                                            required
                                            value={form.jenisKelamin}
                                            onChange={handleChange}
                                            className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition"
                                        >
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Tanggal Lahir</label>
                                        <input
                                            type="date"
                                            name="tanggalLahir"
                                            value={form.tanggalLahir}
                                            onChange={handleChange}
                                            className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Alamat Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={form.email}
                                            onChange={handleChange}
                                            className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Nomor Telepon</label>
                                        <input
                                            type="tel"
                                            name="noTelepon"
                                            value={form.noTelepon}
                                            onChange={handleChange}
                                            placeholder="Contoh: 081234567890"
                                            className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0062E3] focus:bg-white transition font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button variant="primary" type="submit">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}