import axios from 'axios';
import { config } from './config';

const Axios = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
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
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
    }
};

// Define public routes that don't need refresh handling
const publicRoutes = [
    '/api/accounts/login',
    '/login42',
    '/api/accounts/register',
    '/api/accounts/refresh/',
    '/api/accounts/logout',
    
];

Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if request is to a public route
        const isPublicRoute = publicRoutes.some(route => 
            originalRequest.url.includes(route)
        );

        // If public route, not 401, or refresh request, reject immediately
        if (isPublicRoute || error.response?.status !== 401 || 
            originalRequest.url === '/api/accounts/refresh/') {
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
            processQueue(null);
            isRefreshing = false;
            return Axios(originalRequest);
            
        } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            redirectToLogin();
            return Promise.reject(refreshError);
        }
    }
);

export default Axios;