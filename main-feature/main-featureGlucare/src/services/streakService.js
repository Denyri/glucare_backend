import api from "./api";

export const streakService = {
    getStreak: async (userId, timezone = "Asia/Jakarta") => {
        const response = await api.get(`/api/streak/${userId}?timezone=${encodeURIComponent(timezone)}`);
        return response.data;
    },

    getStreakHistory: async (userId, days = 30, month = null, timezone = "Asia/Jakarta") => {
        let url = `/api/streak/${userId}/history?days=${days}&timezone=${encodeURIComponent(timezone)}`;
        if (month) {
            url += `&month=${month}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    checkin: async (userId, timezone = "Asia/Jakarta") => {
        const response = await api.post("/api/streak/checkin", {
            user_id: userId,
            timezone,
        });
        return response.data;
    },

    useFreeze: async (userId, timezone = "Asia/Jakarta") => {
        const response = await api.post("/api/streak/freeze/use", {
            user_id: userId,
            timezone,
        });
        return response.data;
    },

    earnFreeze: async (userId, amount = 1) => {
        const response = await api.post("/api/streak/freeze/earn", {
            user_id: userId,
            amount,
        });
        return response.data;
    },
};

export default streakService;
