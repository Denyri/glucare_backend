const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'GluCare Backend & Clinical AI API',
    description: 'Dokumentasi Resmi REST API GluCare: Autentikasi, Skrining Klinis AI, Kuesioner, Pelacakan Harian, dan Program 90 Hari.',
    version: '2.0.0'
  },
  host: 'localhost:5001',
  schemes: ['http', 'https'],
  tags: [
    { name: 'Auth', description: 'Manajemen Autentikasi Pengguna & Profil' },
    { name: 'AI Predictions', description: 'Microservice Analisis & Prediksi Risiko AI GluCare' },
    { name: 'Lab Assessment', description: 'Penilaian Klinis Laboratorium & Profil Metabolik' },
    { name: 'Questionnaire Assessment', description: 'Skrining Kuesioner Gaya Hidup Non-Invasif' },
    { name: 'Program Plan', description: 'Program Intervensi 90 Hari & Evaluasi AI' },
    { name: 'Daily Logs (Tracking)', description: 'Pencatatan Log & Metrik Harian' },
    { name: 'AI Monitoring', description: 'Evaluasi Telemetri Pasien Hari ke-30' },
    { name: 'Dashboard', description: 'Ringkasan Dashboard Pengguna' },
    { name: 'Streak', description: 'Sistem Gamifikasi, Konsistensi, & Freeze' }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Masukkan token JWT Anda dalam format: **Bearer <token>**'
    }
  },
  definitions: {
    ClinicalPredictionInput: {
      user_id: "usr_12345",
      glucose_fasting: 105.0,
      age: 32,
      gender: 1,
      weight: 74.5,
      height: 170.0,
      bmi: 25.8,
      waist_cm: 88.0,
      bp_systolic: 122,
      bp_diastolic: 78,
      hdl: 48.0,
      triglycerides: 145.0,
      riwayat_keluarga: 1,
      riwayat_diabetes: 0
    },
    QuestionnairePredictionInput: {
      user_id: "usr_test_001",
      age_band: 1,
      gender: 2,
      bmi_category: 1,
      waist_category: 1,
      hypertension: 0,
      diabetes_history: 0,
      prediabetes_told: 0,
      prediabetes_history: 0,
      physically_active: 0,
      sedentary_hours: 6.0,
      current_smoker: 0,
      poor_diet: 1
    },
    LabSubmitInput: {
      user_id: "usr_12345",
      age: 32,
      gender: 1,
      glucose_fasting: 105.0,
      waist_cm: 88.0,
      weight: 74.5,
      height: 170.0,
      hdl: 48.0,
      triglycerides: 145.0,
      bp_systolic: 122,
      bp_diastolic: 78
    },
    DailyTrackingInput: {
      user_id: 1,
      day: 1,
      sleep_hours: 7.5,
      walking_minutes: 45,
      nutrition_score: 85
    },
    GlucoseTrackingInput: {
      user_id: 1,
      day: 1,
      glucose_value: 98.5
    }
  }
};

const outputFile = './swagger_output.json';
const endpointsFiles = [
  './server.js',
  './routes/aiRoutes.js',
  './routes/labRoutes.js',
  './routes/kuesionerRoutes.js',
  './routes/monitoringRoutes.js',
  './routes/planRoutes.js',
  './routes/dailyLogsRoutes.js',
  './routes/authRoutes.js',
  './routes/dashboardRoutes.js',
  './routes/streakRoutes.js',
  './routes/contactUsRoutes.js',
  './routes/notificationRoutes.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc);

