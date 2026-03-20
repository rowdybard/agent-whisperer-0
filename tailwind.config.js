/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        terminal: {
          bg: '#0d0d0d',
          surface: '#111111',
          border: '#2a2a2a',
          green: '#00ff88',
          yellow: '#ffd700',
          red: '#ff4444',
          cyan: '#00cfff',
          muted: '#555555',
          text: '#cccccc',
        },
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scan': 'scan 4s linear infinite',
        'fadeIn': 'fadeIn 0.3s ease-in',
        'slideUp': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
