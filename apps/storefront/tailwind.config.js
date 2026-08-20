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
        // Stitch design system
        magenta: '#FF007F',
        'surface-bg':           '#0B0B0B',
        'surface':              '#131313',
        'surface-dim':          '#131313',
        'surface-container':    '#201f1f',
        'surface-container-low':'#1c1b1b',
        'surface-container-high':'#2a2a2a',
        'surface-container-highest':'#353534',
        'surface-bright':       '#3a3939',
        'surface-variant':      '#353534',
        'on-surface':           '#e5e2e1',
        'on-surface-variant':   '#e5bcc5',
        'on-background':        '#e5e2e1',
        'outline':              '#ac878f',
        'outline-variant':      '#5c3f46',
        'primary':              '#ffb1c4',
        'primary-container':    '#ff4a8d',
        'on-primary':           '#65002e',
        'secondary':            '#bdf4ff',
        'tertiary':             '#63e063',
        'error':                '#ffb4ab',
        'inverse-primary':      '#ba005b',
        'inverse-surface':      '#e5e2e1',
        'inverse-on-surface':   '#313030',
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
    },
  },
  plugins: [],
};
