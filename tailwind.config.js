import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ['Inter', ...defaultTheme.fontFamily.sans],
                heading: ['Inter', ...defaultTheme.fontFamily.sans],
                body: ['Inter', ...defaultTheme.fontFamily.sans],
                signika: ['Signika', ...defaultTheme.fontFamily.sans],
                'dm-sans': ['DM Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: '#12403c',
                secondary: 'var(--text-secondary)',
                onPrimary: '#ffffff',
                canvas: '#ffffff',
                softCloud: '#f4f7f6',
                ink: '#17211f',
                charcoal: '#2f3c38',
                ash: '#56635f',
                mute: '#7b8783',
                stone: '#a8b1ad',
                hairline: '#cfd9d5',
                hairlineSoft: '#e3ebe7',
                sale: '#c2410c',
                saleDeep: '#9a3412',
                success: '#147a57',
                successBright: '#0f8f64',
                info: '#2563eb',
                infoDeep: '#1d4ed8',
                warning: '#b7791f',
                warningSoft: '#fff7ed',
                field: '#eef4f1',
                steel: '#334155',
                tealSoft: '#e7f4f0',
                amberSoft: '#fff3d6',
                blueSoft: '#e8f0ff',
            },
            borderRadius: {
                none: '0px',
                sm: '6px',
                md: '8px',
                lg: '10px',
                full: '9999px',
            },
            spacing: {
                xxs: '2px',
                xs: '4px',
                sm: '8px',
                md: '12px',
                lg: '18px',
                xl: '24px',
                xxl: '30px',
                section: '48px',
            },
            fontSize: {
                'display-campaign': ['96px', { lineHeight: '0.9', letterSpacing: '0', fontWeight: '500' }],
                'heading-xl': ['32px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '500' }],
                'heading-lg': ['24px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '500' }],
                'heading-md': ['16px', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '500' }],
                'body-md': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
                'body-strong': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
                'button-lg': ['24px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '500' }],
                'button-md': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
                'button-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
                'caption-md': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
                'caption-sm': ['12px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
                'utility-xs': ['9px', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '500' }],
            },
            animation: {
                'fade-in': 'simpleFadeIn 0.3s ease-out forwards',
                'pulse-bar': 'pulseBar 1.5s ease-in-out infinite',
                'pulse-bar-delay': 'pulseBarShort 1.5s ease-in-out 0.2s infinite',
                'pulse-bar-delay2': 'pulseBar 1.5s ease-in-out 0.4s infinite',
                glow: 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                simpleFadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulseBar: {
                    '0%, 100%': {
                        height: '24px',
                        opacity: '0.6',
                    },
                    '50%': {
                        height: '12px',
                        opacity: '0.2',
                    },
                },
                pulseBarShort: {
                    '0%, 100%': {
                        height: '16px',
                        opacity: '0.6',
                    },
                    '50%': {
                        height: '8px',
                        opacity: '0.2',
                    },
                },
                glow: {
                    '0%, 100%': {
                        opacity: '0.5',
                        transform: 'scale(1)',
                    },
                    '50%': {
                        opacity: '0.8',
                        transform: 'scale(1.1)',
                    },
                },
            },
        },
    },

    plugins: [forms],
};
