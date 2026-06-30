import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaList, FaCalendar, FaRobot, FaCog, FaBars, FaSignOutAlt, FaChartPie } from "react-icons/fa";
import defaultProfile from "../assets/Profile.jpg"
import { useSidebar } from "../hooks/useSidebar";
import api from "../api";

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isOpen, setIsOpen } = useSidebar();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            let user = null;
            try {
                const rawUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
                if (rawUser && rawUser !== "undefined") {
                    user = JSON.parse(rawUser);
                }
            } catch (e) { console.error("Error parsing user in Sidebar", e); }

            const token = localStorage.getItem("token") || 
            sessionStorage.getItem("token");

            if (user && user.id) {
                try {
                    const response = await api.get(`/api/auth/profile/${user.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setCurrentUser(response.data);
                    localStorage.setItem("currentUser", JSON.stringify(response.data));
                } catch (error) {
                    console.error("Gagal ambil data user di Sidebar:", error);
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(user);
            }
    }; 

    getUser();

    window.addEventListener("focus", getUser);
    return () => window.removeEventListener("focus", getUser);
    }, [location.pathname]);

    const isMenuActive = (item) => {
        if (item.path === "/") {
            return location.pathname === "/";
        }

        if (item.path === "/analisis") {
            return (
                location.pathname.includes("/analisis") ||
                location.pathname.includes("/kuesioner") ||
                location.pathname.includes("modeLab") ||
                location.pathname.includes("/hasil") 
            );
        }

        if (item.path === "/rencana") {
            return (
                location.pathname.includes("/rencana") ||
                location.pathname.includes("/evaluasi") ||
                location.pathname.includes("/pencapaian") ||
                location.pathname.includes("/stabilisasi") ||
                location.pathname.includes("/optimasi") ||
                location.pathname.includes("/konsolidasi")
            );
        }

        if (item.path === "/pengaturan") {
            return (
                location.pathname.includes("/pengaturan") ||
                location.pathname.includes("/editprofile") ||
                location.pathname.includes("/ubahpassword") ||
                location.pathname.includes("/informasiAplikasi") ||
                location.pathname.includes("/bantuan-dan-dukungan") ||
                location.pathname.includes("/privasi-layanan")
            );
        }

        return location.pathname.startsWith(item.path);
    };

    const menu = [
        { name: "Beranda", icon: <FaHome />, path: "/beranda" },
        { name: "Analisis", icon: <FaChartPie />, path: "/analisis" },
        { name: "Rencana 90 Hari", icon: <FaCalendar />, path: "/rencana" },
        { name: "Pengaturan", icon: <FaCog />, path: "/pengaturan" },
    ];

    
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden w-12 h-12 bg-gradient-to-b from-[#003a68] to-[#0072CE] 
                        rounded-xl flex items-center justify-center text-xl shadow-2xl"
            >
                <FaBars />
            </button>

            
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            
            <div
                className={`
                    fixed inset-y-0 left-0 h-screen  flex flex-col text-white px-4 bg-gradient-to-b 
                    from-[#003a68] to-[#0072CE] transition-all duration-300 z-50 shadow-2xl lg:shadow-none
                    ${isOpen ? "w-60" : "w-24"}
                    lg:translate-x-0
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                
                <div className="flex items-center justify-between mb-4 h-14 -mx-4 px-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <img 
                            src="/logo_glucare.png" 
                            className="w-12 h-12 min-w-[48px] object-contain flex-shrink-0"
                            alt="GluCare Logo"
                        />
                        
                        <span 
                            className={`
                                text-base font-black tracking-wide whitespace-nowrap transition-all duration-200
                                ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                            `}
                        >
                            GLUCARE
                        </span>
                    </div>

                    <button
                        onClick={() => {
                            if (window.innerWidth < 1024) {
                                setIsMobileMenuOpen(false);
                            } else {
                                setIsOpen(!isOpen);
                            }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0 hover:bg-white/20 rounded-md p-1"
                    >
                        <FaBars />
                    </button>
                </div>

                
                <ul className="flex-1">
                    {menu.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="no-underline text-white"
                            onClick={() => window.innerWidth < 1024 && setIsMobileMenuOpen(false)}
                        >
                            <li
                                className={`
                                    relative flex items-center h-12 rounded-lg cursor-pointer mb-2 font-bold text-sm px-3
                                    ${
                                        isMenuActive(item)
                                        ? "bg-blue-500"
                                        : "hover:bg-white/20"
                                    }
                                `}
                            >
                                <span className="w-6 flex justify-center text-lg flex-shrink-0">
                                    {item.icon}
                                </span>
                                
                                <span 
                                    className={`
                                        absolute left-12 whitespace-nowrap transition-all duration-200
                                        ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                                    `}
                                >
                                    {item.name}
                                </span>
                            </li>
                        </Link>
                    ))}
                </ul>

                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="relative flex items-center h-12 px-4 rounded-lg font-bold hover:bg-white/20 text-sm text-white no-underline w-full text-left"
                >
                    <span className="w-6 flex justify-center text-lg flex-shrink-0">
                        <FaSignOutAlt />
                    </span>

                    <span
                        className={`
                        absolute left-12 whitespace-nowrap transition-all duration-200
                        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
                        `}>
                        Keluar
                    </span>
                </button>

                <div className="h-px bg-white/40 my-3"></div>

                
                <Link
                    to="/pengaturan"
                    className="relative flex items-center h-16 px-2 text-white no-underline hover:bg-white/20 rounded-lg"
                    onClick={() => window.innerWidth < 1024 && setIsMobileMenuOpen(false)}
                >
                    <img
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        src={currentUser?.profile_image ? `${import.meta.env.VITE_API_URL}${currentUser.profile_image}` : defaultProfile}
                        alt="Profile"
                    />

                    <span
                        className={`
                            absolute left-16 font-bold text-sm whitespace-nowrap transition-all duration-200
                            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
                        `}
                    >
                        {currentUser?.fullname || "User"}
                    </span>
                </Link>
            </div>

            {/* Modal Konfirmasi Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[32px]">logout</span>
                        </div>
                        <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 font-bold">Keluar Akun?</h3>
                        <p className="text-body-md font-body-md text-on-surface-variant mb-8">
                            Anda harus masuk kembali untuk mengakses data kesehatan Anda.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-bold"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem("currentUser");
                                    sessionStorage.removeItem("currentUser");
                                    localStorage.removeItem("token");
                                    sessionStorage.removeItem("token");
                                    
                                    setShowLogoutModal(false);
                                    if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                                    
                                    navigate("/login");
                                }}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md font-bold"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;