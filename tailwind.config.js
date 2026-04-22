/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette — Deep Charcoal + Amber Gold
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // primary amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        surface: {
          950: '#0a0a0f',
          900: '#111118',
          850: '#14141e',
          800: '#1a1a24',
          750: '#1e1e2a',
          700: '#222230',
          600: '#2e2e40',
          500: '#3a3a50',
        },
        text: {
          primary:   '#f1f0ef',
          secondary: '#b5b3b1',
          muted:     '#7a7880',
          faint:     '#4a4858',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'amber-radial':    'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,158,11,0.13), transparent)',
        'amber-glow':      'radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, transparent 70%)',
        // Bento-glass internal sheen
        'glass-sheen':     'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
        'amber-sheen':     'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0) 60%)',
      },
      borderRadius: {
        '2xl':  '1rem',
        '3xl':  '1.25rem',
        '4xl':  '1.5rem',
      },
      animation: {
        'fade-up':    'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-down':  'fadeDown 0.35s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.2s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer':    'shimmer 4s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'marquee':    'marquee 28s linear infinite',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '250% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
      },
      boxShadow: {
        'amber-sm':   '0 0 0 1px rgba(245,158,11,0.2)',
        'amber-md':   '0 0 20px rgba(245,158,11,0.15), 0 0 0 1px rgba(245,158,11,0.2)',
        'amber-lg':   '0 0 40px rgba(245,158,11,0.2), 0 0 0 1px rgba(245,158,11,0.3)',
        'amber-xl':   '0 0 60px rgba(245,158,11,0.25), 0 0 0 1px rgba(245,158,11,0.35)',
        'card':       '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 12px rgba(0,0,0,0.3)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,158,11,0.1)',
        'glass':      '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 16px rgba(0,0,0,0.35)',
        'glass-lg':   '0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 40px rgba(0,0,0,0.5)',
        'inner-glow-amber': 'inset 0 0 20px rgba(245,158,11,0.06)',
      },
    },
  },
  plugins: [],
};
