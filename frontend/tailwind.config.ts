import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' }, // Convert number to string
          '100%': { opacity: '1' }, // Convert number to string
        },
      },
      animation: {
        fadeIn: 'fadeIn 2s ease-in forwards',
      },
      screens: {
        'tablet': '1247px',
        // => @media (min-width: 640px) { ... }
  
        'laptop': '1400px',
        // => @media (min-width: 1024px) { ... }
  
        'desktop': '1500px',
        // => @media (min-width: 1280px) { ... }

        'custom1': '1596px',
        // => @media (min-width: 1280px) { ... }
      },
    },
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
  },
  plugins: [],
};
export default config;
