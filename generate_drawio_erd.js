const fs = require('fs');
const path = require('path');

let nextId = 100;
function getId() {
    return String(nextId++);
}

let cells = [];

function addEntity(name, x, y, w = 180, h = 50) {
    const id = getId();
    cells.push(`
    <mxCell id="${id}" value="${name}" style="rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=13;strokeWidth=1.8;fillColor=#EBF4FF;strokeColor=#2563EB;fontColor=#1E3A8A;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/>
    </mxCell>`);
    return { id, name, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

function addDiamond(verb, x, y, w = 90, h = 50) {
    const id = getId();
    cells.push(`
    <mxCell id="${id}" value="${verb}" style="rhombus;whiteSpace=wrap;html=1;fontSize=11;strokeWidth=1.4;fillColor=#FEF3C7;strokeColor=#D97706;fontColor=#92400E;fontStyle=0;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/>
    </mxCell>`);
    return { id, verb, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

function addRelation(entity1, diamond, entity2, card1 = "1", card2 = "N") {
    // Edge from entity1 to diamond with card1
    const edge1Id = getId();
    cells.push(`
    <mxCell id="${edge1Id}" value="${card1}" style="endArrow=none;html=1;fontSize=12;fontStyle=1;strokeColor=#475569;strokeWidth=1.5;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="${entity1.id}" target="${diamond.id}">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>`);

    // Edge from diamond to entity2 with card2
    const edge2Id = getId();
    cells.push(`
    <mxCell id="${edge2Id}" value="${card2}" style="endArrow=none;html=1;fontSize=12;fontStyle=1;strokeColor=#475569;strokeWidth=1.5;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="${diamond.id}" target="${entity2.id}">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>`);
}

function addAttributes(entity, attrs, side = 'top', radius = 100, spanAngleDeg = 140) {
    const count = attrs.length;
    if (count === 0) return;

    let baseAngleDeg = 270; // top
    if (side === 'bottom') baseAngleDeg = 90;
    else if (side === 'left') baseAngleDeg = 180;
    else if (side === 'right') baseAngleDeg = 0;
    else if (side === 'top-left') baseAngleDeg = 225;
    else if (side === 'top-right') baseAngleDeg = 315;
    else if (side === 'bottom-left') baseAngleDeg = 135;
    else if (side === 'bottom-right') baseAngleDeg = 45;

    const startAngle = baseAngleDeg - spanAngleDeg / 2;
    const stepAngle = count > 1 ? spanAngleDeg / (count - 1) : 0;

    attrs.forEach((attr, idx) => {
        const angleDeg = count === 1 ? baseAngleDeg : (startAngle + idx * stepAngle);
        const rad = angleDeg * (Math.PI / 180);
        
        // Multi-tier radius if many attributes
        let effectiveR = radius;
        if (count > 8) {
            effectiveR = radius + (idx % 2 === 0 ? 0 : 50);
        }

        const attrW = attr.length > 15 ? 110 : 85;
        const attrH = 30;

        const ax = Math.round(entity.cx + effectiveR * Math.cos(rad) - attrW / 2);
        const ay = Math.round(entity.cy + effectiveR * Math.sin(rad) - attrH / 2);

        const isPK = attr.startsWith('*');
        const cleanName = isPK ? attr.substring(1) : attr;
        const displayVal = isPK ? `&lt;u&gt;${cleanName}&lt;/u&gt;` : cleanName;
        const strokeCol = isPK ? '#2563EB' : '#94A3B8';
        const fillCol = isPK ? '#EFF6FF' : '#FFFFFF';
        const fontCol = isPK ? '#1E3A8A' : '#334155';

        const attrId = getId();
        cells.push(`
    <mxCell id="${attrId}" value="${displayVal}" style="ellipse;whiteSpace=wrap;html=1;fontSize=10;fillColor=${fillCol};strokeColor=${strokeCol};fontColor=${fontCol};strokeWidth=${isPK ? 1.5 : 1};" vertex="1" parent="1">
      <mxGeometry x="${ax}" y="${ay}" width="${attrW}" height="${attrH}" as="geometry"/>
    </mxCell>`);

        const lineId = getId();
        cells.push(`
    <mxCell id="${lineId}" style="endArrow=none;html=1;strokeColor=#CBD5E1;strokeWidth=1;" edge="1" parent="1" source="${entity.id}" target="${attrId}">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>`);
    });
}

// -------------------------------------------------------------
// BUILD THE ER DIAGRAM
// -------------------------------------------------------------

// 1. Center Entity: USERS
const users = addEntity("USERS", 1400, 1100, 200, 60);
addAttributes(users, [
    "*id", "fullname", "email", "password", "gender", "birth_date",
    "phone", "is_completed", "xp", "current_streak", "best_streak",
    "plan_start_date", "sleep_target_hours", "walking_target_minutes", "nutrition_goal"
], 'top', 160, 160);

// 2. Skrining & CDSS Chain (Left & Bottom-Left)
// CLINICAL_ASSESSMENTS (Mode Lab Baru - TANPA HbA1c)
const clinAssess = addEntity("CLINICAL_ASSESSMENTS", 600, 750, 220, 60);
const relMelakukan = addDiamond("Melakukan", 1000, 925, 100, 50);
addRelation(users, relMelakukan, clinAssess, "1", "N");
addAttributes(clinAssess, [
    "*id", "user_id", "age", "gender", "glucose_fasting", "waist_cm",
    "weight", "height", "hdl", "triglycerides", "bp_systolic",
    "bp_diastolic", "bmi", "map_pressure", "tg_hdl_ratio", "risk_level", "cta"
], 'top-left', 180, 150);

// QUESTIONNAIRE_ASSESSMENTS (Mode Kuesioner Baru)
const questAssess = addEntity("QUESTIONNAIRE_ASSESSMENTS", 600, 1350, 240, 60);
const relMengisiQuest = addDiamond("Mengisi", 1000, 1225, 100, 50);
addRelation(users, relMengisiQuest, questAssess, "1", "N");
addAttributes(questAssess, [
    "*id", "user_id", "age_band", "gender", "bmi_category",
    "waist_category", "hypertension", "overweight_history", "risk_level", "cta"
], 'bottom-left', 160, 140);

// ANALYSIS_RESULTS (1:1 Cache)
const analysisRes = addEntity("ANALYSIS_RESULTS", 1400, 1500, 200, 55);
const relMemilikiAnalysis = addDiamond("Memiliki", 1450, 1300, 100, 50);
addRelation(users, relMemilikiAnalysis, analysisRes, "1", "1");
addAttributes(analysisRes, ["*id", "user_id", "mode", "result_data", "created_at"], 'left', 130, 90);

// USER_RECOMMENDATIONS (Interconnected from ANALYSIS_RESULTS and KNOWLEDGE_BASE_RULES)
const userRecs = addEntity("USER_RECOMMENDATIONS", 1400, 1850, 220, 60);
const relGenRec = addDiamond("Menghasilkan", 1450, 1675, 100, 50);
addRelation(analysisRes, relGenRec, userRecs, "1", "N");
addAttributes(userRecs, [
    "*id", "user_id", "analysis_id", "rule_id", "category",
    "priority_rank", "priority_score", "recommendation_text", "initial_target", "progress_metric"
], 'right', 160, 130);

// KNOWLEDGE_BASE_RULES (CDSS catalog connected to USER_RECOMMENDATIONS)
const kbRules = addEntity("KNOWLEDGE_BASE_RULES", 800, 1850, 220, 60);
const relMendasari = addDiamond("Mendasari", 1120, 1855, 100, 50);
addRelation(kbRules, relMendasari, userRecs, "1", "N");
addAttributes(kbRules, [
    "*rule_id", "category", "factor", "input_variable", "condition_operator",
    "threshold_value", "severity", "evidence_level", "base_priority_score", "recommendation_template"
], 'bottom', 150, 140);

// USER_GOALS (Interconnected from USER_RECOMMENDATIONS)
const userGoals = addEntity("USER_GOALS", 1400, 2250, 200, 55);
const relGenGoals = addDiamond("Menghasilkan", 1450, 2050, 100, 50);
addRelation(userRecs, relGenGoals, userGoals, "1", "N");
addAttributes(userGoals, [
    "*id", "user_id", "recommendation_id", "category", "goal_title",
    "target_value", "current_value", "unit", "phase_number", "status"
], 'bottom', 140, 130);

// 3. 90-Day Tracking & AI Evaluation Chain (Top & Top-Right)
// DAILY_TRACKING
const dailyTrack = addEntity("DAILY_TRACKING", 1400, 550, 190, 55);
const relMengisiDaily = addDiamond("Mengisi", 1445, 825, 100, 50);
addRelation(users, relMengisiDaily, dailyTrack, "1", "N");
addAttributes(dailyTrack, [
    "*id", "user_id", "day_index", "sleep_hours",
    "walking_minutes", "nutrition_score", "xp_gained"
], 'top', 140, 120);

// GLUCOSE_TRACKING
const glucTrack = addEntity("GLUCOSE_TRACKING", 1950, 650, 190, 55);
const relMencatatGluc = addDiamond("Mencatat", 1680, 875, 100, 50);
addRelation(users, relMencatatGluc, glucTrack, "1", "N");
addAttributes(glucTrack, ["*id", "user_id", "day_index", "glucose_value", "created_at"], 'top', 130, 90);

// DAILY_LOGS (Aggregated time series logs)
const dailyLogs = addEntity("DAILY_LOGS", 2200, 900, 190, 55);
const relGenLogs = addDiamond("Menghasilkan", 1850, 1000, 110, 50);
addRelation(users, relGenLogs, dailyLogs, "1", "N");
addAttributes(dailyLogs, [
    "*id", "user_id", "day_idx", "glucose_mean", "steps",
    "sleep_hours", "carbs_g", "target_sleep_met", "streak", "baseline_glucose"
], 'top-right', 150, 120);

// AI_EVALUATIONS (Connected from DAILY_LOGS!)
const aiEval = addEntity("AI_EVALUATIONS", 2700, 900, 190, 55);
const relDievaluasi = addDiamond("Dievaluasi", 2490, 902, 100, 50);
addRelation(dailyLogs, relDievaluasi, aiEval, "1", "N");
addAttributes(aiEval, [
    "*id", "user_id", "day_milestone", "score", "risk_level",
    "summary", "recommendation", "raw_data"
], 'right', 150, 130);

// 4. Gamification Chain (Right-Center)
// USER_ACHIEVEMENTS
const userAch = addEntity("USER_ACHIEVEMENTS", 2200, 1200, 200, 55);
const relMeraih = addDiamond("Meraih", 1850, 1150, 100, 50);
addRelation(users, relMeraih, userAch, "1", "N");
addAttributes(userAch, ["*id", "user_id", "achievement_code", "created_at"], 'bottom-right', 130, 90);

// USER_STREAKS (1:1 with USERS)
const userStreaks = addEntity("USER_STREAKS", 2200, 1450, 190, 55);
const relMemilikiStreak = addDiamond("Memiliki", 1850, 1300, 100, 50);
addRelation(users, relMemilikiStreak, userStreaks, "1", "1");
addAttributes(userStreaks, [
    "*user_id", "current_streak", "longest_streak", "last_activity_date",
    "freeze_count", "freeze_used_dates", "timezone"
], 'bottom', 140, 110);

// STREAK_ACTIVITY_LOGS (Connected from USER_STREAKS!)
const streakLogs = addEntity("STREAK_ACTIVITY_LOGS", 2700, 1450, 210, 55);
const relMencatatStreak = addDiamond("Mencatat", 2490, 1452, 100, 50);
addRelation(userStreaks, relMencatatStreak, streakLogs, "1", "N");
addAttributes(streakLogs, ["*id", "user_id", "activity_date", "type", "created_at"], 'right', 140, 100);

// 5. Utility & Security
// NOTIFICATIONS
const notifs = addEntity("NOTIFICATIONS", 1950, 1750, 190, 55);
const relMenerimaNotif = addDiamond("Menerima", 1700, 1500, 100, 50);
addRelation(users, relMenerimaNotif, notifs, "1", "N");
addAttributes(notifs, ["*id", "user_id", "title", "body", "icon", "color", "bg_color"], 'bottom-right', 140, 110);

// FORGET_PASSWORD
const forgetPass = addEntity("FORGET_PASSWORD", 950, 600, 190, 55);
const relMeminta = addDiamond("Meminta", 1180, 700, 100, 50);
addRelation(users, relMeminta, forgetPass, "1", "N");
addAttributes(forgetPass, ["*id", "user_id", "otp", "expires_at", "is_used"], 'top', 120, 80);

// 6. Independent Public Entity
// CONTACT_US
const contactUs = addEntity("CONTACT_US", 500, 300, 190, 55);
addAttributes(contactUs, ["*id", "name", "email", "message", "created_at"], 'bottom', 120, 90);

// Note box for CONTACT_US
const noteId = getId();
cells.push(`
<mxCell id="${noteId}" value="&lt;i&gt;Entitas Mandiri (Publik)&lt;br&gt;Tanpa Relasi FK ke USERS&lt;/i&gt;" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#FFFBEB;strokeColor=#F59E0B;fontSize=10;fontColor=#B45309;" vertex="1" parent="1">
  <mxGeometry x="500" y="210" width="190" height="50" as="geometry"/>
</mxCell>`);

// Build final XML
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="GluCare ERD Generator" version="22.0.0" type="device">
  <diagram id="glucare_erd_chen" name="ERD GluCare Chen Notation">
    <mxGraphModel dx="1800" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="3400" pageHeight="2600" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// Write file
const outPath = path.join(__dirname, 'ERD_GluCare_Chen.drawio');
fs.writeFileSync(outPath, xmlContent, 'utf8');
console.log('Successfully generated Draw.io file at:', outPath);
