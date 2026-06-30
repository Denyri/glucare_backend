import Button from "../components/Button"
import { useNavigate } from "react-router-dom";

export default function StabilisasiMingguan() {
    const navigate = useNavigate();
    const weeks = [
        {
            week: "W1",
            title: "Minggu 1",
            tasks : [
                "Catat baseline gula darah pagi",
                "Mulai jalan 15 menit/hari",
                "Hentikan minumam manis",
                "Tidur jas 22.00 konsisten",
            ],
        },
        {
            week: "W2",
            title: "Minggu 2",
            tasks : [
                "Jalan 20 menit setelah makan siang",
                "Ganti nasi putih 1/2 porsi beras merah",
                "Tambah sayuran 1 porsi per makan",
                "Log semua makanan di jurnal",
            ],
        },
        {
            week: "W3",
            title: "Minggu 3",
            tasks : [
                "Jalan 30 menit/hari",
                "Batasi karbohidrat olahan < 50g",
                "Mulai latihan ringan (yoga / stretching)",
                "Cek berat badan & lingkar pinggang",
            ],
        },
        {
            week: "W4",
            title: "Minggu 4",
            tasks : [
                "Lakukan mini-assessment gejala",
                "Perhitungkan pola makan seminggu",
                "Rencanakan aktivitas bulan berikutnya",
                "Rayakan pencapaian 30 hari pertama",
            ],
        },
    ];

    return (
        <div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#0072CE]">
                    💡Tips Konsistensi
                </h2>
        
                <p className="text-[#374151] mt-2 text-sm">
                    Lakukan tugas di waktu yang sama setiap hari. Pemasangan kebiasaan baru 
                    dengan rutinitas lama (habit stacking) meningkatkan keberhasilan 3x lipat
                </p>
            </div>
                

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weeks.map((item, index) => (
                    <div key ={index} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-2xl">
                                {item.week}
                            </div>

                            <h3 className="text-xl font-semibold text-slate-800">
                                {item.title}
                            </h3>
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-4">
                            {item.tasks.map((task, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xs text-blue-500">
                                        ✓
                                    </div>

                                    <p className="text-sm text-slate-600">{task}</p>
                                </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-4 mb-4">
                                    <Button variant="primary"  
                                        onClick={() => navigate("/analisis")}>
                                        ⟳  Lakukan analisis ulang
                                    </Button>
                                </div>
        </div>        
    );
}