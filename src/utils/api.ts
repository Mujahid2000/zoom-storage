import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zoom-storage-server-1.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
