import axios from 'axios';

const Axios = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,
});

// Add response interceptor for handling token refresh
Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                print('refreshing token');
                await Axios.post('/api/accounts/refresh/');
                
                // If refresh successful, retry the original request
                return Axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // If error wasn't 401 or refresh failed, reject the promise
        return Promise.reject(error);
    }
);

export default Axios;
