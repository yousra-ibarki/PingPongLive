import axios from 'axios';

// Utility function to get the CSRF token from the cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Get CSRF token from cookie
const csrftoken = getCookie('csrftoken');

// Create an Axios instance
const Axios = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,  // This ensures cookies (including tokens) are sent with the request
});

// Add a request interceptor to inject the CSRF token for requests that require it
Axios.interceptors.request.use(
    (config) => {
        // For non-GET requests, include the CSRF token
        if (!['GET', 'HEAD', 'OPTIONS'].includes(config.method.toUpperCase())) {
            config.headers['X-CSRFToken'] = csrftoken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default Axios;
