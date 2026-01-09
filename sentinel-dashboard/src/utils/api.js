import axios from 'axios';

// 1. The Auth Service (Port 8081)
export const authApi = axios.create({
    baseURL: 'http://localhost:8081/api/auth'
});

// 2. The Core Engine (Port 8080)
export const coreApi = axios.create({
    baseURL: 'http://localhost:8080/api'
});

// 🤖 Interceptor: Automatically attach the JWT Token to Core requests
coreApi.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});