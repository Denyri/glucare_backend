import ProfileItem from "./ProfileItem";
import { FaUser, FaVenusMars, FaCalendar, FaPhone, FaEnvelope } from "react-icons/fa";
import Button from "../components/Button"
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useEffect, useState } from "react";

export default function ProfileCard() {
    const navigate =useNavigate();
    const [profile,setProfile] = useState(null);

    useEffect(() => {
        const currentUser = JSON.parse(
            localStorage.getItem("currentUser") ||
            sessionStorage.getItem("currentUser")
        );

        if (!currentUser) return;

        api.get(`/api/auth/profile/${currentUser.id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
                },
            }
        )
        .then((response) => {
            setProfile(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
    }, []);

    if(!profile) return <p>Loading...</p>;

    const data =[ 
        { icon: FaUser, label: "Name", value: profile.fullname},
        { icon: FaVenusMars, label: "Jenis Kelamin", value: profile.gender},
        { icon: FaCalendar, label: "Tanggal Lahir", value: new Date(profile.birth_date).toLocaleDateString("id-ID")},
        { icon: FaPhone, label: "No Telepon", value: profile.phone},
        { icon: FaEnvelope, label: "E-mail", value: profile.email},
    ];

    return (
        <div className="bg-blue-100 p-5 rounded-xl shadow">
            <h2 className="font-bold mb-4">Profile</h2>

            <div className="space-y-3">
                {data.map((item, index) => (
                    <ProfileItem key={index} {...item} />
                ))}
            </div>

            <div className="flex justify-end mt-6">
            <Button variant="primary" onClick={() => navigate("/editprofile")}>
                Edit Profile
            </Button>  
            </div>         
        </div>
    );
}