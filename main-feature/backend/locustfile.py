from locust import HttpUser, task, between
import random

class GluCarePerformanceTest(HttpUser):
    host = "http://localhost:5000"
    
    # Mensimulasikan jeda pengguna antara 1 hingga 5 detik sebelum melakukan request lagi
    wait_time = between(1, 5)

    @task(3)
    def load_index(self):
        """Menguji endpoint root / base yang sangat ringan."""
        self.client.get("/")

    @task(1)
    def test_predict_clinical(self):
        """Uji beban API Prediksi Mode Klinis (Dengan penanganan 429 Too Many Requests)."""
        payload = {
            "user_id": 1, # Random ID agar tidak konflik
            "gula_darah_puasa": random.randint(80, 150),
            "berat_badan": random.uniform(50.0, 100.0),
            "tinggi_badan": random.uniform(150.0, 190.0),
            "lingkar_pinggang": random.uniform(60.0, 110.0),
            "hdl": random.uniform(30.0, 70.0),
            "trigliserida": random.randint(100, 250),
            "tekanan_sistolik": random.randint(100, 160),
            "tekanan_diastolik": random.randint(60, 100),
            "riwayat_keluarga": random.choice([0, 1]),
            "riwayat_diabetes": random.choice([0, 1])
        }
        
        # Gunakan catch_response agar error 429 dari AI HuggingFace bisa kita abaikan/catat sebagai sukses
        with self.client.post("/api/ai/predict/clinical", json=payload, catch_response=True) as response:
            if response.status_code == 429:
                response.success() # Menganggap rate limit eksternal sebagai bukan kegagalan server lokal kita

    @task(1)
    def test_predict_questionnaire(self):
        """Uji beban API Prediksi Mode Kuesioner (Perbaikan format data Answers)."""
        payload = {
            "user_id": 1,
            "answers": [
                random.choice(["20-29 Tahun", "30-39 Tahun", "40-49 Tahun"]), # usia
                random.choice(["Ya", "Tidak", "Tidak Tahu"]),                 # riwayat keluarga
                random.choice(["Sering", "Jarang", "Tidak Pernah"]),          # olahraga
                random.choice(["Sangat Suka", "Biasa Saja", "Tidak Suka"]),   # makanan manis
                random.choice(["Normal", "Agak Besar", "Sangat Besar"]),      # lingkar pinggang
                random.choice(["Sering", "Jarang", "Tidak"]),                 # gejala
                random.choice(["< 5 Jam", "5-7 Jam", "> 7 Jam"]),             # jam tidur
                random.choice(["Rendah", "Sedang", "Tinggi"])                 # stress
            ]
        }
        self.client.post("/api/ai/predict/questionnaire", json=payload)

    @task(1)
    def test_program_enroll(self):
        """Uji beban API Pendaftaran Program (Enroll)."""
        payload = {
            "user_id": 1,
            "sleep_target_hours": random.randint(6, 9),
            "walking_target_minutes": random.randint(15, 60),
            "nutrition_goal": random.randint(80, 100)
        }
        self.client.post("/api/plan/enroll", json=payload)

    @task(2)
    def test_submit_daily_tracking(self):
        """Uji beban API Input Tracking Harian (Daily Plan)."""
        payload = {
            "user_id": 1,
            "day": random.randint(1, 1000000000), # Pakai angka day yang sangat besar secara acak untuk menghindari error Double Submit
            "sleep_hours": random.randint(4, 10),
            "walking_minutes": random.randint(10, 120),
            "nutrition_score": random.randint(50, 100)
        }
        self.client.post("/api/plan/daily", json=payload)

    @task(2)
    def test_submit_glucose_tracking(self):
        """Uji beban API Input Gula Darah Harian."""
        payload = {
            "user_id": 1,
            "day": random.randint(1, 1000000000), # Menghindari error double submit di Locust
            "glucose_value": random.randint(70, 200)
        }
        self.client.post("/api/plan/glucose", json=payload)

    @task(1)
    def test_assessment_day30(self):
        """Uji beban AI Assessment Milestone Hari ke-30."""
        payload = {
            "user_id": 1
        }
        self.client.post("/api/plan/assessment30", json=payload)

    @task(1)
    def test_assessment_day90(self):
        """Uji beban AI Assessment Milestone Hari ke-90."""
        payload = {
            "user_id": 1
        }
        self.client.post("/api/plan/assessment90", json=payload)
