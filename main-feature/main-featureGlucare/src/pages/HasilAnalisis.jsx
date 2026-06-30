import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import Button from "../components/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import { useState, useEffect } from "react";
import api from "../services/api";

const HasilAnalisis = () => {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const location = useLocation();

    const result = location.state?.result;
    const input = location.state?.input;
    const mode = location.state?.mode || "lab";

    const [data, setData] = useState({
        score: 0,
        risk: "Memuat...",
        status: "Sedang memproses...",
        faktor: ["Menunggu data dari AI..."],
        parameters: [],
        cta: "",
        riskLevel: "Diabetes",
        mode: "clinical"
    });

    useEffect(() => {
        let user = null;
        try {
            const rawUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
            if (rawUser && rawUser !== "undefined") {
                user = JSON.parse(rawUser);
            }
        } catch (e) { console.error(e); }

        if (!user || !user.id) return;

        const loadAiData = async () => {
            let parsed = null;

            // Coba dari API dulu (Paling update)
            try {
                const res = await api.get(`/api/ai/result/${user.id}`);
                parsed = res.data;
            } catch (err) {
                console.log("Gagal ambil dari API, mencoba localStorage", err.message);
                const rawAiData = localStorage.getItem(`aiAnalysisResult_${user.id}`);
                if (rawAiData) {
                    try {
                        parsed = JSON.parse(rawAiData);
                    } catch(e){}
                }
            }

            if (parsed) {
                const aiRes = parsed.aiResult;
                const mode = parsed.mode;
                
                if (aiRes) {
                    if (mode === "questionnaire") {
                        const input = parsed.answers || {};
                        const aiRiskLevel = aiRes.risk_level || "low";
                        let risk = "Risiko Rendah";
                        let status = "Normal / Aman";
                        let score = 25; 
                        
                        if (aiRiskLevel === "medium" || aiRiskLevel === "Prediabetes") {
                            risk = "Risiko Sedang";
                            status = "Indikasi Prediabetes";
                            score = 55;
                        } else if (aiRiskLevel === "high" || aiRiskLevel === "Diabetes") {
                            risk = "Risiko Tinggi";
                            status = "Indikasi Diabetes";
                            score = 85;
                        }
                        
                        const faktorList = [];
                        if (input.bmi_category === 1) faktorList.push("BMI dalam kategori Overweight");
                        if (input.bmi_category === 2) faktorList.push("BMI dalam kategori Obesitas");
                        if (input.waist_category === 1) faktorList.push("Lingkar pinggang berisiko");
                        if (input.hypertension === 1) faktorList.push("Memiliki riwayat hipertensi");
                        if (input.overweight_history === 1) faktorList.push("Pernah memiliki riwayat kelebihan berat badan");
                        
                        if (faktorList.length === 0) faktorList.push("Gaya hidup relatif sehat dan tidak ada risiko signifikan dari kuesioner");

                        setData({
                            score, risk, status,
                            faktor: faktorList,
                            parameters: [],
                            cta: aiRes.cta || "Jaga pola makan dan aktivitas fisik dengan konsisten.",
                            riskLevel: aiRiskLevel === "low" ? "Normal" : (aiRiskLevel === "medium" ? "Prediabetes" : "Diabetes"),
                            mode: "questionnaire"
                        });
                        return;
                    }

                    // CLINICAL
                    const input = parsed.clinicalParams || {};
                    const proba = aiRes.predict_proba || [0, 0, 0];
                    const pDiabetes = Math.round((proba[1] + proba[2]) * 100);
                    const aiRiskLevel = aiRes.risk_level || "Diabetes";

                    let risk, status;
                    if (aiRiskLevel === "Normal" || aiRiskLevel === "low") {
                        risk = "Risiko Rendah";
                        status = "Normal / Aman";
                    } else if (aiRiskLevel === "Prediabetes" || aiRiskLevel === "medium") {
                        risk = "Risiko Sedang";
                        status = "Indikasi Prediabetes";
                    } else {
                        risk = "Risiko Tinggi";
                        status = "Indikasi Diabetes";
                    }

                    const score = pDiabetes;
                    const gdpVal = input.glucose_fasting || 0;
                    
                    let gdpStr = "Normal";
                    if (gdpVal >= 126) gdpStr = "Diabetes";
                    else if (gdpVal >= 100) gdpStr = "Prediabetes";

                    const bmiVal = input.bmi || 0;
                    let bmiStr = "Normal";
                    if (bmiVal < 18.5) bmiStr = "Berat badan kurang";
                    else if (bmiVal >= 27.5) bmiStr = "Obesitas";
                    else if (bmiVal >= 23) bmiStr = "Overweight";

                    const faktorList = [];
                    if (gdpVal >= 126) faktorList.push(`Gula Darah Puasa (${gdpVal} mg/dL) mengindikasikan level Diabetes.`);
                    else if (gdpVal >= 100) faktorList.push(`Gula Darah Puasa (${gdpVal} mg/dL) berada di zona Prediabetes.`);

                    if (bmiVal >= 27.5) faktorList.push(`Kategori BMI Obesitas (${bmiVal}) meningkatkan risiko metabolik secara signifikan.`);
                    else if (bmiVal >= 23) faktorList.push(`Kategori BMI Overweight (${bmiVal}) memicu risiko metabolik.`);

                    const tgHdl = input.tg_hdl_ratio || 0;
                    if (tgHdl >= 3) faktorList.push(`Rasio TG/HDL tinggi (${tgHdl}) mengindikasikan kemungkinan resistensi insulin.`);

                    if (input.bp_systolic >= 130 || input.bp_diastolic >= 85) faktorList.push(`Tekanan darah (${input.bp_systolic}/${input.bp_diastolic} mmHg) berada di atas rentang optimal.`);

                    if (input.waist_cm > 90 && input.gender === 1) faktorList.push(`Lingkar pinggang (${input.waist_cm} cm) berisiko untuk laki-laki.`);
                    else if (input.waist_cm > 80 && input.gender === 0) faktorList.push(`Lingkar pinggang (${input.waist_cm} cm) berisiko untuk perempuan.`);

                    if (faktorList.length === 0) faktorList.push("Tidak ada parameter klinis spesifik yang memicu risiko tinggi.");

                    const parameters = [
                        { label: "Usia", value: `${input.age} tahun` },
                        { label: "BMI", value: `${bmiVal} (${bmiStr})` },
                        { label: "Gula Darah Puasa", value: `${gdpVal} mg/dL (${gdpStr})` },
                        { label: "Tekanan Darah", value: `${input.bp_systolic || 0}/${input.bp_diastolic || 0} mmHg` },
                        { label: "HDL", value: `${input.hdl || 0} mg/dL` },
                        { label: "Trigliserida", value: `${input.triglycerides || 0} mg/dL` },
                        { label: "Rasio TG/HDL", value: `${tgHdl}` },
                        { label: "Lingkar Pinggang", value: `${input.waist_cm || 0} cm` }
                    ];

                    setData({
                        score, risk, status,
                        faktor: faktorList,
                        parameters: parameters,
                        cta: aiRes.cta || "Jaga pola makan dan aktivitas fisik dengan konsisten.",
                        riskLevel: (aiRiskLevel === "low" || aiRiskLevel === "Normal") ? "Normal" : 
                                   ((aiRiskLevel === "medium" || aiRiskLevel === "Prediabetes") ? "Prediabetes" : "Diabetes"),
                        mode: "clinical"
                    });
                }
            }
        };

        loadAiData();
    }, []);

    const isNormal = data.riskLevel === "Normal";
    const isPrediabetes = data.riskLevel === "Prediabetes";
    
    const borderColor = isNormal ? "border-green-300" : isPrediabetes ? "border-orange-300" : "border-red-300";
    const textColor = isNormal ? "text-green-700" : isPrediabetes ? "text-orange-700" : "text-red-700";
    const bgHeader = isNormal ? "bg-green-100" : isPrediabetes ? "bg-orange-100" : "bg-red-100";
    const iconStr = isNormal ? "health_and_safety" : isPrediabetes ? "warning" : "emergency";

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                    <HeaderAnalisis
                        title="Hasil Analisis"
                        subtitle="Evaluasi risiko prediabetes Anda"
                    />

                    <main className="p-4 sm:p-6 max-w-4xl mx-auto w-full mt-4">
                        
                        <div className={`bg-white rounded-2xl border ${borderColor} overflow-hidden shadow-sm mb-6`}>
                            {/* Skor Risiko */}
                            <div className={`p-6 ${bgHeader} text-center flex flex-col items-center border-b ${borderColor}`}>
                                <span className={`material-symbols-outlined text-6xl mb-2 ${textColor}`}>
                                    {iconStr}
                                </span>
                                <h2 className={`text-xl font-bold ${textColor}`}>Skor Risiko Prediabetes</h2>
                                <h1 className={`text-5xl font-black mt-2 mb-1 ${textColor}`}>{data.score}%</h1>
                                <p className={`text-sm font-semibold ${textColor}`}>Kategori: {data.risk}</p>
                            </div>

                            {/* Parameter Klinis (Hanya mode Lab) */}
                            {data.mode === "clinical" && data.parameters.length > 0 && (
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">vital_signs</span>
                                        Parameter Klinis
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                        {data.parameters.map((param, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-gray-50">
                                                <span className="text-gray-500">{param.label}:</span>
                                                <span className="font-semibold text-gray-800">{param.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Faktor Risiko */}
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500">analytics</span>
                                    Faktor Risiko Teridentifikasi
                                </h3>
                                <ul className="space-y-3">
                                    {data.faktor.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className={`material-symbols-outlined text-base mt-0.5 ${textColor}`}>
                                                arrow_right_alt
                                            </span>
                                            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {mode === "lab" && (
                                <div className="bg-blue-50 p-4 rounded-xl shadow">
                                    <h3 className="font-semibold mb-2">
                                        Interpetasi Lab
                                    </h3>
                                </div>
                            )}

                            {/* Kesimpulan AI */}
                            <div className="p-6 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">medical_information</span>
                                    Kesimpulan
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-200">
                                    {data.cta}
                                </p>
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <Button variant="primary" onClick={() => navigate("/rencana")}>
                                Mulai Rencana 90 Hari
                            </Button>
                            <Button variant="secondary" onClick={() => navigate("/analisis")}>
                                Cek Ulang Risiko
                            </Button>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default HasilAnalisis;