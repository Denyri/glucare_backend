import api from "./api";

export const screeningService = {
    predictClinical: async (payload) => {
        const response = await api.post("/api/ai/predict/clinical", payload);
        return response.data;
    },

    predictQuestionnaire: async (payload) => {
        const response = await api.post("/api/ai/predict/questionnaire", payload);
        return response.data;
    },

    getLatestAnalysisResult: async (userId) => {
        const response = await api.get(`/api/ai/result/${userId}`);
        return response.data;
    },

    getAnalysisHistory: async (userId) => {
        const response = await api.get(`/api/ai/history/${userId}`);
        return response.data;
    },
};

export default screeningService;
