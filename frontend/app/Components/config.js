const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
        // Use 127.0.0.1:8001 for backend API
        return `http://127.0.0.1:8000/`;
    }
    // Server-side
    return 'http://backend:8000/';  // Internal Docker communication
};

const getWebSocketUrl = () => {
    if (typeof window !== 'undefined') {
        // Use 127.0.0.1:8001 for WebSocket
        return `wss://127.0.0.1:8001/ws`;
    }
    return 'ws://backend:8000/ws';  // Internal Docker communication
};

export const config = {
    apiUrl: getBackendUrl(),
    wsUrl: getWebSocketUrl(),
};