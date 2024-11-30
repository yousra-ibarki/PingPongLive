const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
        // Always use HTTPS
        const hostname = window.location.hostname;
        return `https://${hostname}:8001/api`;  // Route through Nginx
    }
    // Server-side
    return 'http://backend:8000/api';  // Internal Docker communication
};

export const config = {
    apiUrl: getBackendUrl(),
    wsUrl: getBackendUrl().replace('https', 'wss').replace('/api', '/ws'),
};