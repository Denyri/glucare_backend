import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useSidebar } from "../hooks/useSidebar";
import defaultAvatar from "../assets/Profile.jpg";
import ProfileCard from "../components/ProfileCard";
import SettingCard from "../components/SettingCard";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

export default function SettingAndProfile() {
    const { isOpen } = useSidebar();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        authService.getProfile(user.id)
            .then((data) => setProfile(data))
            .catch((error) => console.log(error));
    }, [user?.id]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
                <div className="flex-1 flex flex-col">
                    <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                        <HeaderAnalisis
                        title="Akun & Pengaturan"
                        subtitle="Atur akun"/>

                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mt-4 pl-4 sm:pl-6 lg:pl-6 pr-4 sm:pr-6">
                            <img src={profile?.profile_image ? `${import.meta.env.VITE_API_URL}${profile.profile_image}` : defaultAvatar} alt="Profile" className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover flex-shrink-0"/>
                            <div className="flex flex-col min-w-0 flex-1 max-w-full">
                                <h2 className="text-3xl font-bold truncate">{profile?.fullname || user?.fullname || "Loading..."}</h2>
                                <p className="text-xl text-gray-500 truncate">{profile?.email || user?.email || "Loading..."}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 pl-4 sm:pl-6 lg:pl-6 pr-4 sm:pr-6">
                            <ProfileCard />
                            <SettingCard />
                        </div>
                    </div>
                </div>
        </div>
    );
}