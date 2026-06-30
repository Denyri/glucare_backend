import LogoTarget from "../assets/FaseIntervensi/TargetAkhir.png"
import LogoRisk from "../assets/how-it0works/Risk-Analisis.png"
import LogoHbA1c from "../assets/FaseIntervensi/Darah.png"
import LogoLifestyle from "../assets/how-it0works/Improve-Lifestyle.png"
import { useNavigate } from "react-router-dom"

export default function StabilisasiTargetAkhir() {
    const navigate = useNavigate();

    const target = [
        "Gula darah puasa < 110 mg/dl",
        "Berat turun 1-2 kg",
        "Konsisten olahraga",
        "Tidak ada minuman manis 7 hari berturut turut",
    ];

    const phases = [
        {
            number: 1,
            title: "🌱Stabilisasi Dasar",
            day: "Hari 1-30 · Gula ≤≤ 40g/hari",
            active:true,
        },
        {
            number: 2,
            title: "⚡Optimasi Metabolik",
            day: "Hari 31-60 · Gula ≤≤ 30g/hari",
            active:false,
        },
        {
            number: 3,
            title: "🏆Konsolidasi",
            day: "Hari 61-90 · Gula ≤≤ 25g/hari",
            active:false,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
                <p className="text-xs text-slate-400 mb-3">PENCAPAIAN FASE 1</p>
                <div className="lex items-center gap-2">
                    <img src={LogoTarget} alt="Target" className="w-8 h-8 object-contain"/>
                    <h2 className="text-lg font-semibold text-slate-800">
                        Target Akhir Fase 1
                    </h2>

                    <div className="space-y-3">
                        {target.map((item, index) => (
                            <div key={index} className="bg-slate-50 border rounded-xl px-4 py-3 flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center">
                                    {index + 1}
                                </div>
                                <p className="text-sm text-slate-600">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h3 className="font-semibold text-slate-800 mb-6">
                        Perjalanan 90 Hari
                    </h3>

                    <div className="flex justify-between items-center">
                        {phases.map((phase, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${phase.active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                    {phase.number}
                                </div>

                                <p className="mt-3 text-sm font-medium text-slate-700">
                                    {phase.title}
                                </p>
                                <p className="text-xs text-slate-400">{phase.day}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h3 className="text-[#0072CE] font-semibold mb-3">🛡️ Setelah 90 Hari </h3>

                    <p className="text-sm text-slate-600 mb-5">
                        Penelitian DPP menunjukkan bahwa intervensi gaya hidup terstruktur selama 2-3 bulan dapat 
                        mengurangi risiko progresi prediabetes sebesar 58%.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border p-4 text-center">
                            <img src={LogoRisk} alt="Risk" className="w-18 h-16 mx-auto object-contain"/>
                            <p className="text-sm font-medium mt-2"> ↓ 58% Risiko</p>
                        </div>

                        <div className="bg-white rounded-xl border p-4 text-center">
                            <img src={LogoHbA1c} alt="Risk" className="w-18 h-16 mx-auto object-contain"/>
                            <p className="text-sm font-medium mt-2"> ↓ HbA1c &lt: 5.7%</p>
                        </div>

                        <div className="bg-white rounded-xl border p-4 text-center">
                            <img src={LogoLifestyle} alt="Risk" className="w-18 h-16 mx-auto object-contain"/>
                            <p className="text-sm font-medium mt-2"> ↑ Kualitas Hidup</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="px-8 py-3 border border-[#7C3AED] text-[#7C3AED] rounded-xl text-sm font-medium hover:bg-purple-50 transition"
                        onClick={() => navigate("/optimasi")}>
                        Lihat Fase 2: Optimasi Metabolik →
                    </button>
                </div>
            </div>
    )
}