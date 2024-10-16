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
        golden: '#FFD369',
        blue_dark: '#222831',
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
        'phone': '700px',
        // => @media (min-width: 640px) { ... }

        'tablet': '1247px',
        // => @media (min-width: 640px) { ... }
  
        'laptop': '1400px',
        // => @media (min-width: 1024px) { ... }
  
        'desktop': '1500px',
        // => @media (min-width: 1280px) { ... }

        'custom1': '1660px',
        // => @media (min-width: 1280px) { ... }

         // Custom height-based breakpoints

         'h-sm': { raw: '(min-height: 0px)' },  // For small screens with min-height of 500px
         
         'h-md': { raw: '(min-height: 700px)' },  // For medium screens with min-height of 700px
         
         'h-lg': { raw: '(min-height: 900px)' },  // For large screens with min-height of 900px
         
         'h-xl': { raw: '(min-height: 1100px)' }, // For extra-large screens with min-height of 1100px
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
