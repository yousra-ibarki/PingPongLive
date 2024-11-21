import axios from 'axios';

const Axios = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,
});

// Immediately redirect on 401
const redirectToLogin = () => {
    // Clear any existing tokens
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    window.location.replace('/login');
};

Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const originalRequest = error.config;
            
            // Only try refresh once
            if (!originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    await Axios.post('/api/accounts/refresh/');
                    return Axios(originalRequest);
                } catch {
                    redirectToLogin();
                    return Promise.reject(error);
                }
            } else {
                redirectToLogin();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default Axios;