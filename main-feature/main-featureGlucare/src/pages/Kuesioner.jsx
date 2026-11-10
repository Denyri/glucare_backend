import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import { FiAlertCircle, FiX, FiCheck } from "react-icons/fi";
import ClinicalBadge from "../components/ui/ClinicalBadge";
import { useAuth } from "../context/AuthContext";

const questions = [
    {
        id: "age_band",
        title: "Rentang Usia",
        question: "Berapa kelompok usia Anda saat ini?",
        description: "Risiko gangguan metabolisme glukosa meningkat seiring usia akibat perubahan komposisi tubuh.",
        options: [
            { label: "< 30 Tahun", desc: "Dewasa muda (20 – 29 tahun)" },
            { label: "30 – 39 Tahun", desc: "Kelompok usia dewasa menengah" },
            { label: "≥ 40 Tahun", desc: "Kelompok usia dewasa matang" },
        ],
    },
    {
        id: "gender",
        title: "Jenis Kelamin Biologis",
        question: "Apa jenis kelamin biologis Anda?",
        description: "Pria dan wanita memiliki ambang batas adipositas visceral dan profil lipid yang berbeda.",
        options: [
            { label: "Laki-laki", desc: "Pria (ambang batas lingkar pinggang normal ≤90 cm)" },
            { label: "Perempuan", desc: "Wanita (ambang batas lingkar pinggang normal ≤80 cm)" },
        ],
    },
    {
        id: "bmi",
        title: "Indeks Massa Tubuh (BMI)",
        question: "Bagaimana kategori perkiraan berat badan dan BMI Anda?",
        description: "BMI mengindikasikan rasio massa tubuh terhadap tinggi badan (standar WHO Asia-Pasifik).",
        options: [
            { label: "Normal", desc: "BMI 18.5 – 22.9 kg/m²" },
            { label: "Overweight", desc: "BMI 23.0 – 27.4 kg/m²" },
            { label: "Obesitas", desc: "BMI ≥ 27.5 kg/m²" },
        ],
    },
    {
        id: "waist",
        title: "Lingkar Pinggang",
        question: "Bagaimana kondisi ukuran lingkar pinggang Anda?",
        description: "Adipositas visceral di area perut merupakan pemicu utama resistensi insulin seluler.",
        options: [
            { label: "Normal", desc: "Pria ≤90 cm atau Wanita ≤80 cm" },
            { label: "Berisiko", desc: "Pria >90 cm atau Wanita >80 cm" },
        ],
    },
    {
        id: "hypertension",
        title: "Riwayat Tekanan Darah",
        question: "Apakah Anda pernah didiagnosis atau memiliki riwayat tekanan darah tinggi?",
        description: "Hipertensi sering kali berkaitan erat dengan sindrom metabolik dan kekakuan pembuluh darah.",
        options: [
            { label: "Normal", desc: "Tekanan darah teratur dalam batas normal (<130/85 mmHg)" },
            { label: "Riwayat Hipertensi", desc: "Pernah atau sedang memiliki riwayat hipertensi" },
        ],
    },
    {
        id: "glucose_history",
        title: "Riwayat Prediabetes & Keluarga",
        question: "Apakah Anda atau keluarga kandung memiliki riwayat gula darah tinggi / diabetes?",
        description: "Faktor genetik dan riwayat borderline meningkatkan kecenderungan resistensi insulin.",
        options: [
            { label: "Tidak Ada", desc: "Tidak ada riwayat diabetes keluarga maupun gula darah tinggi pribadi" },
            { label: "Ada Riwayat", desc: "Keluarga kandung memiliki diabetes atau pernah dinyatakan borderline" },
        ],
    },
    {
        id: "physical_activity",
        title: "Aktivitas Fisik & Olahraga (WHO)",
        question: "Seberapa sering Anda melakukan aktivitas fisik sedang minimal 150 menit/minggu?",
        description: "Aktivitas fisik merangsang penyerapan glukosa ke sel otot melalui jalur independen-insulin (GLUT4).",
        options: [
            { label: "Aktif (≥150 mnt/mgg)", desc: "Olahraga/jalan cepat minimal 30 menit x 5 hari per minggu" },
            { label: "Kurang Aktif (<150 mnt/mgg)", desc: "Jarang berolahraga atau aktivitas fisik harian minim" },
        ],
    },
    {
        id: "sedentary_hours",
        title: "Durasi Duduk Harian (Sedentari)",
        question: "Berapa rata-rata jam dalam sehari yang Anda habiskan dalam posisi duduk/tidak bergerak?",
        description: "Duduk berkepanjangan memperlambat metabolisme glukosa dan mempercepat akumulasi asam lemak bebas.",
        options: [
            { label: "< 6 Jam per Hari", desc: "Banyak bergerak, berjalan, atau mobilitas fisik tinggi" },
            { label: "6 – 8 Jam per Hari", desc: "Sebagian besar waktu kerja di meja dengan mobilitas sedang" },
            { label: "> 8 Jam per Hari", desc: "Duduk berkepanjangan terus menerus dengan sedikit jeda gerak" },
        ],
    },
    {
        id: "smoking",
        title: "Status Merokok",
        question: "Apakah Anda merupakan perokok aktif saat ini?",
        description: "Nikotin memicu stres oksidatif dan peradangan endotel yang memperburuk sensitivitas sel beta pankreas.",
        options: [
            { label: "Bukan Perokok", desc: "Tidak pernah merokok atau sudah berhenti lama" },
            { label: "Perokok Aktif", desc: "Merokok rutin setiap hari atau beberapa kali seminggu" },
        ],
    },
    {
        id: "diet",
        title: "Pola Makan & Makanan Cepat Saji",
        question: "Bagaimana kebiasaan pola makan Anda sehari-hari?",
        description: "Konsumsi tinggi gula sederhana dan makanan ultra-proses memicu lonjakan glukosa tajam.",
        options: [
            { label: "Sehat & Seimbang", desc: "Rutin makan sayur/buah berserat, protein cukup, dan rendah olahan" },
            { label: "Kurang Sehat / Sering Siap Saji", desc: "Sering mengonsumsi makanan cepat saji, gorengan, atau minuman manis" },
        ],
    },
];

export default function Kuesioner() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();
    const { user } = useAuth();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [toast, setToast] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showError = (message) => {
        setToast({ message, id: Date.now() });
    };

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleSelect = (optionLabel) => {
        setAnswers({
            ...answers,
            [currentQuestion]: optionLabel,
        });
    };

    const handleNext = async () => {
        if (!answers[currentQuestion]) {
            showError("Silakan pilih salah satu opsi jawaban sebelum melanjutkan.");
            return;
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setIsSubmitting(true);
            try {
                const ageText = answers[0];
                const genderText = answers[1];
                const bmiText = answers[2];
                const waistText = answers[3];
                const hyperText = answers[4];
                const glucHistText = answers[5];
                const physText = answers[6];
                const sedText = answers[7];
                const smokeText = answers[8];
                const dietText = answers[9];

                const isOverweight = bmiText === "Overweight" || bmiText === "Obesitas";

                const payload = {
                    user_id: user?.id,
                    age_band: ageText === "< 30 Tahun" ? 0 : 1,
                    gender: genderText === "Perempuan" ? 2 : 1,
                    bmi_category: bmiText === "Normal" ? 0 : bmiText === "Overweight" ? 1 : 2,
                    waist_category: waistText === "Normal" ? 0 : 1,
                    hypertension: hyperText === "Riwayat Hipertensi" ? 1 : 0,
                    diabetes_history: glucHistText === "Ada Riwayat" ? 1 : 0,
                    prediabetes_told: glucHistText === "Ada Riwayat" ? 1 : 0,
                    prediabetes_history: glucHistText === "Ada Riwayat" ? 1 : 0,
                    physically_active: physText?.includes("Aktif (≥150") ? 1 : 0,
                    sedentary_hours: sedText === "> 8 Jam per Hari" ? 10.0 : (sedText === "6 – 8 Jam per Hari" ? 7.0 : 4.0),
                    current_smoker: smokeText === "Perokok Aktif" ? 1 : 0,
                    poor_diet: dietText?.includes("Kurang Sehat") ? 1 : 0,
                    overweight_history: isOverweight ? 1 : 0,
                };

                const { predictQuestionnaire } = await import("../services/glucareAI");
                const result = await predictQuestionnaire(payload);

                if (user?.id) {
                    localStorage.setItem(`aiAnalysisResult_${user.id}`, JSON.stringify(result));
                    localStorage.setItem(`aiAnalysisResult_questionnaire_${user.id}`, JSON.stringify(result));
                }

                navigate("/hasil", { state: { result, mode: "questionnaire" } });
            } catch (err) {
                console.error("Gagal saat memproses kuesioner AI:", err);
                showError("Gagal melakukan analisis. Pastikan layanan AI sedang aktif.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const current = questions[currentQuestion];
    const progressPct = Math.round(((currentQuestion + 1) / questions.length) * 100);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />

            {/* Error Toast */}
            {toast && (
                <div className="fixed top-24 inset-x-0 z-[10000] flex justify-center px-4 pointer-events-none">
                    <div
                        key={toast.id}
                        role="alert"
                        className="pointer-events-auto w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-4 shadow-xl flex items-start gap-3 text-rose-900 animate-in fade-in slide-in-from-top-2"
                    >
                        <FiAlertCircle size={20} className="text-rose-600 mt-0.5 shrink-0" />
                        <p className="flex-1 text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>
            )}

            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Mode Kuesioner Cepat"
                    subtitle="Skrining faktor risiko non-invasif tanpa jarum suntik"
                />

                <main className="px-4 sm:px-8 max-w-3xl mx-auto w-full mt-8 pb-16 space-y-6">
                    
                    {/* Step Tracker Header */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <ClinicalBadge variant="clinical">
                                Pertanyaan {currentQuestion + 1} dari {questions.length}
                            </ClinicalBadge>
                            <span className="text-slate-500 font-mono">
                                {progressPct}% Selesai
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-sky-400"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 space-y-6">
                        
                        <div className="space-y-2">
                            <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
                                {current.title}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                                {current.question}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                {current.description}
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 pt-2">
                            {current.options.map((opt) => {
                                const isSelected = answers[currentQuestion] === opt.label;
                                return (
                                    <div
                                        key={opt.label}
                                        onClick={() => handleSelect(opt.label)}
                                        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 ${
                                            isSelected
                                                ? "bg-blue-50/80 border-blue-600 shadow-sm"
                                                : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className={`font-bold text-sm sm:text-base ${
                                                isSelected ? "text-blue-900" : "text-slate-900"
                                            }`}>
                                                {opt.label}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {opt.desc}
                                            </div>
                                        </div>

                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-slate-300 bg-white"
                                        }`}>
                                            {isSelected && <FiCheck size={14} className="stroke-[3]" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Navigation Footer */}
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={currentQuestion === 0}
                                className="px-5 py-2.5 rounded-full text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            >
                                ← Sebelumnya
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-100 disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? "Menganalisis AI..."
                                    : currentQuestion === questions.length - 1
                                    ? "Selesaikan & Lihat Hasil →"
                                    : "Selanjutnya →"}
                            </button>
                        </div>

                    </div>

                </main>
            </div>
        </div>
    );
}