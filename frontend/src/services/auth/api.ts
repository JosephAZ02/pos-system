import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function getErrorMessage(error: unknown, fallback: string): string {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
        return message.join(', ');
    }
    if (typeof message === 'string' && message !== '') {
        return message;
    }
    return fallback;
}
