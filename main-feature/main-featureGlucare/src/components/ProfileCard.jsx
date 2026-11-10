import ProfileItem from "./ProfileItem";
import { FaUser, FaVenusMars, FaCalendar, FaPhone, FaEnvelope } from "react-icons/fa";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

export default function ProfileCard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(user || null);

    useEffect(() => {
        if (!user?.id) return;

        authService.getProfile(user.id)
            .then((data) => {
                setProfile(data);
            })
            .catch((error) => {
                console.error("Gagal mengambil data profil:", error);
            });
    }, [user?.id]);

    if (!profile) return (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#0062E3]"></div>
        </div>
    );

    const data = [
        { icon: FaUser, label: "Nama Lengkap", value: profile.fullname || "-" },
        { icon: FaVenusMars, label: "Jenis Kelamin", value: profile.gender === "L" || profile.gender === "laki-laki" ? "Laki-laki" : profile.gender === "P" || profile.gender === "perempuan" ? "Perempuan" : profile.gender || "-" },
        { icon: FaCalendar, label: "Tanggal Lahir", value: profile.birth_date ? new Date(profile.birth_date).toLocaleDateString("id-ID") : "-" },
        { icon: FaPhone, label: "Nomor Telepon", value: profile.phone || "-" },
        { icon: FaEnvelope, label: "Alamat Email", value: profile.email || "-" },
    ];

    return (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                    <span className="material-symbols-outlined text-[#0062E3] text-[22px]">badge</span>
                    <h2 className="font-bold font-display text-base text-slate-900">Data Profil Pengguna</h2>
                </div>

                <div className="space-y-3">
                    {data.map((item, index) => (
                        <ProfileItem key={index} {...item} />
                    ))}
                </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                <Button variant="primary" onClick={() => navigate("/editprofile")}>
                    Edit Informasi Profil
                </Button>
            </div>
        </div>
    );
}