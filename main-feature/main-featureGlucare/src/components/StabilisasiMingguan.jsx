import { useNavigate } from "react-router-dom";

export default function StabilisasiMingguan() {
    const navigate = useNavigate();

    const weeks = [
        {
            week: "W1",
            title: "Minggu 1: Kalibrasi & Eliminasi Gula",
            focus: "Menghilangkan gula cair kemasan dan mencatat data glukosa awal",
            tasks: [
                "Catat baseline glukosa puasa pagi (GDP)",
                "Mulai jalan kaki santai 15–20 menit setiap hari",
                "Hentikan konsumsi minuman boba, soda, dan teh manis kemasan",
                "Tetapkan jadwal tidur malam konsisten pukul 22.00–23.00",
            ],
        },
        {
            week: "W2",
            title: "Minggu 2: Post-Meal Walking & Serat",
            focus: "Mengatur penyerapan karbohidrat pasca makan siang dan malam",
            tasks: [
                "Jalan kaki 15–20 menit segera setelah makan siang",
                "Ganti separuh porsi karbohidrat dengan opsi berserat tinggi",
                "Tambah 1 porsi sayuran hijau atau serat larut per waktu makan",
                "Catat kepatuhan harian pada modul Rencana 90 Hari",
            ],
        },
        {
            week: "W3",
            title: "Minggu 3: Peningkatan Durasi Aktivitas",
            focus: "Mencapai standar aerobik ADA 150 menit per minggu",
            tasks: [
                "Tingkatkan durasi jalan kaki hingga 30 menit per hari",
                "Batasi karbohidrat olahan sederhana < 40g per hari",
                "Lakukan peregangan dinamis atau mobilitas ringan di pagi hari",
                "Evaluasi tren energi tubuh dan kualitas tidur",
            ],
        },
        {
            week: "W4",
            title: "Minggu 4: Mini-Assessment & Konsolidasi",
            focus: "Pemeriksaan glukosa hari ke-30 dan persiapan memasuki Fase 2",
            tasks: [
                "Lakukan uji cek glukosa darah puasa (GDP) hari ke-28/30",
                "Bandingkan tingkat kebugaran dengan minggu pertama",
                "Review kepatuhan dan jalankan evaluasi milestone 30 hari",
                "Siapkan transisi ke latihan kekuatan di Fase 2",
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0062E3] text-[22px] mt-0.5">tips_and_updates</span>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Metode Pembiasaan: Habit Stacking</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Kaitkan kebiasaan baru dengan rutinitas harian yang sudah ada. Contoh: <em>"Setelah makan siang, saya langsung berjalan kaki 15 menit."</em> Pendekatan ini terbukti meningkatkan retensi kepatuhan hingga 300%.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4 Weekly Roadmap Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {weeks.map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-blue-300 transition">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062E3] font-mono font-bold text-sm flex items-center justify-center border border-blue-100 shrink-0">
                                {item.week}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 font-display">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">{item.focus}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
                            {item.tasks.map((task, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                        ✓
                                    </div>
                                    <p className="text-xs text-slate-700 leading-snug">{task}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
                <button
                    onClick={() => navigate("/rencana")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0062E3] text-white font-bold text-xs shadow-md hover:bg-[#0052be] transition"
                >
                    <span>Catat Kepatuhan Hari Ini</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}