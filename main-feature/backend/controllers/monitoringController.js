const axios = require("axios");

const getPrediction = async (req, res) => {
    try {
        const { patient_id, records } = req.body;

        if (!records || !Array.isArray(records) || records.length !== 30) {
            return res.status(400).json({ 
                message: "Input records harus berupa array dengan tepat 30 data harian (day_idx 0 sampai 29)." 
            });
        }

        const apiUrl = process.env.AI_MONITORING_API_URL || "https://itzvynn-glucare-backend.hf.space";
        
        console.log(`Forwarding prediction request to AI API: ${apiUrl}/assessment/day30`);
        const response = await axios.post(`${apiUrl}/assessment/day30`, {
            patient_id: patient_id || null,
            records: records
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Gagal melakukan prediksi AI:", error.response ? error.response.data : error.message);
        return res.status(error.response?.status || 500).json({
            message: "Gagal memproses prediksi AI",
            error: error.response?.data || error.message
        });
    }
};

module.exports = { getPrediction };
