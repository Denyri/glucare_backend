import { Link } from "react-router-dom";

const footerLinks = {
    Platform: [
        { label: "Beranda", to: "/#beranda" },
        { label: "Fitur Klinis AI", to: "/#fitur" },
        { label: "Cara Kerja & Alur", to: "/#cara-kerja" },
        { label: "Manfaat Terukur", to: "/#manfaat" },
        { label: "Testimoni Pengguna", to: "/#testimoni" },
    ],
    Fitur: [
        { label: "Mode Laboratorium", to: "/login" },
        { label: "Kuesioner Cepat", to: "/login" },
        { label: "Program 90 Hari", to: "/login" },
        { label: "Bio-Habit Tracking", to: "/login" },
    ],
    Bantuan: [
        { label: "Tanya Jawab (FAQ)", to: "/#faq" },
        { label: "Pusat Bantuan", to: "/bantuan" },
        { label: "Kebijakan Privasi", to: "/kebijakan" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
                
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
                    
                    {/* Brand Info (Span 5) */}
                    <div className="lg:col-span-5 space-y-4">
                        <Link to="/" className="flex items-center gap-2.5 w-fit group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-md">
                                <img
                                    src="/logo_glucare.png"
                                    alt="GluCare"
                                    className="w-5 h-5 filter brightness-0 invert"
                                />
                            </div>
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                                GluCare<span className="text-blue-500">.</span>
                            </span>
                        </Link>

                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Platform pencegahan metabolik & deteksi dini prediabetes untuk usia dewasa muda (20–40 tahun) berbasis model prediktif NHANES 2021–2023 CDC dan protokol 90 hari.
                        </p>

                        <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Sistem Operasional & Layanan AI Aktif</span>
                        </div>
                    </div>

                    {/* Navigation Columns (Span 7) */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title} className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                                    {title}
                                </h4>
                                <ul className="space-y-2 list-none">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                to={link.to}
                                                className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Medical Disclaimer Banner */}
                <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                        <span>⚖️ Penafian Medis (Medical Disclaimer):</span>
                    </div>
                    <p>
                        GluCare adalah alat bantu skrining risiko awal dan pendamping intervensi gaya hidup mandiri. Estimasi model AI tidak dimaksudkan sebagai pengganti diagnosis definitif, resep medis, atau pemeriksaan dokter spesialis. Jika Anda mengalami gejala hiperglikemia akut, segera hubungi fasilitas layanan kesehatan terdekat.
                    </p>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>
                        © {new Date().getFullYear()} GluCare Health Technologies. Hak cipta dilindungi.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/privasi-layanan" className="hover:text-slate-300 transition-colors">
                            Kebijakan Privasi
                        </Link>
                        <Link to="/bantuan-dan-dukungan" className="hover:text-slate-300 transition-colors">
                            Bantuan & Syarat Layanan
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}