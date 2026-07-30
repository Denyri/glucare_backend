require("dotenv").config();

const express = require("express");
const passport = require("passport");
const cors = require("cors");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const kuesionerRoutes = require("./routes/kuesionerRoutes");
const labRoutes = require("./routes/labRoutes");
const contactUsRoutes = require("./routes/contactUsRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const dailyLogsRoutes = require("./routes/dailyLogsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const planRoutes = require("./routes/planRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const streakRoutes = require("./routes/streakRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api/auth", authRoutes);
app.use("/api/kuesioner", kuesionerRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/contact-us", contactUsRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/daily-logs", dailyLogsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static("uploads"));

if (fs.existsSync('./swagger_output.json')) {
    const swaggerDocument = require('./swagger_output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.get("/", (req, res) => {
    res.send("Backend gue");
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;