import api from "./api";

export const planService = {
    enrollPlan: async (payload) => {
        const response = await api.post("/api/plan/enroll", payload);
        return response.data;
    },

    getPlanData: async (userId) => {
        const response = await api.get(`/api/plan/data/${userId}`);
        return response.data;
    },

    submitDailyTracking: async (payload) => {
        const response = await api.post("/api/plan/daily-tracking", payload);
        return response.data;
    },

    submitGlucoseTracking: async (payload) => {
        const response = await api.post("/api/plan/glucose-tracking", payload);
        return response.data;
    },

    getDailyTracking: async (userId) => {
        const response = await api.get(`/api/plan/tracking/daily/${userId}`);
        return response.data;
    },

    getGlucoseTracking: async (userId) => {
        const response = await api.get(`/api/plan/tracking/glucose/${userId}`);
        return response.data;
    },

    getAiEvaluations: async (userId) => {
        const response = await api.get(`/api/plan/evaluations/${userId}`);
        return response.data;
    },

    assessment30: async (userId) => {
        const response = await api.post("/api/plan/assessment30", { user_id: userId });
        return response.data;
    },

    assessment90: async (userId) => {
        const response = await api.post("/api/plan/assessment90", { user_id: userId });
        return response.data;
    },

    cancelPlan: async (userId) => {
        const response = await api.post("/api/plan/cancel", { user_id: userId });
        return response.data;
    },
};

export default planService;
