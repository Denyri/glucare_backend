import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../hooks/useSidebar";
import { useNavigate } from "react-router-dom";
import HeaderAnalisis from "../components/HeaderAnalisis";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const MetricCard = ({ label, value, unit = "", sub, color = "text-slate-900" }) => (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
        <p className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-black font-display font-mono tabular-nums ${color}`}>
            {value} <span className="text-xs font-normal text-slate-500 font-sans">{unit}</span>
        </p>
        {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
    </div>
);

const StatusBadge = ({ type }) => {
    const map = {
        good: { text: "Target Tercapai", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        ok: { text: "Mendekati Target", cls: "bg-amber-100 text-amber-800 border-amber-200" },
        low: { text: "Perlu Ditingkatkan", cls: "bg-rose-50 text-rose-700 border-rose-200" },
        great: { text: "Sangat Optimal", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        needs: { text: "Perlu Perbaikan", cls: "bg-rose-50 text-rose-700 border-rose-200" },
        baik: { text: "Sesuai Target", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        cukup: { text: "Cukup", cls: "bg-amber-100 text-amber-800 border-amber-200" },
    };
    const s = map[type] || { text: type, cls: "bg-slate-100 text-slate-700 border-slate-200" };
    return (
        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${s.cls}`}>
            {s.text}
        </span>
    );
};

const Section = ({ icon, title, children }) => (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 sm:px-7 py-4.5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <span className="material-symbols-outlined text-[#0062E3] text-[22px]">{icon}</span>
            <h2 className="text-base font-bold font-display text-slate-900">{title}</h2>
        </div>
        <div className="px-6 sm:px-7 py-6">{children}</div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <span className="material-symbols-outlined text-slate-300 text-3xl mb-1">hourglass_empty</span>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">{message}</p>
    </div>
);

export default function Evaluasi() {
    const { isOpen } = useSidebar();
    const navigate = useNavigate();
    const [planData, setPlanData] = useState(null);
    const [dailyData, setDailyData] = useState([]);
    const [glucoseData, setGlucoseData] = useState([]);
    const [prevRisk, setPrevRisk] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const rawAI = localStorage.getItem(`aiAnalysisResult_${user?.id}`);
        if (rawAI) {
            try {
                const parsed = JSON.parse(rawAI);
                const mode = parsed?.aiResult?.mode || parsed?.mode;
                const level = parsed?.aiResult?.risk_level || null;
                let score = null;

                if (mode === "lab" || mode === "clinical") {
                    const proba = parsed?.aiResult?.predict_proba || [];
                    if (proba.length > 0) {
                        score = Math.round((proba[1] + proba[2]) * 100);
                    } else {
                        score = (level === "low" || level === "Normal") ? 25
                            : (level === "medium" || level === "Prediabetes") ? 55
                            : (level === "high" || level === "Diabetes") ? 85
                            : null;
                    }
                } else {
                    score = (level === "low" || level === "Normal") ? 25
                        : (level === "medium" || level === "Prediabetes") ? 55
                        : (level === "high" || level === "Diabetes") ? 85
                        : null;
                }

                setPrevRisk({ score, level });
            } catch (e) {}
        }

        const loadAll = async () => {
            try {
                const [planRes, dailyRes, glucoseRes] = await Promise.all([
                    api.get(`/api/plan/${user.id}`),
                    api.get(`/api/plan/tracking/daily/${user.id}`),
                    api.get(`/api/plan/tracking/glucose/${user.id}`),
                ]);

                if (planRes.status === 200) {
                    const d = planRes.data;
                    setPlanData(d.enrolled ? d : null);
                }
                if (dailyRes.status === 200) {
                    const d = dailyRes.data;
                    setDailyData(d.data || d || []);
                }
                if (glucoseRes.status === 200) {
                    const d = glucoseRes.data;
                    setGlucoseData(d.data || d || []);
                }
            } catch (e) {
                console.error("Gagal memuat data evaluasi:", e);
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [user?.id]);

    let sleepArr = dailyData.map((d) => parseFloat(d.sleep_hours) || 0).filter((v) => v > 0);
    let walkArr = dailyData.map((d) => parseInt(d.walking_minutes) || 0).filter((v) => v > 0);
    let nutArr = dailyData.map((d) => parseFloat(d.nutrition_score) || 0).filter((v) => v > 0);
    let glucArr = glucoseData.map((g) => parseFloat(g.glucose_value) || 0).filter((v) => v > 0);

    let sleepTarget = planData?.targets?.sleep || 7.5;
    let walkTarget = planData?.targets?.walking || 30;
    let currentDay = planData?.day || 0;

    const avgSleep = avg(sleepArr);
    const avgWalk = avg(walkArr);
    const avgNutrition = avg(nutArr);
    const avgGlucose = avg(glucArr);
    const minGlucose = glucArr.length ? Math.min(...glucArr) : null;
    const maxGlucose = glucArr.length ? Math.max(...glucArr) : null;

    const sleepStatus = avgSleep >= sleepTarget ? "good" : avgSleep >= sleepTarget * 0.8 ? "ok" : "low";
    const walkStatus = avgWalk >= walkTarget ? "baik" : avgWalk >= walkTarget * 0.6 ? "cukup" : "low";
    const nutStatus = avgNutrition >= 7.5 ? "great" : avgNutrition >= 5 ? "baik" : "needs";

    const glucose30 = glucArr.slice(0, 30);
    const glucose90 = glucArr.slice(60, 90);
    const avgGluc30 = avg(glucose30);
    const avgGluc90 = avg(glucose90);
    const glucoseDiff = avgGluc90 && avgGluc30 ? (avgGluc90 - avgGluc30).toFixed(1) : null;

    const riskLabel = (level) => {
        if (!level) return "-";
        if (level === "Normal" || level === "low") return "Risiko Rendah (Normal)";
        if (level === "Prediabetes" || level === "medium") return "Risiko Sedang (Prediabetes)";
        return "Risiko Tinggi (Diabetes)";
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 font-sans">
                <Sidebar />
                <div className={`flex-1 flex items-center justify-center transition-all ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                    <div className="text-center">
                        <div className="animate-spin w-9 h-9 border-2 border-slate-200 border-t-[#0062E3] rounded-full mx-auto mb-3"></div>
                        <p className="text-xs text-slate-500 font-mono">Memuat laporan klinis evaluasi...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <div className={`flex-1 transition-all duration-300 ${isOpen ? "lg:ml-60" : "lg:ml-24"}`}>
                <HeaderAnalisis
                    title="Laporan Evaluasi Klinis"
                    subtitle={currentDay > 0 ? `Analisis Kepatuhan & Efektivitas Intervensi · Hari ke-${currentDay} dari 90 Hari` : "Pantau lintasan perbaikan metabolisme Anda selama program intervensi 90 hari"}
                />

                <div className="px-6 sm:px-10 py-8 max-w-6xl mx-auto space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0062E3] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Kembali</span>
                    </button>

                    {/* Section 1: Perbandingan Risiko Sebelum vs Sekarang */}
                    <Section icon="trending_up" title="Perbandingan Risiko Klinis (Baseline vs Progres)">
                        {prevRisk ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                                        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Skor Skrining Awal (Sebelum Program)
                                        </p>
                                        <p className="text-3xl font-black font-mono text-slate-800 tabular-nums">
                                            {prevRisk.score ?? "-"}%
                                        </p>
                                        <p className="text-xs font-semibold text-slate-600 mt-1">
                                            {riskLabel(prevRisk.level)}
                                        </p>
                                    </div>

                                    <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-200/80">
                                        <p className="text-xs font-mono font-bold text-[#0062E3] uppercase tracking-wider mb-1">
                                            Respons Glukosa Saat Ini
                                        </p>
                                        <p className="text-3xl font-black font-mono text-[#0062E3] tabular-nums">
                                            {avgGlucose > 0 ? `${avgGlucose.toFixed(1)}` : "-"}
                                            <span className="text-sm font-normal text-slate-500 ml-1">mg/dL</span>
                                        </p>
                                        <p className="text-xs font-semibold text-slate-700 mt-1">
                                            {avgGlucose > 0
                                                ? avgGlucose < 100
                                                    ? "Zona Normal ADA (< 100 mg/dL)"
                                                    : avgGlucose < 126
                                                    ? "Zona Prediabetes (100–125 mg/dL)"
                                                    : "Zona Tinggi / Perhatian (≥ 126 mg/dL)"
                                                : "Belum ada catatan GDP. Catat di menu Rencana 90 Hari."}
                                        </p>
                                    </div>
                                </div>

                                {glucArr.length >= 3 && avgGlucose > 0 && (
                                    <div
                                        className={`flex items-start gap-3 p-4 rounded-2xl text-xs font-medium border ${
                                            avgGlucose < 100
                                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                : avgGlucose < 126
                                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                                : "bg-rose-50 text-rose-800 border-rose-200"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                                            {avgGlucose < 100 ? "verified" : "info"}
                                        </span>
                                        <p className="leading-relaxed">
                                            {avgGlucose < 100
                                                ? "Rata-rata glukosa darah puasa berada dalam zona normal ADA. Kepatuhan protokol intervensi menunjukkan hasil positif yang kuat."
                                                : avgGlucose < 126
                                                ? "Rata-rata glukosa darah puasa berada pada ambang prediabetes. Lanjutkan post-meal walking dan batasi karbohidrat olahan untuk menekan variabilitas glukosa."
                                                : "Rata-rata glukosa darah puasa masih di atas batas optimal. Sangat disarankan untuk berkonsultasi dengan dokter keluarga atau spesialis penyakit dalam."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState message="Lakukan skrining risiko klinis terlebih dahulu untuk melihat perbandingan baseline." />
                        )}
                    </Section>

                    {/* Section 2: Ringkasan Glukosa Darah Puasa (GDP) */}
                    <Section icon="water_drop" title="Profil Glukosa Darah Puasa (GDP)">
                        {glucArr.length >= 1 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <MetricCard
                                    label="Rata-rata GDP"
                                    value={avgGlucose.toFixed(1)}
                                    unit="mg/dL"
                                    color={avgGlucose < 100 ? "text-emerald-600" : avgGlucose < 126 ? "text-amber-600" : "text-rose-600"}
                                />
                                <MetricCard
                                    label="GDP Terendah"
                                    value={minGlucose}
                                    unit="mg/dL"
                                    color="text-emerald-600"
                                />
                                <MetricCard
                                    label="GDP Tertinggi"
                                    value={maxGlucose}
                                    unit="mg/dL"
                                    color={maxGlucose >= 126 ? "text-rose-600" : "text-amber-600"}
                                />
                                <MetricCard
                                    label="Frekuensi Tes"
                                    value={glucArr.length}
                                    unit="kali"
                                    sub="Catatan tervalidasi"
                                />
                            </div>
                        ) : (
                            <EmptyState message="Belum ada riwayat GDP yang tercatat. Masukkan hasil cek mandiri di menu Rencana 90 Hari untuk memulai evaluasi kurva glukosa." />
                        )}
                    </Section>

                    {/* Section 3: Kepatuhan 3 Pilar Gaya Hidup */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Pola Tidur */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500 text-[20px]">bedtime</span>
                                    <h4 className="font-bold text-sm text-slate-800">Pola Tidur</h4>
                                </div>
                                <StatusBadge type={sleepStatus} />
                            </div>

                            {sleepArr.length > 0 ? (
                                <div>
                                    <p className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                                        {avgSleep.toFixed(1)}{" "}
                                        <span className="text-xs font-normal text-slate-500">jam/hari</span>
                                    </p>
                                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full ${
                                                sleepStatus === "good" ? "bg-emerald-500" : sleepStatus === "ok" ? "bg-amber-400" : "bg-rose-400"
                                            }`}
                                            style={{ width: `${Math.min(100, (avgSleep / sleepTarget) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono mt-2">
                                        Target: {sleepTarget} jam · Tercatat {sleepArr.length} hari
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Belum ada data tidur tercatat.</p>
                            )}
                        </div>

                        {/* Aktivitas Fisik */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500 text-[20px]">directions_walk</span>
                                    <h4 className="font-bold text-sm text-slate-800">Aktivitas Fisik</h4>
                                </div>
                                <StatusBadge type={walkStatus} />
                            </div>

                            {walkArr.length > 0 ? (
                                <div>
                                    <p className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                                        {Math.round(avgWalk)}{" "}
                                        <span className="text-xs font-normal text-slate-500">menit/hari</span>
                                    </p>
                                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full ${
                                                walkStatus === "baik" ? "bg-emerald-500" : walkStatus === "cukup" ? "bg-amber-400" : "bg-rose-400"
                                            }`}
                                            style={{ width: `${Math.min(100, (avgWalk / walkTarget) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono mt-2">
                                        Target: {walkTarget} menit · Tercatat {walkArr.length} hari
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Belum ada data aktivitas fisik.</p>
                            )}
                        </div>

                        {/* Pola Makan */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">restaurant</span>
                                    <h4 className="font-bold text-sm text-slate-800">Pola Makan</h4>
                                </div>
                                <StatusBadge type={nutStatus} />
                            </div>

                            {nutArr.length > 0 ? (
                                <div>
                                    <p className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                                        {Math.round(avgNutrition)}%
                                    </p>
                                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full ${
                                                nutStatus === "great" ? "bg-emerald-500" : nutStatus === "baik" ? "bg-amber-400" : "bg-rose-400"
                                            }`}
                                            style={{ width: `${Math.min(100, avgNutrition)}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono mt-2">
                                        Kepatuhan nutrisi rendah glikemik
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Belum ada data nutrisi harian.</p>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Evaluasi Milestone 30 Hari */}
                    <Section icon="event_available" title="Evaluasi Milestone Hari ke-30 (Akhir Fase 1)">
                        {currentDay < 30 ? (
                            <EmptyState message={`Milestone 30 Hari akan otomatis terbuka setelah Anda mencapai hari ke-30 intervensi (Saat ini hari ke-${currentDay}).`} />
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                                            Status Rata-rata GDP Bulan ke-1
                                        </h4>
                                        <p className="text-xl font-bold font-mono text-[#0062E3]">
                                            {avgGluc30 > 0 ? `${avgGluc30.toFixed(1)} mg/dL` : "Belum dicatat"}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {avgGluc30 < 100
                                                ? "Terkendali dalam zona normal ADA (< 100 mg/dL)"
                                                : "Mulai menunjukkan respons positif terhadap reduksi gula"}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                                            Adaptasi Fisiologis Seluler
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                            30 hari pertama telah memutus siklus hiperinsulinemia basal. Kepekaan reseptor insulin hepar meningkat, mengurangi beban sekresi sel beta pankreas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* Section 5: Evaluasi Akhir 90 Hari */}
                    <Section icon="emoji_events" title="Evaluasi Komprehensif Hari ke-90 (Puncak Program)">
                        {currentDay < 90 ? (
                            <EmptyState message={`Evaluasi Puncak 90 Hari akan dihitung saat program mencapai hari ke-90 (Saat ini hari ke-${currentDay}).`} />
                        ) : glucose30.length > 0 && glucose90.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                                        <p className="text-xs font-mono text-slate-400 uppercase">Awal (Bulan 1)</p>
                                        <p className="text-2xl font-black font-mono text-slate-800 tabular-nums">{avgGluc30.toFixed(1)}</p>
                                        <p className="text-xs text-slate-500">mg/dL</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                                        <p className="text-xs font-mono text-slate-400 uppercase">Akhir (Bulan 3)</p>
                                        <p className={`text-2xl font-black font-mono tabular-nums ${avgGluc90 < avgGluc30 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {avgGluc90.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-slate-500">mg/dL</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center">
                                        <p className="text-xs font-mono text-emerald-700 uppercase font-bold">Diferensial Total</p>
                                        <p className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
                                            {glucoseDiff} <span className="text-xs font-normal">mg/dL</span>
                                        </p>
                                        <p className="text-xs text-emerald-600">Reduksi risiko terkonfirmasi</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyState message="Data glukosa di bulan ke-1 dan bulan ke-3 diperlukan untuk memvalidasi perbandingan akhir program." />
                        )}
                    </Section>

                    {/* Bottom Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => navigate("/rencana")}
                            className="flex-1 py-3.5 rounded-xl bg-[#0062E3] hover:bg-[#0052be] text-white font-bold text-sm shadow-md transition text-center"
                        >
                            Lanjutkan Pelacakan di Rencana 90 Hari
                        </button>
                        <button
                            onClick={() => navigate("/analisis")}
                            className="flex-1 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm shadow-sm transition text-center"
                        >
                            Skrining Ulang Risiko (Mode Lab)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}