import { useNavigate } from "react-router-dom";

export default function KonsolidasiMingguan() {
    const navigate = useNavigate();

    const weeks = [
        {
            week: "W9",
            title: "Minggu 9: Fine-Tuning Fleksibilitas",
            focus: "Menguji adaptasi tubuh terhadap variasi makanan sehat",
            tasks: [
                "Terapkan urutan makan yang tepat (Serat → Protein/Lemak → Karbohidrat)",
                "Jaga batas gula harian maksimal ≤ 25g (bebas pemanis buatan berlebih)",
                "Lakukan variasi rute jalan santai atau aktivitas luar ruangan 40 menit",
                "Perhatikan stabilitas energi tubuh sepanjang siang hari",
            ],
        },
        {
            week: "W10",
            title: "Minggu 10: Manajemen Stres & Ritme Sirkadian",
            focus: "Menurunkan stimulasi kortisol yang memicu resistensi perifer",
            tasks: [
                "Lakukan latihan pernapasan relaksasi 4-7-8 selama 5 menit sebelum tidur",
                "Batasi paparan layar gawai (blue light) 45 menit sebelum tidur malam",
                "Pastikan hidrasi pagi hari sebelum sarapan minimal 500 mL air putih",
                "Pertahankan konsistensi streak pelacak di GluCare",
            ],
        },
        {
            week: "W11",
            title: "Minggu 11: Resiliensi Lingkungan & Sosial",
            focus: "Ketahanan terhadap kemunduran saat acara kumpul atau makan di luar",
            tasks: [
                "Gunakan teknik 'Mindful Dining': makan perlahan dan kunyah 20–30 kali",
                "Jika mengonsumsi karbohidrat olahan, imbangi dengan jalan 20 menit pasca makan",
                "Lakukan uji cek glukosa darah puasa (GDP) hari ke-75",
                "Rayakan stabilitas energi tanpa ketergantungan gula manis",
            ],
        },
        {
            week: "W12",
            title: "Minggu 12: Penilaian Komprehensif Hari ke-90",
            focus: "Evaluasi akhir program dan penetapan protokol seumur hidup",
            tasks: [
                "Lakukan pemeriksaan GDP & profil lab akhir program",
                "Jalankan evaluasi milestone 90 hari di GluCare",
                "Bandingkan risiko prediabetes sebelum vs sesudah program 90 hari",
                "Buka lencana puncak: 'Program Completed' (+1000 XP)",
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[22px] mt-0.5">psychology</span>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Prinsip Fisiologis: Homeostasis Jangka Panjang</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Setelah 60 hari adaptasi, tubuh telah merestrukturisasi sel-sel beta pankreas dan kepekaan reseptor insulin hepar. Mempertahankan kebiasaan di minggu 9–12 mengunci "set-point" metabolik baru ini agar tidak mudah kembali ke kondisi resisten sebelumnya.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4 Weekly Roadmap Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {weeks.map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-emerald-300 transition">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-mono font-bold text-sm flex items-center justify-center border border-emerald-100 shrink-0">
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
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition"
                >
                    <span>Kembali ke Pelacak 90 Hari</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}