import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import { predictClinical } from "../services/glucareAI";

// ── Input Field ────────────────────────────────────────────────
const InputField = ({ name, label, unit, hint, placeholder, form, errors, handleChange }) => (
    <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="relative">
            <input
                type="text"
                name={name}
                placeholder={placeholder || "0"}
                value={form[name]}
                onChange={handleChange}
                className={`w-full bg-white border rounded-lg px-4 py-2.5 pr-16 text-sm outline-none
                    transition-all duration-200
                    focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/10
                    ${errors[name] ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
            />
            <span className="absolute right-3 top-2.5 text-[#0072CE] text-xs font-bold bg-blue-50 px-2 py-0.5 rounded">
                {unit}
            </span>
        </div>
        {errors[name] && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                {errors[name]}
            </p>
        )}
        {hint && !errors[name] && (
            <p className="text-xs text-gray-400 leading-relaxed">{hint}</p>
        )}
    </div>
);

// ── Section Card ───────────────────────────────────────────────
const SectionCard = ({ emoji, title, description, accentColor, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">{emoji}</span>
                <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pl-9">{description}</p>
        </div>
        <div className="px-5 py-5 space-y-4">
            {children}
        </div>
    </div>
);

// ── Live Preview Badge ─────────────────────────────────────────
const LiveBadge = ({ label, value, isWarning }) => (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm
        ${isWarning ? "bg-amber-50 border border-amber-100" : "bg-green-50 border border-green-100"}`}>
        <span className="text-gray-500">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`font-bold ${isWarning ? "text-amber-600" : "text-green-600"}`}>{value}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${isWarning ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>
                {isWarning ? "Perlu Perhatian" : "Normal"}
            </span>
        </div>
    </div>
);

// ══════════════════════════════════════════════════════════════
export default function ModeLab() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const [isLoading, setIsLoading] = useState(false);
    const [userProfile, setUserProfile] = useState({ usia: null, gender: null });

    useEffect(() => {
        try {
            const rawUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
            if (rawUser && rawUser !== "undefined") {
                const user = JSON.parse(rawUser);
                if (user?.birth_date) {
                    const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();
                    setUserProfile({ usia: age, gender: user.gender || "-" });
                }
            }
        } catch (e) { console.error(e); }
    }, []);

    const [form, setForm] = useState({
        gula: "", berat: "", tinggi: "", lingkarPinggang: "",
        hdl: "", trigliserida: "", sistolik: "", diastolik: "",
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
        if (!form.gula) newErrors.gula = "Wajib diisi";
        if (!form.berat) newErrors.berat = "Wajib diisi";
        if (!form.tinggi) newErrors.tinggi = "Wajib diisi";
        if (!form.lingkarPinggang) newErrors.lingkarPinggang = "Wajib diisi";
        if (!form.hdl) newErrors.hdl = "Wajib diisi";
        if (!form.trigliserida) newErrors.trigliserida = "Wajib diisi";
        if (!form.sistolik) newErrors.sistolik = "Wajib diisi";
        if (!form.diastolik) newErrors.diastolik = "Wajib diisi";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const currentUser = JSON.parse(
                localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
            );
            const result = await predictClinical({
                user_id: currentUser?.id,
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
                riwayat_diabetes: ""
            });
            if (currentUser?.id) {
                localStorage.setItem(`aiAnalysisResult_${currentUser.id}`, JSON.stringify(result));
            }
            navigate("/hasil");
        } catch (error) {
            console.error("Gagal saat memproses prediksi:", error);
            alert("Gagal melakukan analisis. Pastikan layanan AI sedang aktif.");
        } finally {
            setIsLoading(false);
        }
    };

    // Progress
    const totalFields = 8;
    const filledFields = [form.gula, form.berat, form.tinggi, form.lingkarPinggang,
        form.hdl, form.trigliserida, form.sistolik, form.diastolik
    ].filter(v => v !== "").length;
    const progress = Math.round((filledFields / totalFields) * 100);

    // Live BMI
    const bmiValue = (() => {
        const bb = parseFloat(form.berat) || 0;
        const tbM = (parseFloat(form.tinggi) || 0) / 100;
        if (bb > 0 && tbM > 0) return (bb / (tbM * tbM)).toFixed(1);
        return null;
    })();
    const bmiCategory = (() => {
        if (!bmiValue) return null;
        const v = parseFloat(bmiValue);
        if (v < 18.5) return { label: "Berat Badan Kurang", warn: true };
        if (v < 23)   return { label: "Normal", warn: false };
        if (v < 27.5) return { label: "Kelebihan Berat Badan", warn: true };
        return { label: "Obesitas", warn: true };
    })();

    // Live MAP
    const mapValue = (() => {
        const s = parseFloat(form.sistolik) || 0;
        const d = parseFloat(form.diastolik) || 0;
        if (s > 0 && d > 0) return ((s + 2 * d) / 3).toFixed(1);
        return null;
    })();

    // Live TG/HDL
    const tgHdlValue = (() => {
        const tg = parseFloat(form.trigliserida) || 0;
        const hdl = parseFloat(form.hdl) || 0;
        if (tg > 0 && hdl > 0) return (tg / hdl).toFixed(2);
        return null;
    })();

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className={`flex-1 transition-all duration-300 overflow-y-auto ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Mode Lab"
                    subtitle="Masukkan hasil pemeriksaan laboratorium Anda"
                />

                <div className="px-4 sm:px-6 max-w-5xl mx-auto w-full mt-6 pb-10 space-y-4">

                    {/* ── Info Profil ── */}
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                        <span className="material-symbols-outlined text-blue-400 text-base">person</span>
                        <div className="text-xs text-blue-700 leading-relaxed">
                            <span className="font-semibold">Profil Anda: </span>
                            {userProfile.usia != null ? `${userProfile.usia} tahun` : "Usia tidak tersedia"}
                            {" · "}
                            {userProfile.gender || "Jenis kelamin tidak tersedia"}
                            <span className="text-blue-400 ml-1">(diambil otomatis dari akun)</span>
                        </div>
                    </div>

                    {/* ── Progress ── */}
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-500 font-medium">Kelengkapan data</span>
                            <span className={`font-bold ${progress === 100 ? "text-green-600" : "text-[#0072CE]"}`}>
                                {filledFields}/{totalFields} terisi
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                    background: progress === 100
                                        ? "linear-gradient(90deg, #10B981, #34D399)"
                                        : "linear-gradient(90deg, #0072CE, #3E97FF)"
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Section 1: Gula Darah ── */}
                    <SectionCard
                        emoji="🩸"
                        title="Gula Darah Puasa"
                        description="Masukkan hasil pemeriksaan gula darah setelah berpuasa 8–12 jam."
                    >
                        <InputField form={form} errors={errors} handleChange={handleChange}
                            name="gula" label="Gula Darah Puasa" unit="mg/dL" placeholder="95"
                            hint="Normal <100  ·  Prediabetes 100–125  ·  Diabetes ≥126"
                        />
                    </SectionCard>

                    {/* ── Section 2: Data Tubuh ── */}
                    <SectionCard
                        emoji="📏"
                        title="Data Tubuh"
                        description="Masukkan berat badan, tinggi badan, dan lingkar pinggang. IMT/BMI dihitung otomatis."
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <InputField form={form} errors={errors} handleChange={handleChange}
                                name="berat" label="Berat Badan" unit="kg" placeholder="65" />
                            <InputField form={form} errors={errors} handleChange={handleChange}
                                name="tinggi" label="Tinggi Badan" unit="cm" placeholder="165" />
                        </div>

                        {bmiValue && bmiCategory && (
                            <LiveBadge
                                label={`IMT (BMI): ${bmiValue}`}
                                value={bmiCategory.label}
                                isWarning={bmiCategory.warn}
                            />
                        )}

                        <InputField form={form} errors={errors} handleChange={handleChange}
                            name="lingkarPinggang" label="Lingkar Pinggang" unit="cm" placeholder="85"
                            hint="Risiko meningkat jika: Pria >90 cm  ·  Perempuan >80 cm"
                        />
                    </SectionCard>

                    {/* ── Section 3: Profil Lipid ── */}
                    <SectionCard
                        emoji="🧪"
                        title="Profil Lipid (Kolesterol dan Lemak Darah)"
                        description="Masukkan hasil pemeriksaan laboratorium kolesterol dan lemak darah Anda."
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <InputField form={form} errors={errors} handleChange={handleChange}
                                name="hdl" label="HDL (Kolesterol Baik)" unit="mg/dL" placeholder="55"
                                hint="Normal ≥40 (Pria) · ≥50 (Perempuan)"
                            />
                            <InputField form={form} errors={errors} handleChange={handleChange}
                                name="trigliserida" label="Trigliserida (Lemak Darah)" unit="mg/dL" placeholder="130"
                                hint="Normal <150  ·  Tinggi ≥200"
                            />
                        </div>

                        {tgHdlValue && (
                            <LiveBadge
                                label="Rasio Trigliserida/HDL"
                                value={tgHdlValue}
                                isWarning={parseFloat(tgHdlValue) >= 3}
                            />
                        )}
                    </SectionCard>

                    {/* ── Section 4: Tekanan Darah ── */}
                    <SectionCard
                        emoji="❤️"
                        title="Tekanan Darah"
                        description="Masukkan hasil tekanan darah dari pemeriksaan dokter atau alat tensimeter."
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <InputField form={form} errors={errors} handleChange={handleChange}
                                name="sistolik" label="Tekanan Darah Atas (Sistolik)" unit="mmHg" placeholder="120"
                                hint="Angka pertama, contoh: 120/80"
                            />
                            <InputField form={form} errors={errors} handleChange={handleChange}
                                name="diastolik" label="Tekanan Darah Bawah (Diastolik)" unit="mmHg" placeholder="80"
                                hint="Angka kedua, contoh: 120/80"
                            />
                        </div>

                        {mapValue && (
                            <LiveBadge
                                label="Tekanan Darah Rata-rata (MAP)"
                                value={`${mapValue} mmHg`}
                                isWarning={parseFloat(mapValue) > 100}
                            />
                        )}

                        <p className="text-xs text-gray-400">
                            Tekanan darah rata-rata dihitung otomatis oleh sistem.
                        </p>
                    </SectionCard>

                    {/* ── Submit ── */}
                    <div className="pt-2 space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2
                                bg-gradient-to-r from-[#0072CE] to-[#3E97FF] text-white
                                py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-200
                                hover:from-[#005fa8] hover:to-[#2f7de0] hover:shadow-lg
                                active:scale-[0.99] transition-all duration-200
                                disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Sedang menganalisis...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Analisis dengan AI
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            Nilai yang dimasukkan sebaiknya berasal dari hasil pemeriksaan dokter,
                            rumah sakit, atau laboratorium kesehatan agar hasil analisis lebih akurat.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}