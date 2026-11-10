const axios = require("axios");
const db = require("../config/db");
const recommendationEngine = require("./recommendationEngine");

const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

/**
 * UI Generator for Clinical/Lab Mode
 */
function generateClinicalUI(aiResult, clinicalParams) {
    let aiScore = 25;
    let riskLevel = "Normal";

    if (aiResult && aiResult.score !== undefined) {
        aiScore = aiResult.score;
        if (aiResult.risk_level) riskLevel = aiResult.risk_level;
    } else if (aiResult && aiResult.predict_proba) {
        let proba = aiResult.predict_proba;
        if (Array.isArray(proba) && proba.length > 0 && Array.isArray(proba[0])) {
            proba = proba[0];
        }
        if (Array.isArray(proba) && proba.length >= 3) {
            aiScore = Math.round((proba[1] + proba[2]) * 100);
        } else if (Array.isArray(proba) && proba.length === 2) {
            aiScore = Math.round(proba[1] * 100);
        }
    }

    if (aiScore >= 60) riskLevel = "Diabetes";
    else if (aiScore >= 30) riskLevel = "Prediabetes";

    let riskStatus = "Rendah";
    let riskDescription = "Normal / Aman";
    let riskColor = "0xFF10B981"; // Green

    if (riskLevel === "Diabetes") {
        riskStatus = "Tinggi";
        riskDescription = "Indikasi Diabetes";
        riskColor = "0xFFEF4444"; // Red
    } else if (riskLevel === "Prediabetes") {
        riskStatus = "Sedang";
        riskDescription = "Indikasi Prediabetes";
        riskColor = "0xFFF59E0B"; // Orange
    }

    let faktorRisiko = [];
    const gdpVal = clinicalParams.glucose_fasting || 0;
    const bmiVal = clinicalParams.bmi || 0;
    const tgHdl = clinicalParams.tg_hdl_ratio || 0;
    const sistolikVal = clinicalParams.bp_systolic || 0;
    const diastolikVal = clinicalParams.bp_diastolic || 0;
    const lingkarPinggang = clinicalParams.waist_cm || 0;

    if (gdpVal >= 126) faktorRisiko.push({ text: `Gula Darah Puasa (${Math.round(gdpVal)} mg/dL) mengindikasikan level Diabetes.`, isWarning: true });
    else if (gdpVal >= 100) faktorRisiko.push({ text: `Gula Darah Puasa (${Math.round(gdpVal)} mg/dL) berada di zona Prediabetes.`, isWarning: true });

    if (bmiVal >= 27.5) faktorRisiko.push({ text: `Kategori BMI Obesitas (${bmiVal.toFixed(1)}) meningkatkan risiko metabolik secara signifikan.`, isWarning: true });
    else if (bmiVal >= 23) faktorRisiko.push({ text: `Kategori BMI Overweight (${bmiVal.toFixed(1)}) memicu risiko metabolik.`, isWarning: true });

    if (tgHdl >= 3) faktorRisiko.push({ text: `Rasio TG/HDL tinggi (${tgHdl.toFixed(1)}) mengindikasikan kemungkinan resistensi insulin.`, isWarning: true });
    if (sistolikVal >= 130 || diastolikVal >= 85) faktorRisiko.push({ text: `Tekanan darah (${Math.round(sistolikVal)}/${Math.round(diastolikVal)} mmHg) berada di atas rentang optimal.`, isWarning: true });

    if (lingkarPinggang > 90) faktorRisiko.push({ text: `Lingkar pinggang (${Math.round(lingkarPinggang)} cm) berisiko tinggi.`, isWarning: true });

    if (faktorRisiko.length === 0) faktorRisiko.push({ text: 'Tidak ada parameter klinis spesifik yang memicu risiko tinggi.', isWarning: false });

    let insight = "Analisis AI menunjukkan metabolisme glukosa dan parameter kesehatan Anda dalam rentang optimal. Pertahankan gaya hidup sehat untuk pencegahan jangka panjang.";
    if (riskLevel === "Diabetes") {
        insight = "Analisis AI mendeteksi parameter yang mengarah pada intoleransi glukosa atau diabetes. Intervensi gaya hidup terstruktur dan pendampingan rutin disarankan untuk mengendalikan glukosa darah.";
    } else if (riskLevel === "Prediabetes") {
        insight = "Analisis AI mendeteksi tanda dini resistensi insulin (Prediabetes). Anda berada di fase emas: dengan Program 90 Hari menjaga pola tidur, aktivitas fisik, dan nutrisi, kadar gula darah sangat berpeluang kembali normal.";
    }

    let sleepTarget = 7.5;
    let walkTarget = 30;
    let nutritionTarget = "Pola Makan Gizi Seimbang & Hidrasi Optimal";

    if (riskLevel === "Diabetes") {
        sleepTarget = 8.0;
        walkTarget = 45;
        nutritionTarget = "Defisit Kalori Terpantau, Batasi Karbohidrat Sederhana, Serat >= 35g/hari";
    } else if (riskLevel === "Prediabetes") {
        sleepTarget = 7.5;
        walkTarget = 40;
        nutritionTarget = "Defisit Kalori Ringan, Makanan Indeks Glikemik Rendah, Serat >= 30g/hari";
    }

    const aiRecommendation = {
        sleep_target_hours: sleepTarget,
        walking_target_minutes: walkTarget,
        nutrition_goal: nutritionTarget,
        pillars: [
            {
                pillar: "Tidur Restoratif",
                target: `${sleepTarget} Jam / Malam`,
                benefit: "Menurunkan resistensi insulin & kadar kortisol malam hari"
            },
            {
                pillar: "Aktivitas Fisik",
                target: `${walkTarget} Menit Jalan Cepat / Hari`,
                benefit: "Merangsang translokasi transporter glukosa GLUT4 tanpa ketergantungan insulin"
            },
            {
                pillar: "Nutrisi Metabolik",
                target: nutritionTarget,
                benefit: "Menstabilkan glukosa postprandial & menjaga sensitivitas sel beta pankreas"
            }
        ]
    };

    const cdssResult = recommendationEngine.evaluateKnowledgeBase(clinicalParams, riskLevel, aiScore, "clinical");

    return {
        score: aiScore,
        riskLevel: riskLevel,
        riskStatus: riskStatus,
        riskDescription: riskDescription,
        riskColor: riskColor,
        faktorRisiko: faktorRisiko,
        insight: aiResult?.insight || aiResult?.explanation || aiResult?.summary || insight,
        cta: aiResult?.cta || "Jaga pola makan dan aktivitas fisik dengan konsisten.",
        ai_recommendation: aiRecommendation,
        top_3_priorities: cdssResult.top_3_priorities,
        safety_alert: cdssResult.safety_alert,
        cdss_evaluation: cdssResult
    };
}

/**
 * UI Generator for Questionnaire Mode
 */
function generateQuestionnaireUI(aiResult, questionnaireParams) {
    let aiScore = 25;
    let riskLevel = "Normal";

    if (aiResult?.score !== undefined && aiResult?.score !== null) {
        aiScore = aiResult.score;
    } else if (aiResult && aiResult.predict_proba) {
        let proba = aiResult.predict_proba;
        if (Array.isArray(proba) && proba.length > 0 && Array.isArray(proba[0])) {
            proba = proba[0];
        }
        if (Array.isArray(proba) && proba.length >= 2) {
            aiScore = Math.round(proba[1] * 100);
        }
    } else {
        let pred = aiResult?.prediction;
        if (Array.isArray(pred) && pred.length > 0) pred = pred[0];
        if (pred == 2 || pred == "Diabetes") aiScore = 85;
        else if (pred == 1 || pred == "Prediabetes") aiScore = 55;
    }

    if (aiResult?.risk_level) {
        riskLevel = aiResult.risk_level;
    } else if (aiScore >= 60) {
        riskLevel = "Diabetes";
    } else if (aiScore >= 30) {
        riskLevel = "Prediabetes";
    }

    let riskStatus = "Rendah";
    let riskDescription = "Normal / Aman";
    let riskColor = "0xFF10B981"; // Green

    if (riskLevel === "Diabetes") {
        riskStatus = "Tinggi";
        riskDescription = "Indikasi Diabetes";
        riskColor = "0xFFEF4444"; // Red
    } else if (riskLevel === "Prediabetes") {
        riskStatus = "Sedang";
        riskDescription = "Indikasi Prediabetes";
        riskColor = "0xFFF59E0B"; // Orange
    }

    let faktorRisiko = [];
    const bmiCat = questionnaireParams.bmi_category || 0;
    const waistCat = questionnaireParams.waist_category || 0;
    const hyper = questionnaireParams.hypertension || 0;
    const owHist = questionnaireParams.overweight_history || 0;
    const diabHist = questionnaireParams.diabetes_history || 0;
    const predTold = questionnaireParams.prediabetes_told || 0;
    const predHist = questionnaireParams.prediabetes_history || 0;
    const physActive = questionnaireParams.physically_active !== undefined ? questionnaireParams.physically_active : 1;
    const sedHours = questionnaireParams.sedentary_hours || 0;
    const smoker = questionnaireParams.current_smoker || 0;
    const poorDiet = questionnaireParams.poor_diet || 0;

    if (bmiCat === 1) faktorRisiko.push({ text: 'Kategori BMI Overweight', isWarning: true });
    else if (bmiCat === 2) faktorRisiko.push({ text: 'Kategori BMI Obesitas (Resistensi Insulin Tinggi)', isWarning: true });
    
    if (waistCat === 1) faktorRisiko.push({ text: 'Lingkar pinggang berisiko (Adipositas Visceral)', isWarning: true });
    if (hyper === 1) faktorRisiko.push({ text: 'Riwayat tekanan darah tinggi / hipertensi', isWarning: true });
    if (diabHist === 1 || predTold === 1 || predHist === 1) faktorRisiko.push({ text: 'Riwayat borderline/prediabetes atau genetik keluarga', isWarning: true });
    if (physActive === 0) faktorRisiko.push({ text: 'Aktivitas fisik kurang aktif (<150 menit/minggu WHO)', isWarning: true });
    if (sedHours >= 8) faktorRisiko.push({ text: `Durasi duduk/sedentari tinggi (${sedHours} jam/hari)`, isWarning: true });
    if (smoker === 1) faktorRisiko.push({ text: 'Perokok aktif (memicu inflamasi & stres metabolik)', isWarning: true });
    if (poorDiet === 1) faktorRisiko.push({ text: 'Pola makan sering olahan / tinggi gula & cepat saji', isWarning: true });
    if (owHist === 1 && bmiCat === 0) faktorRisiko.push({ text: 'Pernah memiliki riwayat kelebihan berat badan', isWarning: true });

    if (faktorRisiko.length === 0) faktorRisiko.push({ text: 'Gaya hidup relatif sehat dan aktif', isWarning: false });

    let insight = "Analisis AI menunjukkan parameter kebiasaan dan profil kesehatan Anda dalam rentang optimal. Pertahankan pola hidup aktif dan seimbang.";
    if (riskLevel === "Diabetes") {
        insight = "Analisis AI berdasarkan pola kebiasaan mendeteksi risiko tinggi terhadap gangguan metabolisme glukosa. Mulai perubahan kebiasaan secara disiplin untuk menurunkan risiko komplikasi.";
    } else if (riskLevel === "Prediabetes") {
        insight = "Analisis AI mendeteksi risiko menengah (Prediabetes) berdasarkan kebiasaan dan parameter fisik Anda. Program gaya hidup 90 Hari akan membantu mengembalikan metabolisme tubuh Anda ke jalur yang sehat.";
    }

    let sleepTarget = 7.5;
    let walkTarget = 30;
    let nutritionTarget = "Pola Makan Gizi Seimbang & Hidrasi Optimal";

    if (riskLevel === "Diabetes") {
        sleepTarget = 8.0;
        walkTarget = 45;
        nutritionTarget = "Defisit Kalori Terpantau, Batasi Karbohidrat Sederhana, Serat >= 35g/hari";
    } else if (riskLevel === "Prediabetes") {
        sleepTarget = 7.5;
        walkTarget = 40;
        nutritionTarget = "Defisit Kalori Ringan, Makanan Indeks Glikemik Rendah, Serat >= 30g/hari";
    }

    const aiRecommendation = {
        sleep_target_hours: sleepTarget,
        walking_target_minutes: walkTarget,
        nutrition_goal: nutritionTarget,
        pillars: [
            {
                pillar: "Tidur Restoratif",
                target: `${sleepTarget} Jam / Malam`,
                benefit: "Menurunkan resistensi insulin & kadar kortisol malam hari"
            },
            {
                pillar: "Aktivitas Fisik",
                target: `${walkTarget} Menit Jalan Cepat / Hari`,
                benefit: "Merangsang translokasi transporter glukosa GLUT4 tanpa ketergantungan insulin"
            },
            {
                pillar: "Nutrisi Metabolik",
                target: nutritionTarget,
                benefit: "Menstabilkan glukosa postprandial & menjaga sensitivitas sel beta pankreas"
            }
        ]
    };

    const cdssResult = recommendationEngine.evaluateKnowledgeBase(questionnaireParams, riskLevel, aiScore, "questionnaire");

    return {
        score: aiScore,
        riskLevel: riskLevel,
        riskStatus: riskStatus,
        riskDescription: riskDescription,
        riskColor: riskColor,
        faktorRisiko: faktorRisiko,
        insight: aiResult?.insight || aiResult?.explanation || aiResult?.summary || insight,
        cta: aiResult?.cta || "Jaga pola makan dan aktivitas fisik dengan konsisten.",
        ai_recommendation: aiRecommendation,
        top_3_priorities: cdssResult.top_3_priorities,
        safety_alert: cdssResult.safety_alert,
        cdss_evaluation: cdssResult
    };
}

/**
/**
 * Predict Clinical (Mode Lab)
 */
const predictClinical = async (data) => {
    const uid = String(data.user_id);

    // Ambil profil usia & gender dari DB jika tidak disediakan
    const [users] = await db.promise().query(
        "SELECT birth_date, gender FROM users WHERE id = ?",
        [uid]
    );

    let defaultAge = 30;
    let defaultGender = 1;

    if (users.length > 0) {
        const user = users[0];
        if (user.birth_date) {
            const birthYear = new Date(user.birth_date).getFullYear();
            const currentYear = new Date().getFullYear();
            defaultAge = currentYear - birthYear;
        }
        if (user.gender === "Perempuan" || user.gender === "0" || user.gender === 0) {
            defaultGender = 0;
        }
    }

    const age = data.age !== undefined ? parseInt(data.age) : defaultAge;
    const gender = data.gender !== undefined
        ? (data.gender === "Perempuan" || data.gender === 0 || data.gender === "0" ? 0 : 1)
        : defaultGender;

    const bb = parseFloat(data.berat_badan !== undefined ? data.berat_badan : (data.weight || 0)) || 0;
    const tb = parseFloat(data.tinggi_badan !== undefined ? data.tinggi_badan : (data.height || 0)) || 0;
    const tbM = tb / 100;
    const calculatedBmi = tbM > 0 ? parseFloat((bb / (tbM * tbM)).toFixed(2)) : 25;
    const bmi = data.bmi !== undefined ? parseFloat(data.bmi) : calculatedBmi;

    const waist_cm = parseFloat(data.lingkar_pinggang !== undefined ? data.lingkar_pinggang : (data.waist_cm || 90)) || 90;
    const hdlVal = parseFloat(data.hdl) || 50;
    const triglycerides = parseFloat(data.trigliserida !== undefined ? data.trigliserida : (data.triglycerides || 150)) || 150;
    const bp_systolic = parseFloat(data.tekanan_sistolik !== undefined ? data.tekanan_sistolik : (data.bp_systolic || 120)) || 120;
    const bp_diastolic = parseFloat(data.tekanan_diastolik !== undefined ? data.tekanan_diastolik : (data.bp_diastolic || 80)) || 80;
    const glucose_fasting = parseFloat(data.gula_darah_puasa !== undefined ? data.gula_darah_puasa : (data.glucose_fasting || 0)) || 0;

    const map_pressure = parseFloat(((bp_systolic + 2 * bp_diastolic) / 3).toFixed(2));
    const tg_hdl_ratio = parseFloat((triglycerides / (hdlVal > 0 ? hdlVal : 1)).toFixed(2));

    const clinicalParams = {
        glucose_fasting,
        age,
        waist_cm,
        bmi,
        hdl: hdlVal,
        triglycerides,
        bp_systolic,
        bp_diastolic,
        gender,
        map_pressure,
        tg_hdl_ratio
    };

    const aiResponse = await axios.post(
        `${AI_BASE_URL}/predict/clinical`,
        clinicalParams,
        { timeout: 30000 }
    );

    const aiResult = aiResponse.data;

    // Simpan ke lab_results secara sinkron
    try {
        const sqlInsert = `
            INSERT INTO lab_results (
                user_id, hba1c, gula_darah_puasa,
                berat_badan, tinggi_badan, riwayat_keluarga, riwayat_diabetes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.promise().query(sqlInsert, [
            uid,
            parseFloat(data.hba1c) || 0,
            glucose_fasting,
            bb,
            tb,
            data.riwayat_keluarga || "",
            data.riwayat_diabetes || ""
        ]);
    } catch (err) {
        console.error("[AI Clinical] Gagal simpan ke lab_results:", err.message);
    }

    const ui_data = generateClinicalUI(aiResult, clinicalParams);

    const finalPayload = {
        mode: "clinical",
        aiResult: aiResult,
        ui_data: ui_data,
        ai_recommendation: ui_data.ai_recommendation,
        clinicalParams: {
            ...clinicalParams,
            hba1c: parseFloat(data.hba1c) || 0,
            berat_badan: bb,
            tinggi_badan: tb,
            riwayat_keluarga: data.riwayat_keluarga || "",
            riwayat_diabetes: data.riwayat_diabetes || ""
        },
        timestamp: new Date().toISOString()
    };

    // Simpan ke analysis_results secara sinkron
    try {
        const sqlUpsertAnalysis = `
            INSERT INTO analysis_results (user_id, mode, result_data)
            VALUES (?, 'clinical', ?)
        `;
        await db.promise().query(sqlUpsertAnalysis, [uid, JSON.stringify(finalPayload)]);
    } catch (err) {
        console.error("[AI Clinical] Gagal simpan analysis_results:", err.message);
    }

    return finalPayload;
};

/**
 * Predict Questionnaire (Mode Kuesioner)
 */
const predictQuestionnaire = async (data) => {
    const { user_id, answers } = data;
    const uid = String(user_id);

    const [users] = await db.promise().query(
        "SELECT gender, birth_date FROM users WHERE id = ?",
        [uid]
    );

    let gender = 1; // 1: Laki-laki, 2: Perempuan (NHANES encoding)
    let ageBand = 0; // 0: <30, 1: 30-39
    if (users.length > 0) {
        const user = users[0];
        if (user.gender === "Perempuan" || user.gender === "2" || user.gender === 2) {
            gender = 2;
        } else if (user.gender === "Laki-laki" || user.gender === "1" || user.gender === 1) {
            gender = 1;
        }
        if (user.birth_date) {
            const birthYear = new Date(user.birth_date).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;
            if (age >= 30) ageBand = 1;
        }
    }

    let questionnaireParams;

    // Case 1: Direct parameters provided (e.g. from Kuesioner.jsx or Swagger)
    if (data.bmi_category !== undefined || data.waist_category !== undefined) {
        const bmiCat = parseInt(data.bmi_category) || 0;
        const waistCat = parseInt(data.waist_category) || 0;
        const hyper = parseInt(data.hypertension) || 0;
        const ow = data.overweight_history !== undefined ? parseInt(data.overweight_history) : (bmiCat > 0 ? 1 : 0);
        const ab = data.age_band !== undefined ? parseInt(data.age_band) : ageBand;
        const g = data.gender !== undefined ? (parseInt(data.gender) === 1 ? 1 : 2) : gender;

        const diabHist = parseInt(data.diabetes_history) || 0;
        const predTold = parseInt(data.prediabetes_told) || 0;
        const predHist = parseInt(data.prediabetes_history) || 0;
        const physActive = data.physically_active !== undefined ? parseInt(data.physically_active) : 1;
        const sedHours = data.sedentary_hours !== undefined ? parseFloat(data.sedentary_hours) : 6.0;
        const smoker = parseInt(data.current_smoker) || 0;
        const poorDiet = parseInt(data.poor_diet) || 0;

        questionnaireParams = {
            age_band: ab,
            gender: g,
            bmi_category: bmiCat,
            waist_category: waistCat,
            hypertension: hyper,
            diabetes_history: diabHist,
            prediabetes_told: predTold,
            prediabetes_history: predHist,
            physically_active: physActive,
            sedentary_hours: sedHours,
            current_smoker: smoker,
            poor_diet: poorDiet,
            overweight_history: ow
        };
    } else if (Array.isArray(answers)) {
        // Case 2: Array of text answers
        const age_band = (answers[0] === "30-39 Tahun" || answers[0] === ">=40 Tahun") ? 1 : 0;
        const ansGender = answers[1] === "Perempuan" ? 2 : 1;
        const bmi_cat = answers[2] === "Normal" ? 0 : (answers[2] === "Overweight" ? 1 : 2);
        const waist_val = answers[3] === "Normal" ? 0 : 1;
        const hypertension = answers[4] === "Ya" ? 1 : 0;
        const family_pred = (answers[5] === "Ya" || answers[5] === "Ada") ? 1 : 0;
        const phys_active = answers[6] === "Kurang Aktif" ? 0 : 1;
        const sed_hours = answers[7] === "> 8 Jam" ? 10.0 : (answers[7] === "6 - 8 Jam" ? 7.0 : 4.0);
        const is_smoker = answers[8] === "Ya" ? 1 : 0;
        const diet_poor = answers[9] === "Kurang Sehat" ? 1 : 0;

        questionnaireParams = {
            age_band: age_band,
            gender: ansGender,
            bmi_category: bmi_cat,
            waist_category: waist_val,
            hypertension: hypertension,
            diabetes_history: family_pred,
            prediabetes_told: family_pred,
            prediabetes_history: family_pred,
            physically_active: phys_active,
            sedentary_hours: sed_hours,
            current_smoker: is_smoker,
            poor_diet: diet_poor,
            overweight_history: bmi_cat > 0 ? 1 : 0
        };
    } else if (typeof answers === "object" && answers !== null) {
        // Case 3: Object of answers (e.g. from test script / key-value map)
        const bmiCat = (answers.bmi === "overweight" || answers.bmi_category === 1) ? 1
            : (answers.bmi === "obesity" || answers.bmi === "obesitas" || answers.bmi_category === 2) ? 2 : 0;
        const waistCat = (answers.lingkar_pinggang === "besar" || answers.lingkar_pinggang === "berisiko" || answers.waist_category === 1) ? 1 : 0;
        const hyper = (answers.hipertensi === "ya" || answers.hypertension === 1) ? 1 : 0;
        const ow = (answers.riwayat_keluarga === "ya" || answers.overweight_history === 1 || bmiCat > 0) ? 1 : 0;

        const diabHist = (answers.diabetes_history === 1 || answers.riwayat_diabetes === "ya") ? 1 : 0;
        const predTold = (answers.prediabetes_told === 1 || answers.pernah_borderline === "ya") ? 1 : 0;
        const predHist = (answers.prediabetes_history === 1 || answers.riwayat_prediabetes === "ya" || answers.riwayat_keluarga === "ya") ? 1 : 0;
        const physActive = (answers.physically_active === 0 || answers.olahraga === "kurang" || answers.olahraga === "tidak") ? 0 : 1;
        const sedHours = answers.sedentary_hours !== undefined ? parseFloat(answers.sedentary_hours) : (answers.duduk === "lama" ? 9.0 : 6.0);
        const smoker = (answers.current_smoker === 1 || answers.merokok === "ya") ? 1 : 0;
        const poorDiet = (answers.poor_diet === 1 || answers.pola_makan === "buruk" || answers.makanan_manis === "sering") ? 1 : 0;

        questionnaireParams = {
            age_band: answers.age_band !== undefined ? parseInt(answers.age_band) : ageBand,
            gender: answers.gender !== undefined ? (parseInt(answers.gender) === 1 ? 1 : 2) : gender,
            bmi_category: bmiCat,
            waist_category: waistCat,
            hypertension: hyper,
            diabetes_history: diabHist,
            prediabetes_told: predTold,
            prediabetes_history: predHist,
            physically_active: physActive,
            sedentary_hours: sedHours,
            current_smoker: smoker,
            poor_diet: poorDiet,
            overweight_history: ow
        };
    } else {
        questionnaireParams = {
            age_band: ageBand,
            gender: gender,
            bmi_category: 0,
            waist_category: 0,
            hypertension: 0,
            diabetes_history: 0,
            prediabetes_told: 0,
            prediabetes_history: 0,
            physically_active: 1,
            sedentary_hours: 6.0,
            current_smoker: 0,
            poor_diet: 0,
            overweight_history: 0
        };
    }

    const aiResponse = await axios.post(
        `${AI_BASE_URL}/predict/questionnaire`,
        questionnaireParams,
        { timeout: 30000 }
    );

    const aiResult = aiResponse.data;

    // Simpan ke questionnaires
    try {
        const sqlInsert = `
            INSERT INTO questionnaires (
                user_id, usia, riwayat_keluarga, olahraga,
                makanan_manis, lingkar_pinggang, gejala_diabetes,
                jam_tidur, tingkat_stress
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const ansArr = Array.isArray(answers) ? answers : [];
        await db.promise().query(sqlInsert, [
            uid,
            ansArr[0] || "",
            ansArr[1] || "",
            ansArr[2] || "",
            ansArr[3] || "",
            ansArr[4] || "",
            ansArr[5] || "",
            ansArr[6] || "",
            ansArr[7] || ""
        ]);
    } catch (err) {
        console.error("[AI Kuesioner] Gagal simpan ke DB:", err.message);
    }

    const ui_data = generateQuestionnaireUI(aiResult, questionnaireParams);

    const finalPayload = {
        mode: "questionnaire",
        aiResult: aiResult,
        ui_data: ui_data,
        ai_recommendation: ui_data.ai_recommendation,
        answers: answers || questionnaireParams,
        questionnaireParams,
        timestamp: new Date().toISOString()
    };

    // Simpan ke analysis_results secara sinkron
    try {
        const sqlUpsertAnalysis = `
            INSERT INTO analysis_results (user_id, mode, result_data)
            VALUES (?, 'questionnaire', ?)
        `;
        await db.promise().query(sqlUpsertAnalysis, [uid, JSON.stringify(finalPayload)]);
    } catch (err) {
        console.error("[AI Kuesioner] Gagal simpan analysis_results:", err.message);
    }

    return finalPayload;
};

/**
 * Get Latest Analysis Result (supports filtering by mode)
 */
const getLatestAnalysisResult = async (user_id, mode = null) => {
    const uid = String(user_id);
    let sql = "SELECT mode, result_data, created_at FROM analysis_results WHERE user_id = ?";
    const params = [uid];

    if (mode && (mode === "clinical" || mode === "questionnaire")) {
        sql += " AND mode = ?";
        params.push(mode);
    }

    sql += " ORDER BY id DESC LIMIT 1";

    const [results] = await db.promise().query(sql, params);

    if (results.length === 0) {
        return null;
    }

    const data = results[0];
    let payload = {};
    try {
        payload = typeof data.result_data === 'string' ? JSON.parse(data.result_data) : data.result_data;
    } catch(e) {
        payload = data.result_data;
    }

    return {
        mode: data.mode,
        ...payload,
        saved_at: data.created_at
    };
};

/**
 * Get Analysis History (supports filtering by mode)
 */
const getAnalysisHistory = async (user_id, mode = null) => {
    const uid = String(user_id);
    let sql = "SELECT id, mode, result_data, created_at FROM analysis_results WHERE user_id = ?";
    const params = [uid];

    if (mode && (mode === "clinical" || mode === "questionnaire")) {
        sql += " AND mode = ?";
        params.push(mode);
    }

    sql += " ORDER BY id DESC";

    const [results] = await db.promise().query(sql, params);

    return results.map(data => {
        let payload = {};
        try {
            payload = typeof data.result_data === 'string' ? JSON.parse(data.result_data) : data.result_data;
        } catch(e) {
            payload = data.result_data;
        }
        return {
            id: data.id,
            mode: data.mode,
            ...payload,
            saved_at: data.created_at
        };
    });
};

module.exports = {
    predictClinical,
    predictQuestionnaire,
    getLatestAnalysisResult,
    getAnalysisHistory,
    generateClinicalUI,
    generateQuestionnaireUI
};
