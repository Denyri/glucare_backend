import axios from 'axios';

// Ini adalah "Best Practice" Axios Instance
// Mengambil URL dari file .env (VITE_API_URL)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Tambahkan interceptor untuk menyisipkan token secara otomatis di setiap request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage atau sessionStorage
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
