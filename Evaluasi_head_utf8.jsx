import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import HeaderEvaluasiPencapaian from "../components/HeaderEvaluasiPencapaian";
import StatsCard from "../components/StatsCard";
import PerbandinganRisiko from "../components/PerbandinganRisiko";
import MetrikMetabolik from "../components/MetrikMetabolik";
import FaktorRisiko from "../components/FaktorRisiko";
import Button from "../components/Button";
import { useSidebar } from "../hooks/useSidebar";
import { useNavigate } from "react-router-dom";

export default function Evaluasi() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();

    // AI Prediction States
    const [scenario, setScenario] = useState("healthy"); // "healthy" or "sedentary"
    const [simulatedData, setSimulatedData] = useState(() => generateSimulatedData("healthy"));
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showLogs, setShowLogs] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Helper to generate mock data matching the API spec
    function generateSimulatedData(type) {
        const records = [];
        const baseline = 125;
        for (let i = 0; i < 30; i++) {
            if (type === "healthy") {
                // Glucose decreases, high steps, good sleep, low carbs, increasing streak
                const glucose_mean = Math.round((125 - i * 0.9 - Math.random() * 2) * 10) / 10;
                const steps = Math.round(7500 + i * 85 + Math.random() * 400);
                const sleep_hours = Math.round((7.2 + (i % 2 === 0 ? 0.5 : -0.2) + Math.random() * 0.4) * 10) / 10;
                const carbs_g = Math.round(160 - i * 1.6 - Math.random() * 8);
                records.push({
                    day_idx: i,
                    glucose_mean: Math.max(85, glucose_mean),
                    steps: Math.min(15000, steps),
                    sleep_hours: Math.min(10, Math.max(4, sleep_hours)),
                    carbs_g: Math.max(50, carbs_g),
                    target_sleep_met: sleep_hours >= 7.0 ? 1.0 : 0.0,
                    target_steps_met: steps >= 8000 ? 1.0 : 0.0,
                    streak: i + 1,
                    baseline_glucose: baseline
                });
            } else {
                // Glucose stays high, low steps, bad sleep, high carbs, low streak
                const glucose_mean = Math.round((125 + i * 0.4 + Math.random() * 4) * 10) / 10;
                const steps = Math.round(2500 + (i % 5 === 0 ? 1500 : 0) + Math.random() * 200);
                const sleep_hours = Math.round((5.5 - (i % 2 === 0 ? 0.7 : -0.3) + Math.random() * 0.3) * 10) / 10;
                const carbs_g = Math.round(230 + i * 0.9 + Math.random() * 12);
                records.push({
                    day_idx: i,
                    glucose_mean: Math.min(170, glucose_mean),
                    steps: Math.max(1000, steps),
                    sleep_hours: Math.min(10, Math.max(3, sleep_hours)),
                    carbs_g: Math.min(400, carbs_g),
                    target_sleep_met: sleep_hours >= 7.0 ? 1.0 : 0.0,
                    target_steps_met: steps >= 8000 ? 1.0 : 0.0,
                    streak: Math.max(0, Math.round(i / 10)),
                    baseline_glucose: baseline
                });
            }
        }
        return records;
    }

    const handleScenarioChange = (type) => {
        setScenario(type);
        setSimulatedData(generateSimulatedData(type));
        setPrediction(null);
        setError("");
    };

    const handleRunPrediction = async () => {
        setLoading(true);
        setError("");
        setPrediction(null);
        try {
            const currentUser = JSON.parse(
                localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser") || "{}"
            );
            
            const response = await axios.post("http://localhost:5000/api/monitoring/predict", {
                patient_id: currentUser?.fullname || "Pasien Glucare",
                records: simulatedData
            });

            setPrediction(response.data);
        } catch (err) {
            console.error("Gagal mendapatkan prediksi AI:", err);
            setError(err.response?.data?.message || err.message || "Gagal menghubungi API AI.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                <HeaderEvaluasiPencapaian
                    title="Evaluasi"
                    subtitle="Pantau intervensi metabolik harianmu"
                />
                
                <div className="px-6 lg:px-8 py-6 space-y-6">
                    <StatsCard 
                        fromColor="from-[#0A0A0A]" 
                        toColor="to-[#8864D2]" />

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <PerbandinganRisiko 
                            before={{ value: 96, label: "Tinggi", date:"2026-04-11"}}
                            after={{value: 93, label:"Tinggi", date:"2026-04-17"}}
                            improvementText="Skor turun 3 poin - ada perbaikan!"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MetrikMetabolik />
                        <FaktorRisiko />
                    </div>

                    {/* AI Predictor Playground Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 mt-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm">­ƒºá</span> 
                                    Deteksi Dini AI 90-Hari (XGBoost Model)
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Analisis prognosis hari ke-90 menggunakan data log pemantauan 30 hari pertama.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleScenarioChange("healthy")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                        scenario === "healthy"
                                            ? "bg-emerald-500 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    ­ƒƒó Gaya Hidup Sehat (Membaik)
                                </button>
                                <button
                                    onClick={() => handleScenarioChange("sedentary")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                        scenario === "sedentary"
                                            ? "bg-amber-500 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    ­ƒƒí Sedentary (Memburuk/Stagnan)
                                </button>
                            </div>
                        </div>

                        {/* Logs summary preview */}
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Sampel Log Pemantauan 30 Hari
                                </h3>
                                <button
                                    onClick={() => setShowLogs(!showLogs)}
                                    className="text-xs text-[#0072CE] font-semibold hover:underline"
                                >
                                    {showLogs ? "Sembunyikan Rincian" : "Tampilkan Rincian Log (30 Hari)"}
                                </button>
                            </div>

                            {/* Brief summary metrics of simulated data */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 block">Rata-rata Gula Darah</span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {(simulatedData.reduce((acc, r) => acc + r.glucose_mean, 0) / 30).toFixed(1)} mg/dL
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 block">Rata-rata Langkah</span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {Math.round(simulatedData.reduce((acc, r) => acc + r.steps, 0) / 30).toLocaleString()} / hari
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 block">Rata-rata Jam Tidur</span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {(simulatedData.reduce((acc, r) => acc + r.sleep_hours, 0) / 30).toFixed(1)} jam
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 block">Total Target Terpenuhi</span>
                                    <span className="text-sm font-semibold text-gray-700 text-[#0072CE]">
                                        {simulatedData.filter(r => r.target_steps_met === 1.0 && r.target_sleep_met === 1.0).length} / 30 Hari
                                    </span>
                                </div>
                            </div>

                            {showLogs && (
                                <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-inner transition-all duration-300">
                                    <table className="min-w-full text-xs text-left text-gray-500">
                                        <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2">Hari</th>
                                                <th className="px-4 py-2">Rerata Gula (mg/dL)</th>
                                                <th className="px-4 py-2">Langkah</th>
                                                <th className="px-4 py-2">Tidur (Jam)</th>
                                                <th className="px-4 py-2">Karbohidrat (g)</th>
                                                <th className="px-4 py-2">Streak Harian</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {simulatedData.map((row) => (
                                                <tr key={row.day_idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium text-gray-900">Hari ke-{row.day_idx + 1}</td>
                                                    <td className="px-4 py-2">{row.glucose_mean}</td>
                                                    <td className="px-4 py-2">{row.steps.toLocaleString()}</td>
                                                    <td className="px-4 py-2">{row.sleep_hours}</td>
                                                    <td className="px-4 py-2">{row.carbs_g}g</td>
                                                    <td className="px-4 py-2">­ƒöÑ {row.streak}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* CTA button to run prediction */}
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={handleRunPrediction}
                                disabled={loading}
                                className={`px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 flex items-center gap-3 ${
                                    loading
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#0072CE] to-[#8864D2] hover:scale-[1.02] active:scale-95 cursor-pointer"
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Menganalisis data log 30 hari...
                                    </>
                                ) : (
                                    <>
                                        <span>­ƒº¼ Jalankan Evaluasi Prediktif AI</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                                <span>ÔÜá´©Å</span>
                                <span><strong>Error:</strong> {error}</span>
                            </div>
                        )}

                        {/* Prediction Results Render */}
                        {prediction && (
                            <div className="space-y-6 pt-4 border-t border-gray-100 animate-fadeIn">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Hasil Analisis Prediksi AI (Hari ke-90)
                                </div>

                                <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6 shadow-sm transition-all duration-300 ${
                                    prediction.early_warning_risk === "LOW_RISK_DAY90" || prediction.predicted_status === "Membaik"
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                        : "bg-amber-50 border-amber-200 text-amber-900"
                                }`}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm bg-white shrink-0">
                                        {prediction.early_warning_risk === "LOW_RISK_DAY90" || prediction.predicted_status === "Membaik" ? "Ô£à" : "ÔÜá´©Å"}
                                    </div>
                                    <div className="space-y-1 text-center md:text-left flex-1">
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                                            <h4 className="text-lg font-bold">
                                                Prognosis: {prediction.predicted_status}
                                            </h4>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                prediction.early_warning_risk === "LOW_RISK_DAY90"
                                                    ? "bg-emerald-200 text-emerald-800"
                                                    : "bg-amber-200 text-amber-800"
                                            }`}>
                                                {prediction.early_warning_risk === "LOW_RISK_DAY90" ? "Risiko Rendah (Lolos)" : "Risiko Tinggi (Waspada)"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {prediction.early_warning_risk === "LOW_RISK_DAY90"
                                                ? "Luar biasa! AI memproyeksikan kondisi metabolik Anda membaik pada hari ke-90. Pertahankan pola makan seimbang, konsistensi aktivitas fisik, dan kualitas tidur Anda."
                                                : "Peringatan Dini! AI memproyeksikan kondisi Anda stagnan atau memburuk pada hari ke-90. Diperlukan penyesuaian segera pada konsumsi karbohidrat, peningkatan frekuensi langkah harian, dan jam tidur."}
                                        </p>
                                        <div className="text-[10px] text-gray-400 pt-1">
                                            Dianalisis menggunakan Model ML <strong>{prediction.model_name}</strong> pada Hari ke-{prediction.prediction_day}.
                                        </div>
                                    </div>
                                </div>

                                {/* Probabilities Bar */}
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                                    <h4 className="text-xs font-bold text-gray-600">DISTRIBUSI PROBABILITAS KEMAJUAN</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-emerald-700">Kondisi Membaik</span>
                                                <span className="text-emerald-700">{(prediction.probability_membaik * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                                                    style={{ width: `${prediction.probability_membaik * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-amber-700">Kondisi Memburuk / Stagnan</span>
                                                <span className="text-amber-700">{(prediction.probability_memburuk_stagnan * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                                                    style={{ width: `${prediction.probability_memburuk_stagnan * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Features breakdown Accordion */}
                                <div>
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition flex justify-between items-center"
                                    >
                                        <span>­ƒøá´©Å LIHAT METRIK FITUR LANJUTAN MODEL</span>
                                        <span>{showAdvanced ? "Ôû▓" : "Ôû╝"}</span>
                                    </button>

                                    {showAdvanced && prediction.features_used && (
                                        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                            <div className="space-y-2 border-r border-gray-100 pr-3">
                                                <div className="font-bold text-blue-600 border-b border-blue-50 pb-1">Statistik Gula (Bulan 1)</div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Baseline Gula:</span>
                                                    <span className="font-semibold text-gray-700">{prediction.features_used.baseline_glucose} mg/dL</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Rerata Gula M1:</span>
                                                    <span className="font-semibold text-gray-700">{prediction.features_used.glucose_month1_mean.toFixed(1)} mg/dL</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Deviasi Gula:</span>
                                                    <span className="font-semibold text-gray-700">┬▒ {prediction.features_used.glucose_month1_std.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Kemiringan (Slope) Tren:</span>
                                                    <span className={`font-semibold ${prediction.features_used.glucose_slope_month1 < 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                                        {prediction.features_used.glucose_slope_month1.toFixed(3)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 border-r border-gray-100 pr-3">
                                                <div className="font-bold text-blue-600 border-b border-blue-50 pb-1">Aktivitas & Kepatuhan</div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Rerata Langkah M1:</span>
                                                    <span className="font-semibold text-gray-700">{Math.round(prediction.features_used.steps_month1_mean).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Kepatuhan Langkah:</span>
                                                    <span className="font-semibold text-gray-700">{(prediction.features_used.steps_adherence_m1 * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Kepatuhan Tidur:</span>
                                                    <span className="font-semibold text-gray-700">{(prediction.features_used.sleep_adherence_m1 * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Streak Terpanjang:</span>
                                                    <span className="font-semibold text-orange-600">­ƒöÑ {prediction.features_used.max_streak_m1} Hari</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="font-bold text-blue-600 border-b border-blue-50 pb-1">Koefisien Korelasi Gula</div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Korelasi Langkah & Gula:</span>
                                                    <span className={`font-semibold ${prediction.features_used.corr_steps_glucose_m1 < 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                                        {prediction.features_used.corr_steps_glucose_m1?.toFixed(3) || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Korelasi Tidur & Gula:</span>
                                                    <span className={`font-semibold ${prediction.features_used.corr_sleep_glucose_m1 < 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                                        {prediction.features_used.corr_sleep_glucose_m1?.toFixed(3) || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Korelasi Karbo & Gula:</span>
                                                    <span className={`font-semibold ${prediction.features_used.corr_carbs_glucose_m1 > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                                                        {prediction.features_used.corr_carbs_glucose_m1?.toFixed(3) || "N/A"}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-gray-400 leading-normal pt-1 border-t border-gray-50 mt-1">
                                                    *Nilai korelasi negatif (-) menunjukkan bahwa peningkatan aktivitas/tidur berhasil menurunkan gula darah.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end mt-4 mb-4 pt-4">
                        <Button variant="primary"  
                            onClick={() => navigate("/analisis")}>
                            Ôƒ│  Lakukan Re-Assessment
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
