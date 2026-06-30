import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HeaderAnalisis from "../components/HeaderAnalisis";
import iconBack from "../assets/iconBack.svg";
import iconNext from "../assets/IconNext.svg";
import iconFinish from "../assets/iconFinish.svg";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import { FiAlertCircle, FiX } from "react-icons/fi";

const questions = [
    {
        question: "Bagaimana kategori BMI Anda?",
        options: ["Normal", "Overweight", "Obesitas"],
    },
    {
        question: "Bagaimana kondisi lingkar pinggang Anda?",
        options: ["Normal", "Berisiko"],
    },
    {
        question: "Apakah Anda memiliki hipertensi?",
        options: ["Ya", "Tidak"],
    },
    {
        question:
            "Apakah Anda pernah memiliki riwayat kelebihan berat badan?",
        options: ["Ya", "Tidak"],
    },
];

export default function Kuesioner() {
    const navigate = useNavigate();
    const { isOpen } = useSidebar();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [toast, setToast] = useState(null);

    const showError = (message) => {
        setToast({ message, id: Date.now() });
    };

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleSelect = (option) => {
        setAnswers({
            ...answers,
            [currentQuestion]: option,
        });
    };

    const handleNext = async () => {
        if (!answers[currentQuestion]) {
            showError("Silahkan pilih jawaban terlebih dahulu");
            return;
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            try {
                let currentUser = null;
                try {
                    const rawUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
                    if (rawUser && rawUser !== "undefined") {
                        currentUser = JSON.parse(rawUser);
                    }
                } catch (e) { console.error("Error parsing user in Kuesioner", e); }

                const bmiText = answers[0];
                const waistText = answers[1];
                const hyperText = answers[2];
                const overweightText = answers[3];

                const payload = {
                    user_id: currentUser?.id,
                    bmi_category: bmiText === "Normal" ? 0 : bmiText === "Overweight" ? 1 : 2,
                    waist_category: waistText === "Normal" ? 0 : 1,
                    hypertension: hyperText === "Ya" ? 1 : 0,
                    overweight_history: overweightText === "Ya" ? 1 : 0
                };

                const { predictQuestionnaire } = await import("../services/glucareAI");
                const result = await predictQuestionnaire(payload);

                if (currentUser?.id) {
                    localStorage.setItem(`aiAnalysisResult_${currentUser.id}`, JSON.stringify(result));
                }

                navigate("/hasil");
            } catch (err) {
                console.error("Gagal saat memproses kuesioner AI:", err);
                showError("Gagal melakukan analisis. Pastikan layanan AI sedang aktif.");
            }
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const current = questions[currentQuestion];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            {toast && (
                <div className="fixed top-20 inset-x-0 z-[10000] flex justify-center px-4 pointer-events-none">
                    <div
                        key={toast.id}
                        role="alert"
                        aria-live="assertive"
                        className="toast-enter pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl"
                    >
                        <div className="flex items-start gap-3 px-4 py-3">
                            <span className="mt-0.5 flex-shrink-0 text-red-500">
                                <FiAlertCircle size={20} />
                            </span>
                            <p className="flex-1 text-sm leading-snug text-gray-800">{toast.message}</p>
                            <button
                                type="button"
                                onClick={() => setToast(null)}
                                aria-label="Tutup notifikasi"
                                className="flex-shrink-0 text-gray-400 transition hover:text-gray-600">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="toast-progress h-1 bg-red-500" />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes toastSlideIn {
                    from { transform: translateY(-12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes toastShrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .toast-enter { animation: toastSlideIn 0.25s ease-out; }
                .toast-progress { animation: toastShrink 4.5s linear forwards; }
            `}</style>

            <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-24'}`}>
                <HeaderAnalisis
                    title="Mode Kuesioner"
                    subtitle="Masukkan data untuk analisis AI"
                />

                <div className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 max-w-4xl lg:max-w-5xl mx-auto w-full">
                    
                    
                    <p className="text-xs sm:text-sm text-gray-500">
                        Pertanyaan {currentQuestion + 1} / {questions.length}
                    </p>

                    
                    <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-sm lg:shadow-md mt-4">
                        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-5 sm:mb-6 text-gray-800 leading-relaxed">
                            {current.question}
                        </h2>

                        <div className="flex flex-col gap-3 sm:gap-4">
                            {current.options.map((option, index) => (
                                <label
                                    key={index}
                                    className={`flex items-start lg:items-center gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer 
                                    group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                                    ${
                                        answers[currentQuestion] === option
                                            ? "bg-[#0072CE] text-white border-[#0072CE] shadow-lg"
                                            : "bg-gray-50 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="option"
                                        checked={answers[currentQuestion] === option}
                                        onChange={() => handleSelect(option)}
                                        className="mt-0.5 sm:mt-1 w-4 h-4 accent-[#0072CE] flex-shrink-0"
                                    />
                                    <span className="text-sm sm:text-base leading-relaxed flex-1 min-w-0">
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    
                    <div className="mt-8 sm:mt-4 lg:mt-8 flex flex-col gap-4">

                        
                        <div className="flex justify-between items-center w-full">
                            <button
                                onClick={handleBack}
                                disabled={currentQuestion === 0}
                                className="flex items-center gap-4 text-gray-500 hover:text-gray-700 disabled:text-gray-300 
                                disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-colors"
                            >
                                <img src={iconBack} className="w-8 h-4" alt="Kembali" />
                                Kembali
                            </button>

                            <div className="flex flex-col items-end gap-3">
                                <div className="flex gap-1.5 sm:gap-2">
                                    {questions.map((_, index) => (
                                        <span key={index} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                                            index <= currentQuestion ? "bg-[#0072CE] scale-110 shadow-sm" : "bg-gray-300"
                                        }`}
                                        />
                                    ))}
                                </div>

                            <button
                                onClick={handleNext}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r 
                                from-[#0072CE] to-[#3E97FF] text-white px-6 sm:px-8 py-3 sm:py-2.5 
                                rounded-xl font-semibold text-sm sm:text-base shadow-lg
                                hover:from-[#005fa8] hover:to-[#2f7de0] transition-colors duration-200"
                            >
                                {currentQuestion === questions.length - 1
                                    ? "Selesai"
                                    : "Selanjutnya"}

                                <img
                                    src={
                                        currentQuestion === questions.length - 1
                                            ? iconFinish
                                            : iconNext
                                    }
                                    className="w-4 h-4"
                                    alt="Next"
                                />
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}