import api from "./api";

export const authService = {
    register: async (payload) => {
        const response = await api.post("/api/auth/register", payload);
        return response.data;
    },

    login: async (payload) => {
        const response = await api.post("/api/auth/login", payload);
        return response.data;
    },

    googleLogin: async (token) => {
        const response = await api.post("/api/auth/google", { token });
        return response.data;
    },

    facebookLogin: async (token) => {
        const response = await api.post("/api/auth/facebook", { token });
        return response.data;
    },

    inputData: async (payload) => {
        const response = await api.post("/api/auth/inputData", payload);
        return response.data;
    },

    getProfile: async (userId) => {
        const response = await api.get(`/api/auth/profile/${userId}`);
        return response.data;
    },

    updateProfile: async (userId, payload) => {
        const response = await api.put(`/api/auth/update-profile/${userId}`, payload);
        return response.data;
    },

    uploadPhoto: async (userId, file) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await api.put(`/api/auth/upload-photo/${userId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    changePassword: async (userId, payload) => {
        const response = await api.put(`/api/auth/change-password/${userId}`, payload);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post("/api/auth/forgot-password", { email });
        return response.data;
    },

    verifyOtp: async (payload) => {
        const response = await api.post("/api/auth/verify-otp", payload);
        return response.data;
    },

    resetPassword: async (payload) => {
        const response = await api.post("/api/auth/reset-password", payload);
        return response.data;
    },
};

export default authService;
