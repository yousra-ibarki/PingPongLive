import axios from 'axios';
import { config } from './config';

const Axios = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// let isRefreshing = false;
// let failedQueue = [];

// const publicRoutes = [
//     '/api/accounts/login/',
//     '/api/accounts/register/',
//     '/api/login42/',
//     '/api/accounts/42/login/callback/',
//     '/api/accounts/refresh/',
//     '/api/2fa/verify_otp/'
// ];

// const clearAllAuthCookies = () => {
//     document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=None';
//     document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=None';
//     document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=Strict';
// };

// const processQueue = (error, token = null) => {
//     failedQueue.forEach(prom => {
//         if (error) {
//             prom.reject(error);
//         } else {
//             prom.resolve();
//         }
//     });
//     failedQueue = [];
// };

// const redirectToLogin = () => {
//     if (!window.location.pathname.includes('/login') && 
//         !window.location.pathname.includes('/callback')) {
//         window.location.replace('/login');
//     }
// };

// Axios.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;
        
//         // Check specifically for refresh token expiration
//         if (error.response?.status === 401 && 
//             originalRequest.url === '/api/accounts/refresh/') {
//             clearAllAuthCookies();
//             redirectToLogin();
//             return Promise.reject(error);
//         }

//         const isPublicRoute = publicRoutes.some(route => 
//             originalRequest.url.includes(route)
//         );

//         if (isPublicRoute || error.response?.status !== 401) {
//             return Promise.reject(error);
//         }

//         if (originalRequest._retry) {
//             redirectToLogin();
//             return Promise.reject(error);
//         }

//         if (isRefreshing) {
//             return new Promise((resolve, reject) => {
//                 failedQueue.push({ resolve, reject });
//             })
//                 .then(() => Axios(originalRequest))
//                 .catch(err => Promise.reject(err));
//         }

//         originalRequest._retry = true;
//         isRefreshing = true;

//         try {
//             await Axios.post('/api/accounts/refresh/');
//             processQueue(null);
//             isRefreshing = false;
//             return Axios(originalRequest);
            
//         } catch (refreshError) {
//             processQueue(refreshError, null);
//             isRefreshing = false;
            
//             // Check if refresh token is expired
//             if (refreshError.response?.status === 401) {
//                 clearAllAuthCookies();
//             }
//             redirectToLogin();
//             return Promise.reject(refreshError);
//         }
//     }
// );

export default Axios;
