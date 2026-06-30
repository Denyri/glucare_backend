import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo_login from "../assets/logo_login.png";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinkClass = ({ isActive }) =>
        `text-[15px] font-bold ${isActive ? "text-[#0072CE]" : "text-black hover:text-[#0072CE]"}`;

    return (
        <header className="w-full bg-white rounded-b-[20px] shadow-md fixed top-0 left-0 z-50 font-[Poppins]">
            <nav className="flex items-center justify-between max-w-6xl mx-auto px-5 py-4">

                
                <Link to="/" className="flex items-center">
                    <img src="/logo_glucare.png" alt="Logo" className="w-10" />
                    <h2 className="text-[21px] font-bold text-[#0072CE]">Glucare</h2>
                </Link>

                
                <ul className="hidden md:flex gap-5 list-none">
                    <li><NavLink to="/" className={navLinkClass}>Beranda</NavLink></li>
                    <li><NavLink to="/tentang" className={navLinkClass}>Tentang Kami</NavLink></li>
                    <li><NavLink to="/fitur" className={navLinkClass}>Fitur Utama</NavLink></li>
                    <li><NavLink to="/cara-kerja" className={navLinkClass}>Cara Kerja</NavLink></li>
                    <li><NavLink to="/hubungi" className={navLinkClass}>Hubungi Kami</NavLink></li>
                </ul>

                
                <NavLink
                    to="/login"
                    className={({ isActive }) =>
                        `hidden md:flex items-center gap-2 font-semibold transition ${
                        isActive ? "text-[#0072CE]" : "text-black hover:text-[#0072CE]"}`}
                >
                    <img src={logo_login} alt="login" className="w-[14px]" />
                    <span>Masuk</span>
                </NavLink>

                
                <button
                    className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block h-[2px] w-6 bg-black transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                    <span className={`block h-[2px] w-6 bg-black transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block h-[2px] w-6 bg-black transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                </button>
            </nav>

            
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96" : "max-h-0"}`}>
                <ul className="flex flex-col px-5 pb-4 gap-4 list-none">
                    {[
                        { to: "/", label: "Beranda" },
                        { to: "/tentang", label: "Tentang Kami" },
                        { to: "/fitur", label: "Fitur Utama" },
                        { to: "/cara-kerja", label: "Cara Kerja" },
                        { to: "/hubungi", label: "Hubungi Kami" },
                    ].map(({ to, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={navLinkClass}
                                onClick={() => setMenuOpen(false)}
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}
                    <li>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `flex items-center gap-2 font-semibold transition ${
                                isActive ? "text-[#0072CE]" : "text-black hover:text-[#0072CE]"}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <img src={logo_login} alt="login" className="w-[14px]" />
                            <span>Masuk</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </header>
    );
}