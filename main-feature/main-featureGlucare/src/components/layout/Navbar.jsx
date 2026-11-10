import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import gsap from "gsap";
import ClinicalBadge from "../ui/ClinicalBadge";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user } = useAuth();
    const navRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        gsap.fromTo(
            navRef.current,
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    const navLinks = [
        { to: "/#beranda", label: "Beranda" },
        { to: "/#fitur", label: "Fitur" },
        { to: "/#cara-kerja", label: "Cara Kerja" },
        { to: "/#manfaat", label: "Manfaat" },
        { to: "/#testimoni", label: "Testimoni" },
        { to: "/#faq", label: "FAQ" },
    ];

    return (
        <header
            ref={navRef}
            className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/85 backdrop-blur-md shadow-sm border-b border-slate-200/70 py-3"
                    : "bg-transparent py-5"
            }`}
        >
            <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-10">
                {/* Logo & Clinical Verification */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                            <img
                                src="/logo_glucare.png"
                                alt="GluCare"
                                className="w-5 h-5 filter brightness-0 invert"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                                GluCare<span className="text-blue-600">.</span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">
                                Metabolic Intelligence
                            </span>
                        </div>
                    </Link>

                    <ClinicalBadge variant="clinical" className="hidden md:inline-flex ml-2">
                        CDC/NHANES Verified
                    </ClinicalBadge>
                </div>

                {/* Desktop Nav Links */}
                <ul className="hidden lg:flex items-center gap-1.5 list-none bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${
                                        isActive
                                            ? "bg-blue-600 text-white font-semibold shadow-xs"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Right CTA */}
                <div className="hidden lg:flex items-center gap-3">
                    {user ? (
                        <Link
                            to="/beranda"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Dashboard Saya
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                            >
                                Masuk
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Cek Risiko AI</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden flex flex-col gap-1.5 w-10 h-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span
                        className={`block h-0.5 w-5 bg-slate-800 transition-all duration-300 ${
                            menuOpen ? "rotate-45 translate-y-2" : ""
                        }`}
                    />
                    <span
                        className={`block h-0.5 w-5 bg-slate-800 transition-all duration-300 ${
                            menuOpen ? "opacity-0 scale-x-0" : ""
                        }`}
                    />
                    <span
                        className={`block h-0.5 w-5 bg-slate-800 transition-all duration-300 ${
                            menuOpen ? "-rotate-45 -translate-y-2" : ""
                        }`}
                    />
                </button>
            </nav>

            {/* Mobile Nav Drawer */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-300 ${
                    menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-6 py-5 shadow-lg mt-3">
                    <ul className="flex flex-col gap-1.5 list-none">
                        {navLinks.map(({ to, label }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) =>
                                        `block py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-blue-50 text-blue-700 font-bold"
                                                : "text-slate-700 hover:bg-slate-50"
                                        }`
                                    }
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                        <li className="mt-3 pt-3 border-t border-slate-100">
                            {user ? (
                                <Link
                                    to="/beranda"
                                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-center block text-sm"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-center block text-sm shadow-sm"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Cek Risiko Anda Sekarang →
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}