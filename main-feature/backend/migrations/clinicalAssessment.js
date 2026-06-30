require("dotenv").config({ path: __dirname + "/../.env" });
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Gagal terhubung ke database:", err);
        return process.exit(1);
    }

    console.log("Database connected untuk migration...");

    const createClinicalAssessmentsTable = `
        CREATE TABLE IF NOT EXISTS clinical_assessments (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            age INT NOT NULL,

            gender TINYINT NOT NULL COMMENT '0 = Perempuan, 1 = Laki-laki',

            glucose_fasting DECIMAL(5,2) NOT NULL,

            waist_cm DECIMAL(5,2) NOT NULL,

            weight DECIMAL(5,2) NOT NULL,

            height DECIMAL(5,2) NOT NULL,

            hdl DECIMAL(5,2) NOT NULL,

            triglycerides DECIMAL(6,2) NOT NULL,

            bp_systolic INT NOT NULL,

            bp_diastolic INT NOT NULL,

            bmi DECIMAL(5,2) NOT NULL,

            map_pressure DECIMAL(6,2) NOT NULL,

            tg_hdl_ratio DECIMAL(6,2) NOT NULL,

            prediction_raw INT DEFAULT NULL,

            risk_level VARCHAR(50) DEFAULT NULL,

            cta VARCHAR(255) DEFAULT NULL,

            probability_normal DECIMAL(8,6) DEFAULT NULL,

            probability_prediabetes DECIMAL(8,6) DEFAULT NULL,

            probability_diabetes DECIMAL(8,6) DEFAULT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

            CONSTRAINT fk_clinical_assessments_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `;

    db.query(createClinicalAssessmentsTable, (err) => {
        if (err) {
            console.error(
                "Gagal membuat tabel clinical_assessments:",
                err
            );
        } else {
            console.log(
                "Tabel 'clinical_assessments' berhasil dibuat."
            );
        }

        db.end(() => {
            console.log("Migration selesai.");
            process.exit(0);
        });
    });
});