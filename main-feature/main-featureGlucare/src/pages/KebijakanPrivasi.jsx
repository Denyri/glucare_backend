import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useSidebar } from "../hooks/useSidebar";

export default function KebijakanPrivasi() {
    const { isOpen } = useSidebar();

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Kebijakan Privasi & Ketentuan Layanan"
                    subtitle="Komitmen perlindungan data medis pribadi, privasi komputasi AI, dan etika penggunaan platform GluCare"
                />

                <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        {/* Kebijakan Privasi */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                                    <span className="material-symbols-outlined text-[#0062E3] text-[22px]">verified_user</span>
                                    <h2 className="font-bold font-display text-base text-slate-900">Kebijakan Privasi Data Medis</h2>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                                    GluCare mematuhi prinsip enkripsi data kesehatan setara standar HIPAA dan GDPR. Parameter biomarker yang Anda masukkan hanya diproses untuk inferensi model prediktif dan tidak diperjualbelikan kepada pihak ketiga.
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                                        <p className="font-bold text-slate-800 mb-1">Data yang Dikelola:</p>
                                        <ul className="text-slate-600 space-y-1 list-disc list-inside">
                                            <li>Informasi akun terverifikasi (Nama, Email, Usia)</li>
                                            <li>Biomarker klinis (HbA1c, GDP, Profil Lipid, Tekanan Darah)</li>
                                            <li>Log kepatuhan intervensi gaya hidup harian</li>
                                        </ul>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs">
                                        <p className="font-bold text-[#0062E3] mb-1">Enkripsi & Keamanan:</p>
                                        <p className="text-slate-700 leading-relaxed">
                                            Semua transmisi data dilindungi dengan protokol TLS 1.3 dan penyimpanan basis data terenkripsi AES-256.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                                Kontak Petugas Privasi Data:{" "}
                                <a href="mailto:support@glucare.health" className="text-[#0062E3] font-bold hover:underline">
                                    support@glucare.health
                                </a>
                            </div>
                        </div>

                        {/* Ketentuan Layanan */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                                    <span className="material-symbols-outlined text-purple-600 text-[22px]">gavel</span>
                                    <h2 className="font-bold font-display text-base text-slate-900">Ketentuan Layanan & Penafian Klinis</h2>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                                    GluCare berfungsi sebagai platform skrining risiko dan pendampingan edukasi preventif berbasis bukti ilmiah, <strong>bukan sebagai pengganti diagnosis dokter formal</strong>.
                                </p>

                                <div className="space-y-3 mb-6 text-xs">
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                                        <p className="font-bold text-slate-800 mb-1">Kewajiban Pengguna:</p>
                                        <ul className="text-slate-600 space-y-1 list-disc list-inside">
                                            <li>Memasukkan data hasil lab yang valid untuk akurasi rekomendasi</li>
                                            <li>Menjaga kerahasiaan kredensial kata sandi akun pribadi</li>
                                            <li>Berkonsultasi dengan dokter sebelum mengubah regimen terapi medis aktif</li>
                                        </ul>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900">
                                        <p className="font-bold text-amber-800 mb-1">Hak Pengelola:</p>
                                        <p className="leading-relaxed">
                                            Kami berhak memperbarui model algoritma AI sesuai perkembangan literatur klinis mutakhir dan menghapus akses jika terjadi penyalahgunaan sistem.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 text-center">
                                <span className="text-[11px] font-mono text-slate-400">
                                    Versi Dokumen 2.1 · Terakhir Diperbarui: Oktober 2026
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}