import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#060A10',
          surface: '#0C1220',
          elevated: '#121C2E',
        },
        border: {
          subtle: '#1A2840',
          DEFAULT: '#243652',
          bright: '#2E4470',
        },
        text: {
          primary: '#E2EAF4',
          secondary: '#7A8FA6',
          muted: '#3D5166',
        },
        cyan: {
          DEFAULT: '#00CFFF',
          dim: '#0099BB',
        },
        truth: {
          DEFAULT: '#00E87A',
          dim: '#00A855',
        },
        deception: {
          DEFAULT: '#FF2855',
          dim: '#CC1F44',
        },
        amber: {
          DEFAULT: '#FFB020',
          dim: '#CC8C1A',
        },
        violet: {
          DEFAULT: '#9B6EFF',
          dim: '#7A55CC',
        },
      },
      fontFamily: {
        display: ['Oxanium', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'flicker': 'flicker 8s step-end infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
