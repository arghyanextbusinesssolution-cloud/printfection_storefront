/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy brand tokens (keep for admin compat)
        brand: {
          accent: '#E63946',
          dark: '#1A1A1A',
          gray: '#6B7280',
          light: '#F9FAFB',
        },
        // Premium Light Theme Design System
        magenta:                '#FF007F',
        'surface-bg':           '#FFFFFF',
        'surface':              '#FFFFFF',
        'surface-dim':          '#F5F5F5',
        'surface-container':    '#FAFAFA',
        'surface-container-low':'#F7F7F7',
        'surface-container-high':'#EEEEEE',
        'surface-container-highest':'#E8E8E8',
        'surface-bright':       '#FFFFFF',
        'surface-variant':      '#F5F5F5',
        'on-surface':           '#000000',
        'on-surface-variant':   '#333333',
        'on-background':        '#000000',
        'outline':              '#999999',
        'outline-variant':      '#DDDDDD',
        'primary':              '#FF007F',
        'primary-container':    '#FFE0EE',
        'on-primary':           '#FFFFFF',
        'secondary':            '#006879',
        'tertiary':             '#006C47',
        'error':                '#B3261E',
        'inverse-primary':      '#FFB1C4',
        'inverse-surface':      '#000000',
        'inverse-on-surface':   '#FFFFFF',
      },
      fontFamily: {
        sans:    ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        display: ['Chivo', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['84px', { lineHeight: '90px', letterSpacing: '-0.04em', fontWeight: '900' }],
        'headline-lg': ['48px', { lineHeight: '52px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-md': ['24px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body-lg':  ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':  ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-mono': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      spacing: {
        'section': '120px',
        'container-max': '1440px',
        'gutter': '24px',
        'margin-desktop': '64px',
        'margin-mobile': '16px',
      },
      maxWidth: {
        'container': '1440px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
      },
      boxShadow: {
        'card': '0 1px 4px 0 rgba(0,0,0,0.06), 0 4px 16px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 12px 32px 0 rgba(0,0,0,0.08)',
        'selected': '0 0 0 2px #FF007F, 0 4px 16px 0 rgba(255,0,127,0.15)',
        'step': '0 2px 8px 0 rgba(0,0,0,0.08)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        selectPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-up-slow': 'fadeUp 0.7s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'scale-in': 'scaleIn 0.35s ease both',
        'slide-in-right': 'slideInRight 0.4s ease both',
        'select-pulse': 'selectPulse 0.3s ease',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
      },
      transitionProperty: {
        'shadow-transform': 'box-shadow, transform',
      },
    },
  },
  plugins: [],
};
