import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import defaulAvatar from "../assets/Profile.jpg";
import { useSidebar } from "../hooks/useSidebar";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";

export default function EditProfile() {
    const navigate =useNavigate();

    const { isOpen } = useSidebar();

    const [selectedFile, setSelectedFile] = useState(null);

    const [form, setForm] = useState({
        nama:"",
        jenisKelamin:"",
        email:"",
        noTelepon:"",
        tanggalLahir:"",
    });

    const [preview, setPreview] = useState(null);

    useEffect(()=>{
        const currentUser = JSON.parse(
            localStorage.getItem("currentUser") || 
            sessionStorage.getItem("currentUser")
        );

        api.get(`/api/auth/profile/${currentUser.id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
                },
            }
        )
        .then((response) => {
            const user = response.data;

            setForm({
                nama: user.fullname || "",
                jenisKelamin: user.gender || "",
                email: user.email || "",
                noTelepon: user.phone || "",
                tanggalLahir: user.birth_date ? user.birth_date.split("T")[0] : "",
            });

            if(user.profile_image) {
                setPreview(user.profile_image.startsWith("http") ? user.profile_image : `${import.meta.env.VITE_API_URL}${user.profile_image}`);
            };
        })
        .catch((error) => console.log(error));
    }, []);

    const handleChange = (e) => {
    const { name, value } = e.target;

    
    if (name === "noTelepon") {
        const onlyNumber = value.replace(/\D/g, "");
        setForm((prev) => ({
            ...prev,
            [name]: onlyNumber,
        }));
    } else {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const currentUser = JSON.parse(
                localStorage.getItem("currentUser") ||
                sessionStorage.getItem("currentUser")
            );
            
            const token = 
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");

            const response = await api.put(`/api/auth/update-profile/${currentUser.id}`, 
                {
                    fullname: form.nama,
                    gender: form.jenisKelamin,
                    email: form.email,
                    phone: form.noTelepon,
                    birth_date: form.tanggalLahir,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            );

            let updateUser = {
                ...currentUser, ...response.data.user,
            };

            if(selectedFile) {
                const imageData = new FormData();
                imageData.append("image", selectedFile);

                const photoResponse = await api.put(`/api/auth/upload-photo/${currentUser.id}`,imageData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                        },
                    }
                );

                updateUser.profile_image = photoResponse.data.imagePath;
            }

            localStorage.setItem("currentUser", JSON.stringify(updateUser));
            sessionStorage.setItem("currentUser", JSON.stringify(updateUser));

            Swal.fire({
                icon:"success",
                title:"Berhasil!",
                text: "Profile berhasil diperbaharui.",
                confirmButtonText:"OK",
                confirmButtonColor: "#2563eb",
            }).then(() => {
                navigate("/pengaturan"); 
            });                   
        } catch (error) {
            Swal.fire({
                icon:"error",
                title:"Oops...",
                text: error.response?.data?.message || "Update profile gagal.",
                confirmButtonText:"Coba Lagi",
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
        <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col">
            <div
            className={`flex-1 transition-all duration-300 ${
            isOpen ? "lg:ml-60" : "lg:ml-24"
        }`}
        >
            <HeaderAnalisis
                title="Profile Edit"
                subtitle="Edit informasi akun kamu"/>

            <div className="p-6 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="text-center">
                        <p className="mb-2 font-medium">Foto Profile</p>

                        <div className="flex flex-col items-center gap-3">
                            <img src={preview || defaulAvatar} className="w-24 h-24 rounded-full object-cover border"/>
                            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
                                Ganti foto profil
                                <input type="file" hidden onChange={handleUpload} />
                            </label>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nama</label>
                            <input
                                type="text"
                                name="nama"
                                value={form.nama}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Jenis Kelamin</label>
                            <select
                                name="jenisKelamin"
                                value={form.jenisKelamin}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100">
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100"/>
                        </div>

                        <div>
                            <label className="text-sm font-medium">No Telepon</label>
                            <input
                                type="tel"
                                name="noTelepon"
                                value={form.noTelepon}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100"/>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Tanggal Lahir</label>
                            <input
                                type="date"
                                name="tanggalLahir"
                                value={form.tanggalLahir}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100"/>
                        </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
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