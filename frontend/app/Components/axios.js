import axios from 'axios';

const Axios = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
// Store pending requests that are waiting for the token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

const redirectToLogin = () => {
    // Clear any existing tokens
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    // Use replace to prevent back button from returning to protected route
    window.location.replace('/login');
};

Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is not 401 or the request was to the refresh endpoint, reject immediately
        if (error.response?.status !== 401 || originalRequest.url === '/api/accounts/refresh/') {
            return Promise.reject(error);
        }

        // If we're already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    return Axios(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        isRefreshing = true;

        // Try to refresh the token
        try {
            await Axios.post('/api/accounts/refresh/');
            
            // If refresh successful, process queue and retry original request
            processQueue(null);
            isRefreshing = false;
            return Axios(originalRequest);
            
        } catch (refreshError) {
            // If refresh fails, process queue with error and redirect
            processQueue(refreshError, null);
            isRefreshing = false;
            redirectToLogin();
            return Promise.reject(refreshError);
        }
    }
);

export default Axios;