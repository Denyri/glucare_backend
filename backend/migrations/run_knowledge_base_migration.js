const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "glucare1",
    multipleStatements: true,
});

const sqlFilePath = path.join(__dirname, "create_knowledge_base_tables.sql");
const sql = fs.readFileSync(sqlFilePath, "utf8");

db.connect((err) => {
    if (err) {
        console.error("❌ Gagal connect ke MySQL:", err.message);
        process.exit(1);
    }
    console.log("✅ MySQL Connected successfully for Knowledge Base Migration");

    db.query(sql, (err2, results) => {
        if (err2) {
            console.error("❌ Knowledge Base Migration gagal:", err2.message);
        } else {
            console.log("✅ Knowledge Base Migration berhasil:");
            console.log("   - Tabel 'knowledge_base_rules' siap & terisi 21 aturan");
            console.log("   - Tabel 'user_recommendations' siap");
            console.log("   - Tabel 'user_goals' siap");
        }
        db.end();
    });
});
