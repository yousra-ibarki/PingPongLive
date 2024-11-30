const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
        // Always use HTTPS
        const hostname = window.location.hostname;
        return `https://${hostname}:8001/api`;  // Route through Nginx
    }
    // Server-side
    return 'http://backend:8000/api';  // Internal Docker communication
};

const getWebSocketUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `wss://${hostname}:8001/ws`;  // Route through Nginx
    }
    return 'ws://backend:8000/ws';  // Internal Docker communication
};

export const config = {
    apiUrl: getBackendUrl(),
    wsUrl: getWebSocketUrl(),
};
