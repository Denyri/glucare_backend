import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { LogIn, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoFull from "../assets/Logo Kesehatan GluCaré Modern.png";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("beranda");
    const { user } = useAuth();
    const navRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        gsap.fromTo(
            navRef.current,
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    // Scrollspy to automatically highlight active section
    useEffect(() => {
        const sectionIds = ["beranda", "fitur", "cara-kerja", "manfaat", "testimoni", "faq"];

        const handleScrollSpy = () => {
            const scrollPosition = window.scrollY + 180;
            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const el = document.getElementById(sectionIds[i]);
                if (el) {
                    const top = el.offsetTop;
                    if (scrollPosition >= top) {
                        setActiveSection(sectionIds[i]);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScrollSpy, { passive: true });
        handleScrollSpy();
        return () => window.removeEventListener("scroll", handleScrollSpy);
    }, []);

    // Handle hash on initial load or route transition
    useEffect(() => {
        if (location.pathname === "/" && location.hash) {
            const targetId = location.hash.replace("#", "");
            setTimeout(() => {
                const el = document.getElementById(targetId);
                if (el) {
                    const offset = 75;
                    const top = el.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: "smooth" });
                    setActiveSection(targetId);
                }
            }, 300);
        }
    }, [location]);

    const navLinks = [
        { id: "beranda", label: "Beranda" },
        { id: "fitur", label: "Fitur" },
        { id: "cara-kerja", label: "Cara Kerja" },
        { id: "manfaat", label: "Manfaat" },
        { id: "testimoni", label: "Testimoni" },
        { id: "faq", label: "FAQ" },
    ];

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        setMenuOpen(false);

        if (location.pathname !== "/") {
            navigate(`/#${sectionId}`);
            return;
        }

        if (sectionId === "beranda") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.history.pushState(null, "", "/");
            setActiveSection("beranda");
            return;
        }

        const el = document.getElementById(sectionId);
        if (el) {
            const offset = 75;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
            window.history.pushState(null, "", `/#${sectionId}`);
            setActiveSection(sectionId);
        }
    };

    return (
        <header
            ref={navRef}
            className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ease-out ${
                scrolled
                    ? "pt-2.5 sm:pt-3 px-3 sm:px-6"
                    : "pt-4 sm:pt-5 lg:pt-6 px-4 sm:px-6 lg:px-8"
            }`}
        >
            {/* ── Acrylic Glassmorphic Pill Container ───────────────────────── */}
            <nav
                className={`flex items-center justify-between mx-auto transition-all duration-300 ease-out rounded-full bg-white/85 backdrop-blur-2xl backdrop-saturate-180 border border-white/80 shadow-[0_10px_32px_rgba(15,23,42,0.06),0_2px_8px_rgba(0,114,206,0.04),inset_0_1px_2px_rgba(255,255,255,0.95)] ${
                    scrolled
                        ? "max-w-5xl px-5 sm:px-7 py-2 sm:py-2.5 shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
                        : "max-w-6xl xl:max-w-7xl px-6 sm:px-8 py-2.5 sm:py-3.5"
                }`}
            >
                {/* ── Logo Kiri: Full Branded GluCare Logo ── */}
                <div className="flex items-center shrink-0">
                    <a
                        href="/#beranda"
                        onClick={(e) => scrollToSection(e, "beranda")}
                        className="flex items-center group cursor-pointer select-none"
                    >
                        <img
                            src={logoFull}
                            alt="GluCare - Deteksi Dini, Langkah Lebih Sehat"
                            className={`w-auto object-contain transition-all duration-300 group-hover:scale-102 ${
                                scrolled ? "h-8 sm:h-9 md:h-9.5" : "h-9 sm:h-10 md:h-11"
                            }`}
                        />
                    </a>
                </div>

                {/* ── Desktop Nav Links (Clean Text with Active Underline) ── */}
                <ul className="hidden lg:flex items-center gap-4.5 xl:gap-7 list-none m-0 p-0">
                    {navLinks.map(({ id, label }) => (
                        <li key={id}>
                            <a
                                href={`/#${id}`}
                                onClick={(e) => scrollToSection(e, id)}
                                className={`font-subheading text-[14.5px] xl:text-[15px] tracking-normal transition-colors duration-200 inline-block whitespace-nowrap cursor-pointer ${
                                    activeSection === id
                                        ? "text-[#0072CE] font-bold border-b-2 border-[#0072CE] pb-1"
                                        : "text-slate-600 hover:text-[#0072CE] font-medium border-b-2 border-transparent pb-1"
                                }`}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* ── Right Action Button: Adaptif Hero vs Scrolled (Icon-Only saat Mengecil) ── */}
                <div className="hidden lg:flex items-center shrink-0">
                    {user ? (
                        <Link
                            to="/beranda"
                            title="Dashboard"
                            aria-label="Dashboard"
                            className={`font-button font-semibold text-white bg-[#00A896] hover:bg-[#009282] active:scale-95 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center shrink-0 whitespace-nowrap ${
                                scrolled
                                    ? "w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full p-0"
                                    : "gap-2 px-4.5 py-2 sm:py-2.5 rounded-full text-sm"
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4 stroke-[2.2] shrink-0" />
                            {!scrolled && <span>Dashboard</span>}
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            title="Login"
                            aria-label="Login"
                            className={`font-button font-semibold text-white bg-[#00A896] hover:bg-[#009282] active:scale-95 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center shrink-0 whitespace-nowrap ${
                                scrolled
                                    ? "w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full p-0"
                                    : "gap-2 px-5 py-2 sm:py-2.5 rounded-full text-sm"
                            }`}
                        >
                            <LogIn className="w-4 h-4 stroke-[2.2] shrink-0" />
                            {!scrolled && <span>Login</span>}
                        </Link>
                    )}
                </div>

                {/* ── Mobile Menu Toggle Button ──────────────────────────── */}
                <button
                    className="lg:hidden flex flex-col gap-1.5 w-10 h-10 items-center justify-center rounded-full bg-white/70 hover:bg-white/90 border border-white/80 transition-colors shadow-2xs"
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

            {/* ── Mobile Nav Drawer with Acrylic Effect ─────────────────── */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-300 ${
                    menuOpen ? "max-h-96 opacity-100 mt-2.5" : "max-h-0 opacity-0 mt-0 pointer-events-none"
                }`}
            >
                <div className="bg-white/90 backdrop-blur-2xl backdrop-saturate-180 border border-white/80 rounded-3xl px-6 py-5 shadow-2xl shadow-slate-900/10">
                    <ul className="flex flex-col gap-2 list-none m-0 p-0">
                        {navLinks.map(({ id, label }) => (
                            <li key={id}>
                                <a
                                    href={`/#${id}`}
                                    onClick={(e) => scrollToSection(e, id)}
                                    className={`block py-2 px-3 rounded-xl text-sm transition-colors cursor-pointer ${
                                        activeSection === id
                                            ? "text-[#0072CE] font-bold border-l-3 border-[#0072CE] bg-blue-50/70 pl-3"
                                            : "text-slate-700 hover:text-[#0072CE] hover:bg-slate-50 font-medium"
                                    }`}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                        <li className="mt-2 pt-3 border-t border-slate-200/60">
                            {user ? (
                                <Link
                                    to="/beranda"
                                    className="w-full py-2.5 rounded-full bg-[#00A896] hover:bg-[#009282] text-white font-semibold text-center inline-flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <LayoutDashboard className="w-4 h-4 stroke-[2.2]" />
                                    <span>Buka Dashboard</span>
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="w-full py-2.5 rounded-full bg-[#00A896] hover:bg-[#009282] text-white font-semibold text-center inline-flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <LogIn className="w-4 h-4 stroke-[2.2]" />
                                    <span>Login</span>
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}