import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../hooks/useSidebar";
import { useNavigate } from "react-router-dom";
import HeaderAnalisis from "../components/HeaderAnalisis";

const API = `${import.meta.env.VITE_API_URL}/api`;

// ── Helper ─────────────────────────────────────────────────────
const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// ── Komponen Kartu Metrik ───────────────────────────────────────
const MetricCard = ({ label, value, unit = "", sub, color = "text-gray-800" }) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

// ── Komponen Status Badge ───────────────────────────────────────
const StatusBadge = ({ type }) => {
    const map = {
        good: { text: "Target Tercapai", cls: "bg-green-100 text-green-700" },
        ok: { text: "Hampir Tercapai", cls: "bg-amber-100 text-amber-700" },
        low: { text: "Perlu Ditingkatkan", cls: "bg-red-50 text-red-600" },
        great: { text: "Sangat Baik", cls: "bg-green-100 text-green-700" },
        needs: { text: "Perlu Diperbaiki", cls: "bg-red-50 text-red-600" },
        baik: { text: "Baik", cls: "bg-green-100 text-green-700" },
        cukup: { text: "Cukup", cls: "bg-amber-100 text-amber-700" },
    };
    const s = map[type] || { text: type, cls: "bg-gray-100 text-gray-600" };
    return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.cls}`}>{s.text}</span>;
};

// ── Section Wrapper ─────────────────────────────────────────────
const Section = ({ emoji, title, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
        </div>
        <div className="px-6 py-5">{children}</div>
    </div>
);

// ── Empty State ─────────────────────────────────────────────────
const EmptyState = ({ message }) => (
    <p className="text-sm text-gray-400 italic">{message}</p>
);

// ══════════════════════════════════════════════════════════════
export default function Evaluasi() {
    const { isOpen } = useSidebar();
    const navigate = useNavigate();
    const [planData, setPlanData] = useState(null);
    const [dailyData, setDailyData] = useState([]);   // from daily_tracking
    const [glucoseData, setGlucoseData] = useState([]); // from glucose_tracking
    const [prevRisk, setPrevRisk] = useState(null);    // from aiAnalysisResult in localStorage
    const [loading, setLoading] = useState(true);

    const getUser = () => {
        try {
            const raw = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
            if (raw && raw !== "undefined") return JSON.parse(raw);
        } catch (e) { }
        return null;
    };
    const user = getUser();

    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }

        
        const rawAI = localStorage.getItem(`aiAnalysisResult_${user.id}`);
            if (rawAI) {
                try {
                    const parsed = JSON.parse(rawAI);
                    const mode = parsed?.aiResult?.mode || parsed?.mode;
                    const level = parsed?.aiResult?.risk_level || null;
                    let score = null;

        if (mode === "lab" || mode === "clinical") {
            // Mode lab/clinical: pakai predict_proba
            const proba = parsed?.aiResult?.predict_proba || [];
            if (proba.length > 0) {
                score = Math.round((proba[1] + proba[2]) * 100);
            } else {
                // Fallback jika tidak ada proba
                score = (level === "low" || level === "Normal") ? 25
                    : (level === "medium" || level === "Prediabetes") ? 55
                    : (level === "high" || level === "Diabetes") ? 85
                    : null;
            }
        } else {
            // Mode kuesioner: konversi dari risk_level
            score = (level === "low" || level === "Normal") ? 25
                : (level === "medium" || level === "Prediabetes") ? 55
                : (level === "high" || level === "Diabetes") ? 85
                : null;
        }

        setPrevRisk({ score, level });
    } catch (e) { }
}

        // Fetch semua data dari backend secara paralel
        const loadAll = async () => {
            try {
                const [planRes, dailyRes, glucoseRes] = await Promise.all([
                    fetch(`${API}/plan/${user.id}`),
                    fetch(`${API}/plan/tracking/daily/${user.id}`),
                    fetch(`${API}/plan/tracking/glucose/${user.id}`),
                ]);

                if (planRes.ok) {
                    const d = await planRes.json();
                    setPlanData(d.enrolled ? d : null);
                }
                if (dailyRes.ok) {
                    const d = await dailyRes.json();
                    setDailyData(d.data || []);
                }
                if (glucoseRes.ok) {
                    const d = await glucoseRes.json();
                    setGlucoseData(d.data || []);
                }
            } catch (e) {
                console.error("Gagal memuat data evaluasi:", e);
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, []);

    // ── Kalkulasi dari data real ──────────────────────────────
    let sleepArr = dailyData.map(d => parseFloat(d.sleep_hours) || 0).filter(v => v > 0);
    let walkArr = dailyData.map(d => parseInt(d.walking_minutes) || 0).filter(v => v > 0);
    let nutArr = dailyData.map(d => parseFloat(d.nutrition_score) || 0).filter(v => v > 0);
    let glucArr = glucoseData.map(g => parseFloat(g.glucose_value) || 0).filter(v => v > 0);

    let sleepTarget = planData?.targets?.sleep || 7;
    let walkTarget = planData?.targets?.walking || 30;
    let currentDay = planData?.day || 0;

    // === 🛠️ MODE TESTING UNTUK MELIHAT EVALUASI 30/90 HARI ===
    // Ubah `isTesting` menjadi `false` untuk mengembalikan ke data asli dari database
    const isTesting = false;
    if (isTesting) {
        currentDay = 90; // Ubah ke 30 atau 90 untuk melihat tampilannya

        // Simulasi data 90 hari penuh agar Evaluasi Akhir (Hari ke-90) muncul
        if (glucArr.length < 90) {
            const bulan1 = Array(30).fill(120); // Bulan 1: Rata-rata 120 mg/dL (Prediabetes)
            const bulan2 = Array(30).fill(108); // Bulan 2: Mulai membaik
            const bulan3 = Array(30).fill(95);  // Bulan 3: Normal (95 mg/dL)
            glucArr = [...bulan1, ...bulan2, ...bulan3];
        }
        if (sleepArr.length < 90) sleepArr = Array(90).fill(7.5);
        if (walkArr.length < 90) walkArr = Array(90).fill(35);
        if (nutArr.length < 90) nutArr = Array(90).fill(8);
    }
    // =======================================================

    const avgSleep = avg(sleepArr);
    const avgWalk = avg(walkArr);
    const avgNutrition = avg(nutArr);
    const avgGlucose = avg(glucArr);
    const minGlucose = glucArr.length ? Math.min(...glucArr) : null;
    const maxGlucose = glucArr.length ? Math.max(...glucArr) : null;

    // Kategori tidur
    const sleepStatus = avgSleep >= sleepTarget ? "good" : avgSleep >= sleepTarget * 0.8 ? "ok" : "low";
    // Kategori jalan
    const walkStatus = avgWalk >= walkTarget ? "baik" : avgWalk >= walkTarget * 0.6 ? "cukup" : "low";
    // Kategori nutrisi (0–10 scale)
    const nutStatus = avgNutrition >= 7.5 ? "great" : avgNutrition >= 5 ? "baik" : "needs";

    // Data evaluasi hari ke-30 (hari 1–30) dan hari ke-90 (hari 61–90)
    const glucose30 = glucArr.slice(0, 30);
    const glucose90 = glucArr.slice(60, 90);
    const avgGluc30 = avg(glucose30);
    const avgGluc90 = avg(glucose90);
    const glucoseDiff = avgGluc90 && avgGluc30 ? (avgGluc90 - avgGluc30).toFixed(1) : null;

    // Risiko saat ini: placeholder dari localStorage
    const riskLabel = (level) => {
        if (!level) return "-";
        if (level === "Normal" || level === "low") return "Risiko Rendah";
        if (level === "Prediabetes" || level === "medium") return "Risiko Sedang";
        return "Risiko Tinggi";
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className={`flex-1 flex items-center justify-center transition-all ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                    <div className="text-center">
                        <svg className="animate-spin w-8 h-8 text-[#0072CE] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-sm text-gray-400">Memuat data evaluasi...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>

                {/* Header */}
                <HeaderAnalisis
                    title="Evaluasi Program"
                    subtitle={currentDay > 0 ? `Hari ke-${currentDay} dari 90 hari` : "Lihat perkembangan kesehatan Anda selama program 90 hari"}
                />

                <div className="px-4 sm:px-6 max-w-5xl mx-auto py-6 space-y-5">
                    {/* Tombol Back */}
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-gray-500 hover:text-[#0072CE] transition-colors text-sm font-semibold w-fit"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Kembali
                    </button>

                    {/* ── Perbandingan Risiko ── */}
                    <Section emoji="📈" title="Perbandingan Risiko">
                        {prevRisk ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-1">Risiko Awal (Analisis Pertama)</p>
                                        <p className="text-2xl font-black text-gray-700">{prevRisk.score ?? "-"}%</p>
                                        <p className="text-xs text-gray-500 mt-1">{riskLabel(prevRisk.level)}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <p className="text-xs text-gray-400 mb-1">Kondisi Saat Ini</p>
                                        <p className="text-2xl font-black text-[#0072CE]">
                                            {avgGlucose > 0
                                                ? avgGlucose >= 126 ? "Tinggi" : avgGlucose >= 100 ? "Sedang" : "Baik"
                                                : "-"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {avgGlucose > 0 ? `Rata-rata gula: ${avgGlucose.toFixed(1)} mg/dL` : "Belum ada data. Silakan catat di menu Rencana 90 Hari."}
                                        </p>
                                    </div>
                                </div>

                                {/* Pesan perubahan */}
                                {glucArr.length >= 7 && avgGlucose > 0 && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
                                        ${avgGlucose < 100 ? "bg-green-50 text-green-700" :
                                            avgGlucose < 126 ? "bg-amber-50 text-amber-700" :
                                                "bg-red-50 text-red-600"}`}>
                                        <span>
                                            {avgGlucose < 100
                                                ? "✅ Gula darah Anda berada di zona normal. Pertahankan!"
                                                : avgGlucose < 126
                                                    ? "⚠️ Gula darah masih di zona prediabetes. Tetap semangat menjalani program."
                                                    : "⚠️ Gula darah masih perlu perhatian lebih. Konsultasikan dengan dokter Anda."}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState message="Lakukan analisis risiko terlebih dahulu untuk melihat perbandingan." />
                        )}
                    </Section>

                    {/* ── Ringkasan Gula Darah ── */}
                    <Section emoji="🩸" title="Ringkasan Gula Darah">
                        {glucArr.length >= 3 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <MetricCard label="Rata-rata" value={avgGlucose.toFixed(1)} unit="mg/dL"
                                    color={avgGlucose < 100 ? "text-green-600" : avgGlucose < 126 ? "text-amber-600" : "text-red-600"} />
                                <MetricCard label="Terendah" value={minGlucose} unit="mg/dL" color="text-green-600" />
                                <MetricCard label="Tertinggi" value={maxGlucose} unit="mg/dL" color="text-red-500" />
                                <MetricCard label="Data Tercatat" value={glucArr.length} unit="hari" />
                            </div>
                        ) : (
                            <EmptyState message="Belum terdapat cukup data untuk dilakukan evaluasi. Catat gula darah Anda minimal 3 kali melalui menu Rencana 90 Hari." />
                        )}
                    </Section>

                    {/* ── Pola Tidur ── */}
                    <Section emoji="😴" title="Pola Tidur">
                        {sleepArr.length >= 3 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{avgSleep.toFixed(1)} <span className="text-sm font-normal text-gray-500">jam/hari</span></p>
                                        <p className="text-xs text-gray-400 mt-0.5">Target: {sleepTarget} jam</p>
                                    </div>
                                    <StatusBadge type={sleepStatus} />
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all duration-700 ${sleepStatus === "good" ? "bg-green-500" : sleepStatus === "ok" ? "bg-amber-400" : "bg-red-400"}`}
                                        style={{ width: `${Math.min(100, (avgSleep / sleepTarget) * 100)}%` }} />
                                </div>
                                <p className="text-xs text-gray-400">Data dari {sleepArr.length} hari tracking</p>
                            </div>
                        ) : (
                            <EmptyState message="Belum terdapat cukup data pola tidur. Catat minimal 3 hari tracking." />
                        )}
                    </Section>

                    {/* ── Aktivitas Fisik ── */}
                    <Section emoji="🚶" title="Aktivitas Fisik">
                        {walkArr.length >= 3 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{Math.round(avgWalk)} <span className="text-sm font-normal text-gray-500">menit/hari</span></p>
                                        <p className="text-xs text-gray-400 mt-0.5">Target: {walkTarget} menit</p>
                                    </div>
                                    <StatusBadge type={walkStatus} />
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all duration-700 ${walkStatus === "baik" ? "bg-green-500" : walkStatus === "cukup" ? "bg-amber-400" : "bg-red-400"}`}
                                        style={{ width: `${Math.min(100, (avgWalk / walkTarget) * 100)}%` }} />
                                </div>
                                <p className="text-xs text-gray-400">Data dari {walkArr.length} hari tracking</p>
                            </div>
                        ) : (
                            <EmptyState message="Belum terdapat cukup data aktivitas fisik. Catat minimal 3 hari tracking." />
                        )}
                    </Section>

                    {/* ── Pola Makan ── */}
                    <Section emoji="🍎" title="Pola Makan">
                        {nutArr.length >= 3 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{avgNutrition.toFixed(1)} <span className="text-sm font-normal text-gray-500">/ 10</span></p>
                                        <p className="text-xs text-gray-400 mt-0.5">Skor rata-rata nutrisi harian</p>
                                    </div>
                                    <StatusBadge type={nutStatus} />
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all duration-700 ${nutStatus === "great" ? "bg-green-500" : nutStatus === "baik" ? "bg-amber-400" : "bg-red-400"}`}
                                        style={{ width: `${(avgNutrition / 10) * 100}%` }} />
                                </div>
                                <p className="text-xs text-gray-400">Data dari {nutArr.length} hari tracking</p>
                            </div>
                        ) : (
                            <EmptyState message="Belum terdapat cukup data pola makan. Catat minimal 3 hari tracking." />
                        )}
                    </Section>

                    {/* ── Evaluasi Hari ke-30 ── */}
                    <Section emoji="📅" title="Evaluasi Hari ke-30">
                        {currentDay < 30 ? (
                            <EmptyState message={`Evaluasi 1 Bulan akan terbuka setelah Anda menjalani program selama 30 hari. (Saat ini hari ke-${currentDay})`} />
                        ) : glucArr.length > 0 ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Card Gula Darah */}
                                    <div className={`p-4 rounded-2xl border ${avgGluc30 < 100 ? "bg-green-50 border-green-100" : avgGluc30 < 126 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm">
                                                {avgGluc30 < 100 ? "✅" : avgGluc30 < 126 ? "⚠️" : "❌"}
                                            </div>
                                            <h4 className="font-bold text-gray-800">Gula Darah</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {avgGluc30 < 100 ? "Terkendali dan berada di zona normal." : avgGluc30 < 126 ? "Menunjukkan tanda perbaikan, namun masih di zona prediabetes." : "Masih tergolong tinggi, perlu perhatian ekstra."}
                                        </p>
                                    </div>

                                    {/* Card Tidur */}
                                    <div className={`p-4 rounded-2xl border ${avgSleep >= sleepTarget ? "bg-green-50 border-green-100" : avgSleep >= sleepTarget * 0.8 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm">
                                                {avgSleep >= sleepTarget ? "✅" : avgSleep >= sleepTarget * 0.8 ? "⚠️" : "❌"}
                                            </div>
                                            <h4 className="font-bold text-gray-800">Pola Tidur</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {avgSleep >= sleepTarget ? "Waktu istirahat Anda sudah memenuhi target." : avgSleep >= sleepTarget * 0.8 ? "Hampir mencapai target, perbaiki sedikit lagi." : "Waktu tidur masih kurang, tingkatkan kualitas istirahat Anda."}
                                        </p>
                                    </div>

                                    {/* Card Aktivitas */}
                                    <div className={`p-4 rounded-2xl border ${avgWalk >= walkTarget ? "bg-green-50 border-green-100" : avgWalk >= walkTarget * 0.6 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm">
                                                {avgWalk >= walkTarget ? "✅" : avgWalk >= walkTarget * 0.6 ? "⚠️" : "❌"}
                                            </div>
                                            <h4 className="font-bold text-gray-800">Aktivitas Fisik</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {avgWalk >= walkTarget ? "Sangat baik, target jalan kaki tercapai." : avgWalk >= walkTarget * 0.6 ? "Cukup aktif, namun masih bisa ditingkatkan lagi." : "Aktivitas harian masih rendah, mari lebih banyak bergerak."}
                                        </p>
                                    </div>

                                    {/* Card Nutrisi */}
                                    <div className={`p-4 rounded-2xl border ${avgNutrition >= 7.5 ? "bg-green-50 border-green-100" : avgNutrition >= 5 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm">
                                                {avgNutrition >= 7.5 ? "✅" : avgNutrition >= 5 ? "⚠️" : "❌"}
                                            </div>
                                            <h4 className="font-bold text-gray-800">Pola Makan</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {avgNutrition >= 7.5 ? "Pola makan sangat terjaga dan bernutrisi baik." : avgNutrition >= 5 ? "Sudah cukup baik, tetap waspada dengan asupan manis." : "Pola makan masih perlu banyak diperbaiki."}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#0072CE]/10 to-[#3E97FF]/10 border border-[#0072CE]/20 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-[#0072CE]">lightbulb</span>
                                        <h4 className="font-bold text-[#0072CE] text-base">Kesimpulan 30 Hari Pertama</h4>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                        Setelah 1 bulan berjalan, {avgGluc30 < 100 ? "kadar gula darah Anda menunjukkan hasil yang luar biasa dan telah kembali normal." : avgGluc30 < 126 ? "kadar gula darah Anda mulai menunjukkan perbaikan, yang berarti tubuh merespons positif terhadap program ini." : "kadar gula darah Anda masih perlu perhatian ekstra dan penyesuaian gaya hidup yang lebih ketat."} Pertahankan kebiasaan yang {avgWalk >= walkTarget && avgSleep >= sleepTarget && avgNutrition >= 7.5 ? "sudah berjalan sangat baik ini" : "sudah mulai terbangun ini, dan fokuslah untuk memperbaiki aspek yang belum mencapai target demi hasil yang lebih maksimal di bulan berikutnya"}.
                                    </p>
                                    
                                    {glucose30.length < 14 && (
                                        <p className="text-xs text-gray-500 italic mt-4 pt-4 border-t border-[#0072CE]/10">
                                            *Catatan: Evaluasi ini menggunakan {glucose30.length} data gula darah yang tersedia di bulan pertama. Untuk hasil yang lebih presisi, disarankan mencatat gula darah minimal 2 minggu sekali.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <EmptyState message="Belum ada data gula darah yang dicatat. Catat hasil pemeriksaan Anda setidaknya 1 kali agar kami dapat memberikan evaluasi." />
                        )}
                    </Section>

                    {/* ── Evaluasi Hari ke-90 ── */}
                    <Section emoji="🏆" title="Evaluasi Akhir Program (Hari ke-90)">
                        {currentDay < 60 ? (
                            <EmptyState message={`Evaluasi Akhir akan terbuka menjelang akhir program (hari ke-60 hingga 90). (Saat ini hari ke-${currentDay})`} />
                        ) : glucose30.length > 0 && glucose90.length > 0 ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Awal Program</p>
                                        <p className="text-2xl font-black text-gray-800">{avgGluc30.toFixed(1)}</p>
                                        <p className="text-xs text-gray-500 mt-1">mg/dL (Bulan 1)</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Akhir Program</p>
                                        <p className={`text-2xl font-black ${avgGluc90 < avgGluc30 ? "text-green-600" : "text-red-500"}`}>{avgGluc90.toFixed(1)}</p>
                                        <p className="text-xs text-gray-500 mt-1">mg/dL (Bulan 3)</p>
                                    </div>
                                    <div className={`rounded-2xl p-5 shadow-sm text-center border ${parseFloat(glucoseDiff) < 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                        <p className={`text-xs font-medium mb-1 uppercase tracking-wider ${parseFloat(glucoseDiff) < 0 ? "text-green-700" : "text-red-700"}`}>Perubahan</p>
                                        <p className={`text-2xl font-black ${parseFloat(glucoseDiff) < 0 ? "text-green-600" : "text-red-600"}`}>
                                            {glucoseDiff > 0 ? `+${glucoseDiff}` : glucoseDiff}
                                        </p>
                                        <p className={`text-xs mt-1 ${parseFloat(glucoseDiff) < 0 ? "text-green-600/80" : "text-red-600/80"}`}>mg/dL</p>
                                    </div>
                                </div>

                                <div className={`border rounded-2xl p-6 ${parseFloat(glucoseDiff) < 0 ? "bg-green-50/50 border-green-200" : parseFloat(glucoseDiff) === 0 ? "bg-gray-50 border-gray-200" : "bg-red-50/50 border-red-200"}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`material-symbols-outlined ${parseFloat(glucoseDiff) < 0 ? "text-green-600" : "text-red-600"}`}>
                                            {parseFloat(glucoseDiff) < 0 ? "task_alt" : "warning"}
                                        </span>
                                        <h4 className={`font-bold text-base ${parseFloat(glucoseDiff) < 0 ? "text-green-800" : "text-red-800"}`}>Kesimpulan Akhir Program</h4>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                        {parseFloat(glucoseDiff) < 0
                                            ? `Selamat! Rata-rata gula darah Anda berhasil turun secara signifikan sebesar ${Math.abs(glucoseDiff)} mg/dL selama 90 hari. Program intervensi gaya hidup ini telah memberikan dampak positif yang nyata bagi kesehatan metabolik Anda. Terus pertahankan pola hidup sehat ini ke depannya.`
                                            : parseFloat(glucoseDiff) === 0
                                            ? "Rata-rata gula darah Anda tidak mengalami perubahan yang signifikan selama 90 hari. Evaluasi kembali rutinitas dan kedisiplinan Anda. Sangat disarankan untuk berkonsultasi dengan dokter guna menyesuaikan strategi kesehatan Anda."
                                            : `Rata-rata gula darah Anda cenderung naik sebesar ${glucoseDiff} mg/dL selama 90 hari terakhir. Tolong tinjau kembali konsistensi pola makan dan aktivitas fisik Anda. Sangat disarankan untuk segera berkonsultasi dengan dokter Anda.`}
                                    </p>
                                    
                                    {(glucose30.length < 14 || glucose90.length < 14) && (
                                        <p className="text-xs text-gray-500 italic mt-4 pt-4 border-t border-gray-200">
                                            *Catatan: Kesimpulan ini dihitung menggunakan data yang tersedia dari bulan pertama dan bulan ketiga. Pastikan selalu melakukan pengecekan rutin untuk pantauan yang akurat.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <EmptyState message="Data gula darah di bulan pertama atau bulan ketiga tidak tersedia untuk melakukan perbandingan akhir program." />
                        )}
                    </Section>

                    {/* ── Aksi ── */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
                        <button
                            onClick={() => navigate("/rencana")}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                                bg-gradient-to-r from-[#0072CE] to-[#3E97FF] shadow-md
                                hover:from-[#005fa8] hover:to-[#2f7de0] transition-all"
                        >
                            Lanjutkan Tracking Harian
                        </button>
                        <button
                            onClick={() => navigate("/analisis")}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#0072CE]
                                bg-white border border-[#0072CE]/30 hover:bg-blue-50 transition-all"
                        >
                            Analisis Ulang Risiko
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}