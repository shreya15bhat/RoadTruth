/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep midnight navy operational theme
        navy: {
          950: '#070C12',
          900: '#0A1118',
          850: '#0D1722',
          800: '#101D2B', // Deep midnight navy surface
          750: '#142436',
          700: '#1B2A3B', // Subtle structural border
          650: '#23374D', // Active / hover border
          600: '#2E4763',
          500: '#3D5C80',
          400: '#5C7EAA',
          300: '#85A4D0'
        },
        // Traffic Control Blue
        traffic: {
          blue: '#1769AA',
          'blue-hover': '#1B7DC8',
          'blue-light': '#2196F3',
          'blue-dark': '#0D47A1',
          'blue-subtle': '#0E2942',
          // Traffic state indicators
          red: '#E5484D',        // Congestion / High Severity
          'red-subtle': '#381316',
          amber: '#F0A629',      // Moderate Traffic
          'amber-subtle': '#38260E',
          green: '#23966B',      // Clear Roads / Normal
          'green-subtle': '#0E2E20'
        },
        road: {
          bg: '#E9EEF2',
          surface: '#F5F7F9',
          border: '#D3DCE6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
