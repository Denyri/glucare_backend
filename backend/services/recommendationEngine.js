/**
 * ===============================================================================
 * GLUCARE RECOMMENDATION & PERSONALIZATION ENGINE (CDSS)
 * ===============================================================================
 * Modul pendukung keputusan klinis deterministik berbasis bukti (ADA, WHO, CDC DPP).
 * Bertugas mengevaluasi input skrining (Klinis & Kuesioner), menghitung System
 * Priority Score (SPS), mendeteksi kebutuhan rujukan nakes (Healthcare Referral),
 * dan merumuskan Top 3 Fokus Intervensi Terpersonalisasi tanpa menghakimi pengguna.
 * ===============================================================================
 */

// Kamus 21 Aturan Terstandarisasi
const KNOWLEDGE_BASE_RULES = [
    {
        rule_id: "HR01",
        category: "healthcare_referral",
        factor: "Hiperglikemia Puasa",
        input_var: "glucose_fasting",
        operator: ">=",
        threshold: 126.0,
        unit: "mg/dL",
        severity: "critical", // CSS = 4
        is_referral: true,
        urgency: "urgent",
        recommendation: "Kadar glukosa darah puasa Anda berada di atas ambang batas normal. Disarankan berkonsultasi dengan dokter untuk evaluasi diagnostik konfirmasi.",
        action: "Jadwalkan kunjungan ke fasilitas pelayanan kesehatan untuk pemeriksaan penunjang laboratorium resmi.",
        initial_target: "Konsultasi medis dalam 7-14 hari ke depan.",
        metric: "Status konfirmasi dokter",
        referral_text: "Consider healthcare professional consultation untuk pemeriksaan diagnostik diabetes melitus."
    },
    {
        rule_id: "HR02",
        category: "healthcare_referral",
        factor: "Krisis Hipertensi",
        input_var: "bp_systolic",
        operator: ">=",
        threshold: 180.0,
        unit: "mmHg",
        severity: "critical", // CSS = 4
        is_referral: true,
        urgency: "emergency",
        recommendation: "Peringatan Darurat: Tekanan darah Anda berada pada rentang krisis darurat. Segera cari pertolongan medis.",
        action: "Istirahat tenang 5 menit dan ukur ulang. Jika tetap tinggi, segera kunjungi Instalasi Gawat Darurat (IGD).",
        initial_target: "Akses fasilitas gawat darurat medis segera.",
        metric: "Evaluasi medis IGD",
        referral_text: "Immediately seek emergency medical attention at the nearest emergency department."
    },
    {
        rule_id: "HR03",
        category: "healthcare_referral",
        factor: "Waspada Hipoglikemia",
        input_var: "glucose_fasting",
        operator: "<",
        threshold: 70.0,
        unit: "mg/dL",
        severity: "critical", // CSS = 4
        is_referral: true,
        urgency: "urgent",
        recommendation: "Peringatan: Kadar glukosa darah berada di bawah ambang aman (< 70 mg/dL). Konsumsi karbohidrat cepat serap segera.",
        action: "Terapkan Rule of 15: konsumsi 15g karbohidrat manis (jus buah/air gula), istirahat, dan ukur ulang setelah 15 menit.",
        initial_target: "Pemulihan glukosa di atas 70 mg/dL dalam 15-30 menit.",
        metric: "Glukosa pasca koreksi",
        referral_text: "Consider healthcare professional consultation jika kadar gula tetap di bawah 70 mg/dL setelah 2 siklus koreksi."
    },
    {
        rule_id: "WM01",
        category: "weight_management",
        factor: "Indeks Massa Tubuh (BMI)",
        input_var: "bmi",
        operator: ">=",
        threshold: 23.0,
        unit: "kg/m²",
        severity: "high", // CSS = 3
        is_referral: false,
        recommendation: "Disarankan merencanakan penurunan berat badan bertahap 5% hingga 7% dari berat badan awal secara realistis.",
        action: "Terapkan defisit kalori moderat (300-500 kkal/hari) melalui piring makan bergizi seimbang.",
        initial_target: "Penurunan berat badan bertahap 0.25 - 0.5 kg per minggu.",
        metric: "Berat badan mingguan (kg)"
    },
    {
        rule_id: "WM02",
        category: "weight_management",
        factor: "Lingkar Pinggang Sentral",
        input_var: "waist_cm",
        operator: ">",
        threshold: 90.0, // atau 80 untuk wanita
        unit: "cm",
        severity: "high", // CSS = 3
        is_referral: false,
        recommendation: "Pertimbangkan pemantauan lingkar pinggang berkala untuk mendukung reduksi timbunan lemak visceral organ dalam.",
        action: "Kombinasikan jalan cepat harian dan pembatasan karbohidrat olahan sederhana.",
        initial_target: "Pengurangan lingkar pinggang 1-2 cm dalam 4-6 minggu pertama.",
        metric: "Lingkar pinggang bulanan (cm)"
    },
    {
        rule_id: "PA01",
        category: "physical_activity",
        factor: "Aktivitas Fisik Aerobik",
        input_var: "physically_active",
        operator: "==",
        threshold: 0,
        unit: "status",
        severity: "high", // CSS = 3
        is_referral: false,
        recommendation: "Disarankan meningkatkan aktivitas fisik aerobik intensitas sedang secara bertahap menuju target 150 menit/minggu.",
        action: "Lakukan jalan santai atau jalan cepat terbagi dalam 3-5 hari per minggu.",
        initial_target: "Tambah 15-20 menit jalan kaki per hari, minimal 3-4 hari per minggu.",
        metric: "Akumulasi menit aktivitas per minggu"
    },
    {
        rule_id: "SSB01",
        category: "sugar_sweetened_beverages",
        factor: "Konsumsi Minuman Manis",
        input_var: "poor_diet", // Pada mode kuesioner poor_diet mencakup minuman manis
        operator: "==",
        threshold: 1,
        unit: "status",
        severity: "high", // CSS = 3
        is_referral: false,
        recommendation: "Disarankan mengganti konsumsi minuman berpemanis dengan air putih, infused water, atau teh tanpa gula tambahan.",
        action: "Beralih secara bertahap dari minuman manis kemasan / kopi susu manis ke air mineral.",
        initial_target: "Kurangi konsumsi minuman manis hingga 50% dari frekuensi biasa dalam 14 hari.",
        metric: "Porsi minuman manis per minggu"
    },
    {
        rule_id: "BP01",
        category: "blood_pressure",
        factor: "Tekanan Darah",
        input_var: "bp_systolic",
        operator: ">=",
        threshold: 130.0,
        unit: "mmHg",
        severity: "high", // CSS = 3
        is_referral: true,
        urgency: "routine",
        recommendation: "Disarankan memantau tekanan darah secara berkala dan membatasi asupan natrium harian di bawah 2.000 mg/hari.",
        action: "Kurangi konsumsi garam dapur (< 1 sdt/hari), batasi makanan cepat saji, dan catat tensi mandiri.",
        initial_target: "Catat tensi mandiri 1-2 kali seminggu setelah 5 menit istirahat tenang.",
        metric: "Rerata tensi mingguan",
        referral_text: "Consider healthcare professional consultation jika sistolik konsisten >= 140 mmHg atau diastolik >= 90 mmHg."
    },
    {
        rule_id: "SM01",
        category: "smoking",
        factor: "Status Merokok",
        input_var: "current_smoker",
        operator: "==",
        threshold: 1,
        unit: "status",
        severity: "high", // CSS = 3
        is_referral: true,
        urgency: "routine",
        recommendation: "Disarankan mempertimbangkan program penghentian merokok demi menjaga fungsi metabolik sel beta dan kesehatan vaskular.",
        action: "Catat pemicu rokok harian dan kurangi batang rokok secara terstruktur.",
        initial_target: "Kurangi minimal 25% jumlah batang rokok harian dalam 14 hari pertama.",
        metric: "Jumlah batang rokok per hari",
        referral_text: "Consider healthcare professional consultation atau hubungi layanan Quitline Kemenkes 0-800-177-6565."
    },
    {
        rule_id: "SB01",
        category: "sedentary_behaviour",
        factor: "Durasi Duduk / Inaktif",
        input_var: "sedentary_hours",
        operator: ">=",
        threshold: 8.0,
        unit: "jam/hari",
        severity: "medium", // CSS = 2
        is_referral: false,
        recommendation: "Disarankan membatasi waktu duduk terus-menerus dan menyelingi dengan berdiri atau berjalan ringan setiap 30 menit.",
        action: "Pasang pengingat gerak aktif (active break) 2-3 menit setiap 30 menit duduk saat bekerja.",
        initial_target: "Kurangi waktu duduk 30-60 menit/hari dengan menyelingi jeda aktif berdiri.",
        metric: "Jam duduk harian"
    },
    {
        rule_id: "NU01",
        category: "nutrition_quality",
        factor: "Kualitas Pola Makan",
        input_var: "poor_diet",
        operator: "==",
        threshold: 1,
        unit: "status",
        severity: "medium", // CSS = 2
        is_referral: false,
        recommendation: "Disarankan menerapkan pola piring sehat seimbang (setengah sayur-buah, seperempat karbohidrat kompleks, seperempat protein).",
        action: "Terapkan panduan piring T (Plate Method) pada waktu makan siang dan makan malam.",
        initial_target: "Terapkan komposisi piring sehat pada minimal 1 waktu makan utama per hari.",
        metric: "Kepatuhan piring sehat harian"
    },
    {
        rule_id: "SL01",
        category: "sleep_recovery",
        factor: "Durasi Tidur",
        input_var: "sleep_hours",
        operator: "<",
        threshold: 7.0,
        unit: "jam/malam",
        severity: "medium", // CSS = 2
        is_referral: false,
        recommendation: "Disarankan menjaga durasi tidur optimal 7 hingga 9 jam setiap malam untuk mendukung homeostasis glukosa dan regulasi nafsu makan.",
        action: "Terapkan sleep hygiene teratur (jadwal tidur tetap, bebas layar gawai 30 menit sebelum tidur).",
        initial_target: "Tambahkan waktu tidur 30 menit per malam menuju rentang minimal 7 jam.",
        metric: "Rerata jam tidur malam"
    }
];

function getSeverityScore(severity) {
    switch (severity) {
        case "critical": return 4;
        case "high": return 3;
        case "medium": return 2;
        case "low": return 1;
        default: return 1;
    }
}

/**
 * Menghitung Behavior Gap Score (BGS)
 */
function calculateBehaviorGap(userVal, threshold, operator) {
    if (userVal === undefined || userVal === null) return 1;

    // Untuk variabel biner (status ya/tidak)
    if (operator === "==") {
        return userVal == threshold ? 2 : 0;
    }

    if (operator === ">=" || operator === ">") {
        const gapRatio = (userVal - threshold) / (threshold || 1);
        if (gapRatio >= 0.5) return 3; // Large gap
        if (gapRatio >= 0.2) return 2; // Moderate gap
        return 1; // Small gap
    }

    if (operator === "<" || operator === "<=") {
        const gapRatio = (threshold - userVal) / (threshold || 1);
        if (gapRatio >= 0.5) return 3;
        if (gapRatio >= 0.2) return 2;
        return 1;
    }

    return 1;
}

/**
 * Evaluasi 21 Rules dan hasilkan Top 3 Rekomendasi Terpersonalisasi
 * @param {Object} rawParams - Parameter klinis atau kuesioner pengguna
 * @param {string} riskLevel - 'Normal' | 'Prediabetes' | 'Diabetes'
 * @param {number} mlScore - Skor probabilitas dari model ML (0 - 100)
 * @param {string} mode - 'clinical' | 'questionnaire'
 */
function evaluateKnowledgeBase(rawParams = {}, riskLevel = "Normal", mlScore = 25, mode = "clinical") {
    const params = { ...rawParams };

    // Standardisasi field input jika ada variasi penamaan
    if (params.glucose_fasting === undefined && params.gdp !== undefined) params.glucose_fasting = params.gdp;
    if (params.bp_systolic === undefined && params.tensi_sistolik !== undefined) params.bp_systolic = params.tensi_sistolik;
    if (params.current_smoker === undefined && params.merokok !== undefined) params.current_smoker = params.merokok === 1 || params.merokok === "ya" ? 1 : 0;
    if (params.physically_active === undefined && params.olahraga !== undefined) params.physically_active = params.olahraga === "aktif" || params.olahraga === 1 ? 1 : 0;

    // Normalisasi lingkar pinggang berdasarkan gender
    const isFemale = params.gender === 2 || params.gender === "2" || params.gender === "Perempuan" || params.gender === "P";
    const waistThreshold = isFemale ? 80.0 : 90.0;

    const triggered = [];
    let safetyAlert = null;

    // Tentukan ML Risk Modifier
    let mlModifier = 0;
    if (riskLevel === "Diabetes" || mlScore >= 60) mlModifier = 2;
    else if (riskLevel === "Prediabetes" || mlScore >= 30) mlModifier = 1;

    for (const rule of KNOWLEDGE_BASE_RULES) {
        let userVal = params[rule.input_var];

        // Khusus lingkar pinggang, gunakan threshold dinamis gender
        let activeThreshold = rule.threshold;
        if (rule.rule_id === "WM02") {
            activeThreshold = waistThreshold;
        }

        // Khusus kuesioner bmi_category
        if (rule.rule_id === "WM01" && mode === "questionnaire" && params.bmi === undefined) {
            if (params.bmi_category >= 1) userVal = 25.0; // Overweight/Obesitas
        }
        if (rule.rule_id === "WM02" && mode === "questionnaire" && params.waist_cm === undefined) {
            if (params.waist_category === 1) userVal = activeThreshold + 5.0;
        }

        if (userVal === undefined || userVal === null) continue;

        let isHit = false;
        if (rule.operator === ">=" && Number(userVal) >= activeThreshold) isHit = true;
        else if (rule.operator === ">" && Number(userVal) > activeThreshold) isHit = true;
        else if (rule.operator === "<=" && Number(userVal) <= activeThreshold) isHit = true;
        else if (rule.operator === "<" && Number(userVal) < activeThreshold) isHit = true;
        else if (rule.operator === "==" && Number(userVal) == activeThreshold) isHit = true;

        if (isHit) {
            const css = getSeverityScore(rule.severity);
            const bgs = calculateBehaviorGap(userVal, activeThreshold, rule.operator);
            const safetyModifier = rule.is_referral ? 3 : 0;

            // Rumus System Priority Score (SPS)
            const priorityScore = (css * 2) + bgs + mlModifier + safetyModifier;

            const triggerItem = {
                rule_id: rule.rule_id,
                category: rule.category,
                factor: rule.factor,
                severity: rule.severity,
                priority_score: priorityScore,
                is_referral: rule.is_referral,
                urgency: rule.urgency || "none",
                recommendation: rule.recommendation,
                action: rule.action,
                initial_target: rule.initial_target,
                metric: rule.metric,
                referral_text: rule.referral_text || null,
                user_value: userVal
            };

            triggered.push(triggerItem);

            // Cek kondisi rujukan medis kritis
            if (rule.severity === "critical" && !safetyAlert) {
                safetyAlert = {
                    rule_id: rule.rule_id,
                    urgency: rule.urgency,
                    title: rule.factor,
                    message: rule.referral_text || rule.recommendation,
                    action: rule.action
                };
            }
        }
    }

    // Urutkan berdasarkan Priority Score tertinggi
    triggered.sort((a, b) => b.priority_score - a.priority_score);

    // Filter Top 3 dengan pembatasan diversitas kategori (Maksimal 1 per kategori)
    const top3 = [];
    const usedCategories = new Set();

    for (const item of triggered) {
        // Jangan masukkan referral rule murni ke dalam kartu target perilaku 90 hari jika sudah ada di alert
        if (item.severity === "critical") continue;

        if (!usedCategories.has(item.category)) {
            top3.push({
                rank: top3.length + 1,
                rule_id: item.rule_id,
                category: item.category,
                factor: item.factor,
                priority_score: item.priority_score,
                recommendation: item.recommendation,
                action: item.action,
                target: item.initial_target,
                metric: item.metric
            });
            usedCategories.add(item.category);
        }
        if (top3.length === 3) break;
    }

    // Fallback jika faktor bermasalah kurang dari 3 (pengguna relatif sehat)
    if (top3.length < 3) {
        const fallbacks = [
            {
                rank: top3.length + 1,
                rule_id: "PA01",
                category: "physical_activity",
                factor: "Konsistensi Gerak Harian",
                priority_score: 5,
                recommendation: "Pertahankan kebiasaan aktif Anda dengan rutin berjalan santai minimal 30 menit per hari.",
                action: "Jalan santai terbagi dalam 3-5 hari per minggu.",
                target: "30 menit jalan santai, 4 hari/minggu.",
                metric: "Menit jalan kaki harian"
            },
            {
                rank: top3.length + 2,
                rule_id: "NU01",
                category: "nutrition_quality",
                factor: "Keseimbangan Piring Sehat",
                priority_score: 4,
                recommendation: "Pertahankan konsumsi serat alami dari sayur dan buah utuh untuk menjaga sensitivitas insulin.",
                action: "Terapkan panduan piring gizi seimbang pada makan siang dan malam.",
                target: "1 porsi sayuran segar pada setiap waktu makan besar.",
                metric: "Kepatuhan log makanan"
            },
            {
                rank: top3.length + 3,
                rule_id: "SL01",
                category: "sleep_recovery",
                factor: "Kualitas Ritme Tidur",
                priority_score: 3,
                recommendation: "Tidur cukup 7-8 jam per malam membantu mencegah lonjakan hormon kortisol pagi hari.",
                action: "Jadwalkan waktu tidur dan bangun yang konsisten setiap hari.",
                target: "Tidur 7.5 jam setiap malam.",
                metric: "Jam tidur malam"
            }
        ];

        for (const fb of fallbacks) {
            if (!usedCategories.has(fb.category) && top3.length < 3) {
                fb.rank = top3.length + 1;
                top3.push(fb);
                usedCategories.add(fb.category);
            }
        }
    }

    return {
        top_3_priorities: top3,
        safety_alert: safetyAlert,
        triggered_rules_count: triggered.length,
        all_triggered_rules: triggered.map(t => ({ rule_id: t.rule_id, factor: t.factor, score: t.priority_score })),
        evaluation_timestamp: new Date().toISOString()
    };
}

module.exports = {
    evaluateKnowledgeBase,
    KNOWLEDGE_BASE_RULES
};
