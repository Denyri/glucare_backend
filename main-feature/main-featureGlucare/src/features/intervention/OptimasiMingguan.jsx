import { useNavigate } from "react-router-dom";

export default function OptimasiMingguan() {
    const navigate = useNavigate();

    const weeks = [
        {
            week: "W5",
            title: "Minggu 5: Pengenalan Beban Fungsional",
            focus: "Menstimulasi GLUT4 otot tanpa membebani persendian",
            tasks: [
                "Lakukan 2 sesi latihan beban tubuh (bodyweight squat & wall push-up) 15 menit",
                "Turunkan batas karbohidrat olahan menjadi ≤ 30g per hari",
                "Pastikan kecukupan protein 1.0–1.2 g/kg berat badan untuk pemulihan otot",
                "Pantau apakah ada rasa lapar berlebih pasca latihan",
            ],
        },
        {
            week: "W6",
            title: "Minggu 6: Integrasi Post-Prandial Walking",
            focus: "Mencegah hiperglikemia pasca-makan besar",
            tasks: [
                "Lakukan jalan kaki 15 menit tepat setelah makan siang dan makan malam",
                "Ganti camilan manis dengan kacang-kacangan tinggi magnesium (almond, kenari)",
                "Penuhi hidrasi minimal 2.5 liter air mineral per hari",
                "Catat skor energi pada modul harian",
            ],
        },
        {
            week: "W7",
            title: "Minggu 7: Eksplorasi Serat Prebiotik",
            focus: "Memperkuat mikrobiota usus dan penyerapan lambat",
            tasks: [
                "Konsumsi minimal 30g serat total (sayuran hijau, biji chia, apel dengan kulit)",
                "Cek kadar glukosa darah puasa (GDP) berkala hari ke-45",
                "Pertahankan konsistensi tidur 7.5 jam di ruang yang gelap dan sejuk",
                "Tingkatkan repetisi latihan beban tubuh secara perlahan",
            ],
        },
        {
            week: "W8",
            title: "Minggu 8: Evaluasi Tengah Program (Hari ke-60)",
            focus: "Menilai adaptasi metabolik sebelum fase konsolidasi",
            tasks: [
                "Ukur lingkar pinggang dan bandingkan dengan baseline",
                "Lakukan evaluasi glukosa puasa 60 hari",
                "Review kepatuhan dan pelajari strategi menghadapi situasi sosial",
                "Siapkan mental untuk mengunci hasil di Fase 3",
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-purple-600 text-[22px] mt-0.5">fitness_center</span>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Prinsip Fisiologis: Kontraksi Otot Non-Insulin</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Saat otot berkontraksi dalam latihan beban atau jalan santai, transporter glukosa (GLUT4) bergerak ke membran sel secara langsung <strong>tanpa memerlukan hormon insulin</strong>. Ini adalah cara tercepat membersihkan kelebihan glukosa dalam sirkulasi darah.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4 Weekly Roadmap Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {weeks.map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-purple-300 transition">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-mono font-bold text-sm flex items-center justify-center border border-purple-100 shrink-0">
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
                                    <div className="w-4 h-4 rounded-full bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
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
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition"
                >
                    <span>Kembali ke Pelacak 90 Hari</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}