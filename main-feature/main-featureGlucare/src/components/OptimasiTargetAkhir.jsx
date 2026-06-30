import Button from './Button';
import { useNavigate } from "react-router-dom";
import LogoIlmiah from "../assets/FaseIntervensi/DasarIlmiah.png";
import LogoGula from "../assets/FaseIntervensi/Gula.png";
import LogoMakanan from "../assets/FaseIntervensi/LogMakanan.png";
import LogoWaktu from "../assets/FaseIntervensi/Waktu.png";
import LogoMinuman from "../assets/FaseIntervensi/Minuman.png";


export default function OptimasiTargetAkhir() {
    const navigate = useNavigate();

    const targets = [
        {
        title: "Gula Harian",
        value: "< 40g/hari",
        desc: "Kurangi bertahap dari kebiasaan",
        icon : "🍬"
        },
        {
        title: "Aktivitas",
        value: "150 menit/minggu",
        desc: "Kurangi 10g dari fase sebelumnya",
        icon: "🏃‍♂️"
        
        },
        {
        title: "Tidur",
        value: "7 jam/malam",
        desc: "Jadwal tidur konsisten",
        icon: "😴"
        },
        {
        title: "Air Putih",
        value: "8 gelas/hari",
        desc: "Hidrasi optimal untuk metabolisme",
        icon: "💧"
        },
    ];

    const focusItems = [
        {
            title : "Stop Minuman Manis",
            desc : "↓ 40% spike gula", 
            color : "text-[#059669]",
            icon : LogoMinuman,    
        },
        {
            title : "Stop Makanan Manis",
            desc : "↓ 26% spike gula",
            color : "text-[#0072CE]",
            icon : LogoGula, 
        },
        {
            title : "Konsisten Waktu Makan",
            desc : "↑ Ritme insulin",
            color : "text-[#7C3AED]",
            icon : LogoWaktu, 
        },
        {
            title : "Log Makanan Harian",
            desc : "↑Kesadaran pola makan",
            color : "text-[#D97706]",
            icon : LogoMakanan,
        }
    ];

    return (
        <div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
            <div className="flex gap-4 items-start">
                <img src={LogoIlmiah} alt ="Dasar Ilmiah" className="w-10 h-10 object-contain"/>
                <div>
                <h2 className="text-lg font-semibold text-[#7C3AED]">
                    Dasar Ilmiah Fase 2
                </h2>

                <p className="text-[#374151] mt-2 text-sm">
                    Di fase ini, tubuh sudah memiliki fondasi. 
                    Kita tingkatkan intensitas untuk memaksimalkan GLUT4 (transporter glukosa) di otot rangka. 
                    Latihan kekuatan 2x/minggu meningkatkan penyerapan glukosa otot hingga 35% (JCEM, 2022).
                </p>
                </div>
            </div>
            </div>

            <section className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-4">Target Harian</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
                {targets.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border p-5"
                >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h4 className="font-medium text-slate-700">{item.title}</h4>
                    <p className="text-xl font-bold mt-2">{item.value}</p>
                    <p className="text-xs text-slate-500 mt-2">{item.desc}</p>
                </div>
                ))}
            </div>
            </section>

            <section>
            <h3 className="font-semibold text-slate-800 mb-4">Fokus Utama</h3>

            <div className="space-y-4 font-bold">
                {focusItems.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl border shadow-sm px-5 py-4 flex justify-between items-center"
                >
                    <div className="flex items-center gap-3">
                        <img src={item.icon} alt={item.title} className="w-8 h-8 object-contain"/>

                        <div>
                            <p className="text-sm font-bold text-black"> {item.title} </p>
                            <span className={`text-xs ${item.color}`}> {item.desc} </span>
                        </div>
                    </div>                   
                </div>
                ))}
            </div>
            </section>

            <div className="flex justify-end mt-4 mb-4">
                <button onClick={() => navigate("/rencana")}
                    className="bg-gradient-to-r from-[#4C1D95] to-[#A78BFA] text-white px-14 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition">
                        🚀 Mulai Program
                </button>
            </div>
        </div>
    );
}