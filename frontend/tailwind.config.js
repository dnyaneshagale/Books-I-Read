/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['selector', '.dark-mode'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    hover: 'var(--color-primary-hover)',
                    light: 'var(--color-primary-light)',
                    soft: 'var(--color-primary-soft)',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    soft: 'var(--color-accent-soft)',
                },
                success: {
                    DEFAULT: 'var(--color-success)',
                    soft: 'var(--color-success-soft)',
                },
                warning: {
                    DEFAULT: 'var(--color-warning)',
                    soft: 'var(--color-warning-soft)',
                },
                danger: {
                    DEFAULT: 'var(--color-danger)',
                    soft: 'var(--color-danger-soft)',
                },
                txt: {
                    primary: 'var(--color-text-primary)',
                    secondary: 'var(--color-text-secondary)',
                    light: 'var(--color-text-light)',
                },
                bg: {
                    DEFAULT: 'var(--color-bg)',
                    secondary: 'var(--color-bg-secondary)',
                    tertiary: 'var(--color-bg-tertiary)',
                    hover: 'var(--color-bg-hover)',
                },
                border: {
                    DEFAULT: 'var(--color-border)',
                    light: 'var(--color-border-light)',
                },
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)',
                full: 'var(--radius-full)',
            },
            boxShadow: {
                xs: 'var(--shadow-xs)',
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
            },
            fontSize: {
                xs: 'var(--font-size-xs)',
                sm: 'var(--font-size-sm)',
                base: 'var(--font-size-base)',
                lg: 'var(--font-size-lg)',
                xl: 'var(--font-size-xl)',
                '2xl': 'var(--font-size-2xl)',
                '3xl': 'var(--font-size-3xl)',
                '4xl': 'var(--font-size-4xl)',
            },
            fontWeight: {
                normal: 'var(--font-weight-normal)',
                medium: 'var(--font-weight-medium)',
                semibold: 'var(--font-weight-semibold)',
                bold: 'var(--font-weight-bold)',
                black: 'var(--font-weight-black)',
            },
            spacing: {
                xs: 'var(--spacing-xs)',
                sm: 'var(--spacing-sm)',
                md: 'var(--spacing-md)',
                lg: 'var(--spacing-lg)',
                xl: 'var(--spacing-xl)',
                '2xl': 'var(--spacing-2xl)',
                '3xl': 'var(--spacing-3xl)',
            },
            transitionDuration: {
                fast: '150ms',
                base: '200ms',
                slow: '300ms',
            },
            transitionTimingFunction: {
                'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            animation: {
                'fade-in': 'g-fadeIn 0.3s ease both',
                'fade-in-up': 'g-fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
                'scale-in': 'g-scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
                'content-fade': 'g-contentFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
                'slide-up': 'g-slideUp 0.3s ease both',
                'spin-slow': 'g-spin 1s linear infinite',
                'heart-pop': 'g-heartPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'shimmer': 'g-shimmer 1.5s ease-in-out infinite',
            },
            screens: {
                'xs': '400px',
                'mobile': '640px',
                'tablet': '769px',
            },
        },
    },
    plugins: [],
}
