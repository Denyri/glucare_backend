import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import Alert from "../components/Alert";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function InputData() {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama: "",
        jeniskelamin: "",
        tanggallahir: "",
        noTelp: "",
    });

    useEffect(() => {
        const currentUser = JSON.parse(
            localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
        );
        if (currentUser && currentUser.is_completed === 1) {
            navigate("/beranda");
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nama || !formData.jeniskelamin || !formData.tanggallahir || !formData.noTelp) {
            setAlert({
                type: "error",
                message: "Semua data wajib diisi!"
            });
            return;
        }

        try {
            const currentUser = JSON.parse(
                localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
            );

            const response = await api.post(
                `/api/auth/inputData`,
                {
                    userId: currentUser.id,
                    ...formData,
                }
            );

            const updatedUser = response.data.user;
            if (localStorage.getItem("currentUser")) localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            if (sessionStorage.getItem("currentUser")) sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));

            setAlert({ type: "success", message: "Data berhasil disimpan" });

            setTimeout(() => {
                navigate("/beranda")
            }, 2000);

        } catch (error) {
            alert(error.response?.data?.message || "Gagal simpan data");
        }
    };




    return (
        <div className="font-[Poppins]">
            <Navbar />

            <main className="pt-32 px-6 flex justify-center">
                <div className="flex justify-center-pt-28">
                    <div className="w-full max-w-4xl px-6">
                        <h1 className="text-3xl font-bold text-center mb-4">
                            Input Data
                        </h1>

                        <p className="text-[#0072CE] text-center mb-4 text-sm">
                            Privasi Anda adalah hal yang terpenting buat kami. Data Anda aman disini
                        </p>

                        {alert && (
                            <div className="mb-4">
                                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            <div>
                                <label className="block text-sm mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-full px-6 py-3 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">
                                    Jenis Kelamin
                                </label>
                                <select
                                    name="jeniskelamin"
                                    value={formData.jeniskelamin}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-full px-6 py-3 outline-none bg-white"
                                >
                                    <option value="" disabled>Pilih Jenis Kelamin</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-2">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    name="tanggallahir"
                                    value={formData.tanggallahir}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-full px-6 py-3 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">
                                    No Telepon
                                </label>
                                <input
                                    type="tel"
                                    name="noTelp"
                                    value={formData.noTelp}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-full px-6 py-3 outline-none" />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button variant="primary"
                                    type="submit">
                                    Simpan Data
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}