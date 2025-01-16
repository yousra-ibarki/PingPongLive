export const getCurrentIp = () => {
    if (typeof window !== 'undefined') {
        // Client-side
        return window.location.hostname;
    }
};

const port = process.env.PORT

export const getBaseUrl = () => {
    // Store the result to ensure consistency
    const currentIp = getCurrentIp();
    
    if (typeof window !== 'undefined') {
        return `https://${currentIp}:${port}/`;  // Route through Nginx
    }
};