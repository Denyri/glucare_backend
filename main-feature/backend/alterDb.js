require("dotenv").config({ path: __dirname + "/.env" });
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
    console.log("Database connected. Mencoba menghapus UNIQUE constraint (index) pada user_id...");

    const query1 = `ALTER TABLE analysis_results DROP FOREIGN KEY analysis_results_ibfk_1;`;
    const query2 = `ALTER TABLE analysis_results DROP INDEX user_id;`;
    const query3 = `ALTER TABLE analysis_results ADD CONSTRAINT analysis_results_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`;

    db.query(query1, (err) => {
        if (err && err.code !== 'ER_DROP_FK') console.log("Gagal drop FK:", err.message);
        db.query(query2, (err) => {
            if (err && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') console.log("Gagal drop index:", err.message);
            db.query(query3, (err) => {
                if (err) console.error("Gagal add FK:", err.message);
                else console.log("Sukses menghapus UNIQUE constraint dan membuat ulang FK!");
                process.exit(0);
            });
        });
    });
});
