require("dotenv").config({ path:__dirname + "/../.env"});
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err)=> {
    if (err) {
        console.error("Gagal terhubung e database:", err);
        return process.exit(1);
    }

    console.log("Database connected untuk migration...");

    const createQuestionaireTable = `
    CREATE TABLE IF NOT EXISTS questionnaire_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    user_id INT NOT NULL,
    age_band INT NOT NULL,
    gender INT NOT NULL,
    bmi_category INT NOT NULL,
    waist_category INT NOT NULL,
    hypertension INT NOT NULL,
    overweight_history INT NOT NULL,
    risk_level VARCHAR(50),
    cta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE)`;

    db.query(
        "DROP TABLE IF EXISTS quesionnaire_assessments",
        (err) => {
            if (err) {
                console.error("Gagal menghapus table lama:", err);
                db.end();
                return;
            }

            db.query(createQuestionaireTable, (err) => {
                if(err) {
                    console.error(
                        "Gagal membuat tabel questionnaire_assessments:",
                        err
                    );
                }else {
                    console.log(
                        "Tabel 'questionnaire_assessments' berhasil dibuat."
                    );
                }

                db.end(()=>{
                    console.log("Migration selesai.");
                    process.exit(0)
                });
            });
        }
    );
});