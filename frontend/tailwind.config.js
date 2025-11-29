/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "#E5E9F0",
        input: "#E5E9F0",
        ring: "#1A73E8",
        background: "#F6F8FB",
        foreground: "#1F2933",
        primary: {
          DEFAULT: "#1A73E8",
          foreground: "#FFFFFF",
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1A73E8', // BrightSteps Blue
          700: '#1967D2',
          800: '#1565C0',
          900: '#0B5394', // Primary Dark
          950: '#0D47A1',
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A73E8",
        },
        accent: {
          DEFAULT: "#F2A900",
          foreground: "#FFFFFF",
        },
        // Override slate to match user's neutral scale for compatibility
        slate: {
            50: '#F6F8FB', // App Background
            100: '#F0F4F8',
            200: '#E5E9F0', // Neutral Light
            300: '#D3DCE6',
            400: '#9AA5B1', // Neutral Mid
            500: '#7B8794',
            600: '#616E7C',
            700: '#3E4C59',
            800: '#323F4B',
            900: '#1F2933', // Neutral Dark
            950: '#12171D',
        }
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        'lg': '0.5rem', // 8px as requested
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
