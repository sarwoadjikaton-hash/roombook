/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palet Resmi Biru Kemnaker RI (Kementerian Ketenagakerjaan RI)
        primary: {
          DEFAULT: '#0F3B68', // Corporate Navy Kemnaker
          light: '#1D4ED8',   // Royal Blue
          dark: '#0A2540',    // Midnight Navy Kemnaker
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#0F3B68',
          900: '#0A2540',
        },
        kemnaker: {
          navy: '#0A2540',
          blue: '#0F3B68',
          royal: '#1D4ED8',
          cyan: '#0284C7',
          sky: '#38BDF8',
          gold: '#D97706',
          amber: '#F59E0B',
        },
        accent: {
          DEFAULT: '#D97706', // Gold Garuda / Kemnaker Accent
          light: '#F59E0B',
          dark: '#B45309',
          50: '#FFFBEB',
        },
        bg: {
          DEFAULT: '#F8FAFC',
          subtle: '#F1F5F9',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#CBD5E1',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        status: {
          success: '#16A34A',
          'success-kiosk': '#15803D',
          danger: '#DC2626',
          'danger-kiosk': '#B91C1C',
          warning: '#D97706',
          'warning-kiosk': '#B45309',
          info: '#0284C7',
        },
        kiosk: {
          bg: '#050C18',
          surface: '#0A172C',
          card: '#0F2342',
          border: '#1E3A68',
          text: '#F8FAFC',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        btn: '8px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(10, 37, 64, 0.05)',
        card: '0 1px 3px rgba(10, 37, 64, 0.08), 0 1px 2px rgba(10, 37, 64, 0.04)',
        hover: '0 4px 6px -1px rgba(10, 37, 64, 0.1), 0 2px 4px -1px rgba(10, 37, 64, 0.06)',
        'blue-glow': '0 0 25px -5px rgba(29, 78, 216, 0.35)',
      }
    },
  },
  plugins: [],
}
