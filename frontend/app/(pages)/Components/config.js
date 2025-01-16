const port = process.env.NEXT_PUBLIC_BACKEND_PORT; // Provide a default value

const backend_port = process.env.CONTAINER_BACKEND_PORT;



const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
        // Always use HTTPS
        const hostname = window.location.hostname;
        return `https://${hostname}:${port}/`;  // Route through Nginx
    }
    // Server-side
    return `http://backend:${backend_port}/api`;  // Internal Docker communication
};

const getWebSocketUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `wss://${hostname}:${port}/ws`;  // Route through Nginx
    }
    return `ws://backend:${backend_port}/ws`;  // Internal Docker communication
};

export const config = {
    apiUrl: getBackendUrl(),
    wsUrl: getWebSocketUrl(),
};