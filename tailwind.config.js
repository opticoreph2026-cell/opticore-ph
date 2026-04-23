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
        // Core brand palette — Deep Charcoal + High-Vibrancy Accents
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Primary Cyan
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          purple: '#a855f7',
          cyan:   '#22d3ee',
          amber:  '#f59e0b',
          rose:   '#f43f5e',
          emerald: '#10b981',
        },
        surface: {
          950: '#050508', // Deepest black
          900: '#0a0a0f', // Main dark
          850: '#111118', // Card background
          800: '#1a1a24', // Lighter surface
          750: '#222230',
        },
        text: {
          primary:   '#ffffff',
          secondary: '#94a3b8', // Slate 400
          muted:     '#64748b', // Slate 500
          faint:     '#334155', // Slate 700
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'Inter', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322d3ee' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'cyan-glow':      'radial-gradient(circle at center, rgba(34,211,238,0.1) 0%, transparent 70%)',
        'purple-glow':    'radial-gradient(circle at center, rgba(168,85,247,0.1) 0%, transparent 70%)',
        'glass-sheen':     'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)',
      },
      borderRadius: {
        '2xl':  '1.25rem',
        '3xl':  '1.75rem',
        '4xl':  '2.5rem',
      },
      animation: {
        'fade-up':    'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-down':  'fadeDown 0.35s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'shimmer':    'shimmer 4s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
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
        shimmer: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '250% center' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
      },
      boxShadow: {
        'cyan-md':   '0 0 20px rgba(34,211,238,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
        'purple-md': '0 0 20px rgba(168,85,247,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
        'glass':      'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.5)',
        'glass-lg':   'inset 0 1px 0 rgba(255,255,255,0.1), 0 24px 64px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};

    },
  },
  plugins: [],
};
