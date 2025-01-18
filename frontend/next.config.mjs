/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Disable React Strict Mode
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      },
};

export default nextConfig;

