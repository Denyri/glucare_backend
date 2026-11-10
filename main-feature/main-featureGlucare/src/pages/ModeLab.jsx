import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import { predictClinical } from "../services/glucareAI";
import ClinicalBadge from "../components/ui/ClinicalBadge";
import { useAuth } from "../context/AuthContext";

// ── Modern Input Field ──────────────────────────────────────────
const InputField = ({ name, label, unit, hint, placeholder, form, errors, handleChange }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            {label}
        </label>
        <div className="relative">
            <input
                type="text"
                name={name}
                placeholder={placeholder || "0"}
                value={form[name]}
                onChange={handleChange}
                className={`w-full bg-slate-50/70 border rounded-xl px-4 py-3 pr-16 text-sm font-mono outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
                    errors[name]
                        ? "border-rose-300 bg-rose-50/50 focus:ring-rose-500/10 focus:border-rose-500"
                        : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-500/10"
                }`}
            />
            <span className="absolute right-3 top-3 text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {unit}
            </span>
        </div>
        {errors[name] && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <span>⚠️</span> {errors[name]}
            </p>
        )}
        {hint && !errors[name] && (
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{hint}</p>
        )}
    </div>
);

// ── Section Card Container ─────────────────────────────────────
const SectionCard = ({ emoji, title, description, children }) => (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/40">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-xl p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">{emoji}</span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pl-12">{description}</p>
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

// ── Live Calculation Badge ─────────────────────────────────────
const LiveBadge = ({ label, value, isWarning }) => (
    <div className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium border ${
        isWarning ? "bg-amber-50/80 border-amber-200 text-amber-900" : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
    }`}>
        <span className="font-semibold">{label}</span>
        <div className="flex items-center gap-2">
            <span className="font-mono font-bold">{value}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isWarning ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
                {isWarning ? "Perhatian" : "Optimal"}
            </span>
        </div>
    </div>
);

export default function ModeLab() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Derive user profile from AuthContext (no localStorage needed)
    const userProfile = (() => {
        if (!user?.birth_date) return { usia: null, gender: user?.gender || "-" };
        const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();
        return { usia: age, gender: user.gender || "-" };
    })();

    const [form, setForm] = useState({
        gula: "",
        berat: "",
        tinggi: "",
        lingkarPinggang: "",
        hdl: "",
        trigliserida: "",
        sistolik: "",
        diastolik: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) || value === "") {
            setForm({ ...form, [e.target.name]: value });
            if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.gula) newErrors.gula = "Glukosa puasa wajib diisi";
        if (!form.berat) newErrors.berat = "Berat badan wajib diisi";
        if (!form.tinggi) newErrors.tinggi = "Tinggi badan wajib diisi";
        if (!form.lingkarPinggang) newErrors.lingkarPinggang = "Lingkar pinggang wajib diisi";
        if (!form.hdl) newErrors.hdl = "Kadar HDL wajib diisi";
        if (!form.trigliserida) newErrors.trigliserida = "Kadar Trigliserida wajib diisi";
        if (!form.sistolik) newErrors.sistolik = "Tekanan sistolik wajib diisi";
        if (!form.diastolik) newErrors.diastolik = "Tekanan diastolik wajib diisi";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const result = await predictClinical({
                user_id: user?.id,
                gula_darah_puasa: form.gula,
                berat_badan: form.berat,
                tinggi_badan: form.tinggi,
                lingkar_pinggang: form.lingkarPinggang,
                hdl: form.hdl,
                trigliserida: form.trigliserida,
                tekanan_sistolik: form.sistolik,
                tekanan_diastolik: form.diastolik,
                hba1c: 0,
                riwayat_keluarga: "",
                riwayat_diabetes: "",
            });

            if (user?.id) {
                localStorage.setItem(`aiAnalysisResult_${user.id}`, JSON.stringify(result));
                localStorage.setItem(`aiAnalysisResult_clinical_${user.id}`, JSON.stringify(result));
            }
            navigate("/hasil", { state: { result, mode: "clinical" } });
        } catch (error) {
            console.error("Gagal saat memproses prediksi:", error);
            alert("Gagal melakukan analisis. Pastikan layanan AI sedang aktif.");
        } finally {
            setIsLoading(false);
        }
    };

    // Progress metric
    const totalFields = 8;
    const filledFields = [
        form.gula, form.berat, form.tinggi, form.lingkarPinggang,
        form.hdl, form.trigliserida, form.sistolik, form.diastolik,
    ].filter((v) => v !== "").length;
    const progress = Math.round((filledFields / totalFields) * 100);

    // Live Derived Biomarkers
    const bmiValue = (() => {
        const bb = parseFloat(form.berat) || 0;
        const tbM = (parseFloat(form.tinggi) || 0) / 100;
        if (bb > 0 && tbM > 0) return (bb / (tbM * tbM)).toFixed(1);
        return null;
    })();

    const bmiCategory = (() => {
        if (!bmiValue) return null;
        const v = parseFloat(bmiValue);
        if (v < 18.5) return { label: "Underweight", warn: true };
        if (v < 23) return { label: "Normal (Optimal)", warn: false };
        if (v < 27.5) return { label: "Overweight", warn: true };
        return { label: "Obesitas", warn: true };
    })();

    const mapValue = (() => {
        const s = parseFloat(form.sistolik) || 0;
        const d = parseFloat(form.diastolik) || 0;
        if (s > 0 && d > 0) return ((s + 2 * d) / 3).toFixed(1);
        return null;
    })();

    const tgHdlValue = (() => {
        const tg = parseFloat(form.trigliserida) || 0;
        const hdl = parseFloat(form.hdl) || 0;
        if (tg > 0 && hdl > 0) return (tg / hdl).toFixed(2);
        return null;
    })();

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Mode Laboratorium"
                    subtitle="Masukkan biomarker darah & biometrik fisik untuk analisis AI mendalam"
                />

                <div className="px-4 sm:px-8 max-w-4xl mx-auto w-full mt-6 pb-16 space-y-6">
                    
                    {/* User Profile Bar */}
                    <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 rounded-2xl px-5 py-3 text-xs text-blue-900">
                        <div className="flex items-center gap-2">
                            <ClinicalBadge variant="clinical">Profil Terhubung</ClinicalBadge>
                            <span>
                                {userProfile.usia != null ? `${userProfile.usia} tahun` : "Usia terdaftar"} • {userProfile.gender || "Gender"}
                            </span>
                        </div>
                        <span className="text-[11px] text-blue-600 font-semibold hidden sm:inline">
                            Kohort NHANES 2021–2023
                        </span>
                    </div>

                    {/* Completion Progress Bar */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">Kelengkapan Data Laboratorium</span>
                            <span className={progress === 100 ? "text-emerald-600 font-bold" : "text-blue-600 font-bold"}>
                                {filledFields} dari {totalFields} Parameter ({progress}%)
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-sky-400"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Section 1: Gula Darah Puasa */}
                    <SectionCard
                        emoji="🩸"
                        title="Glukosa Darah Puasa (FPG)"
                        description="Kadar gula darah setelah berpuasa minimal 8–10 jam semalam (Standar ADA)."
                    >
                        <InputField
                            form={form}
                            errors={errors}
                            handleChange={handleChange}
                            name="gula"
                            label="Glukosa Darah Puasa"
                            unit="mg/dL"
                            placeholder="Contoh: 98"
                            hint="Standar ADA: Normal <100 mg/dL • Prediabetes 100–125 mg/dL • Diabetes ≥126 mg/dL"
                        />
                    </SectionCard>

                    {/* Section 2: Data Tubuh & Antropometri */}
                    <SectionCard
                        emoji="📏"
                        title="Antropometri & Indeks Massa Tubuh"
                        description="Data fisik untuk menghitung BMI dan distribusi adipositas visceral."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                form={form}
                                errors={errors}
                                handleChange={handleChange}
                                name="berat"
                                label="Berat Badan"
                                unit="kg"
                                placeholder="Contoh: 68"
                            />
                            <InputField
                                form={form}
                                errors={errors}
                                handleChange={handleChange}
                                name="tinggi"
                                label="Tinggi Badan"
                                unit="cm"
                                placeholder="Contoh: 170"
                            />
                        </div>

                        {bmiValue && bmiCategory && (
                            <LiveBadge
                                label={`Indeks Massa Tubuh (BMI): ${bmiValue}`}
                                value={bmiCategory.label}
                                isWarning={bmiCategory.warn}
                            />
                        )}

                        <InputField
                            form={form}
                            errors={errors}
                            handleChange={handleChange}
                            name="lingkarPinggang"
                            label="Lingkar Pinggang"
                            unit="cm"
                            placeholder="Contoh: 82"
                            hint="Batas aman metabolik Asia: Pria ≤90 cm • Wanita ≤80 cm"
                        />
                    </SectionCard>

                    {/* Section 3: Profil Lipid */}
                    <SectionCard
                        emoji="🧪"
                        title="Profil Lipid (Trigliserida & Kolesterol HDL)"
                        description="Rasio Trigliserida terhadap HDL merupakan penanda klinis kuat resistensi insulin."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                form={form}
                                errors={errors}
                                handleChange={handleChange}
                                name="hdl"
                                label="Kolesterol HDL (Baik)"
                                unit="mg/dL"
                                placeholder="Contoh: 50"
                                hint="Target protektif: Pria >40 mg/dL • Wanita >50 mg/dL"
                            />
                            <InputField
                                form={form}
                                errors={errors}
                                handleChange={handleChange}
                                name="trigliserida"
                                label="Trigliserida"
                                unit="mg/dL"
                                placeholder="Contoh: 120"
                                hint="Target normal: <150 mg/dL"
                            />
                        </div>

                        {tgHdlValue && (
                            <LiveBadge
                                label={`Rasio Trigliserida / HDL: ${tgHdlValue}`}
                                value={parseFloat(tgHdlValue) > 3.0 ? "Resistensi Insulin Tinggi" : "Sensitivitas Baik"}
                                isWarning={parseFloat(tgHdlValue) > 3.0}
                            />
                        )}
                    </SectionCard>

                    {/* Section 4: Tekanan Darah */}
                    <SectionCard
                        emoji="💓"
                        title="Tekanan Darah & Vaskular"
                        description="Mean Arterial Pressure (MAP) mencerminkan perfusi jaringan organ dan beban arterial."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                form={form}
                                errors={errors}
                                handleChange={handleChange}
                                name="sistolik"
                                label="Tekanan Sistolik"
                                unit="mmHg"
                                placeholder="Contoh: 120"
                            />
                            <InputField
                                form={form}
                                errors={errors}
                                handleChange={handleChange}
                                name="diastolik"
                                label="Tekanan Diastolik"
                                unit="mmHg"
                                placeholder="Contoh: 80"
                            />
                        </div>

                        {mapValue && (
                            <LiveBadge
                                label={`Mean Arterial Pressure (MAP): ${mapValue} mmHg`}
                                value={parseFloat(mapValue) > 100 ? "Tekanan Tinggi" : "Optimal (70–100)"}
                                isWarning={parseFloat(mapValue) > 100 || parseFloat(mapValue) < 70}
                            />
                        )}
                    </SectionCard>

                    {/* Submit Bar */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card">
                        <div className="text-xs text-slate-500 text-center sm:text-left">
                            <strong className="text-slate-800">Model Komputasi:</strong> Data Anda diproses oleh model NHANES Gradient Boosting secara lokal dan aman.
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-100 disabled:opacity-50 shrink-0"
                        >
                            {isLoading ? "Memproses Model AI..." : "Jalankan Analisis AI →"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}