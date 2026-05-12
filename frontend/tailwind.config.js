/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#0A0A0F',
          50: '#1A1A2E',
          100: '#12121C',
          200: '#0D0D16',
          300: '#0A0A0F',
        },
        aurora: {
          violet: '#7C3AED',
          pink: '#EC4899',
          cyan: '#06B6D4',
          emerald: '#10B981',
          'violet-light': '#9B5CF6',
          'pink-light': '#F472B6',
          'cyan-light': '#22D3EE',
          'emerald-light': '#34D399',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.12)',
        }
      },
      fontFamily: {
        sans: ['Geist Sans', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 35%, #06B6D4 70%, #10B981 100%)',
        'aurora-radial': 'radial-gradient(ellipse at top left, rgba(124,58,237,0.3) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.2) 0%, transparent 60%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        'iridescent': 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(236,72,153,0.4), rgba(6,182,212,0.4))',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        'aurora-violet': '0 0 24px rgba(124,58,237,0.4)',
        'aurora-pink': '0 0 24px rgba(236,72,153,0.4)',
        'aurora-cyan': '0 0 24px rgba(6,182,212,0.4)',
        'aurora-emerald': '0 0 24px rgba(16,185,129,0.4)',
        'aurora-sm': '0 0 12px rgba(124,58,237,0.3)',
        'depth-1': '0 2px 8px rgba(0,0,0,0.3)',
        'depth-2': '0 4px 24px rgba(0,0,0,0.5)',
        'depth-3': '0 8px 48px rgba(0,0,0,0.7)',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '24px',
        'glass-xl': '40px',
      },
      borderColor: {
        'glass': 'rgba(255,255,255,0.08)',
        'glass-hover': 'rgba(255,255,255,0.16)',
        'aurora': 'rgba(124,58,237,0.4)',
      },
      animation: {
        'aurora-shift': 'aurora-shift 8s ease-in-out infinite',
        'aurora-pulse': 'aurora-pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
        'gradient-text': 'gradient-text 4s ease infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'typewriter': 'typewriter 0.05s steps(1) forwards',
        'roll-up': 'roll-up 0.3s ease-out',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'aurora-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'aurora-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundSize: '200% 200%', backgroundPosition: 'left center' },
          '50%': { backgroundSize: '200% 200%', backgroundPosition: 'right center' },
        },
        'gradient-text': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(124,58,237,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(124,58,237,0.6), 0 0 48px rgba(124,58,237,0.3)' },
        },
        'roll-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(124,58,237,0.3)' },
          '33%': { borderColor: 'rgba(236,72,153,0.3)' },
          '66%': { borderColor: 'rgba(6,182,212,0.3)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}
