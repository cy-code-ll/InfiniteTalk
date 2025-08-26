/** @type {import('tailwindcss').Config} */
const defaultColors = require('tailwindcss/colors');

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    colors: {
      ...defaultColors,
    },
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        inter: ['var(--font-inter)'],
        fredoka: ['Fredoka One', 'cursive'],
        baloo: ['var(--font-baloo)'],
        nunito: ['var(--font-nunito)']
      },
      maxWidth: {
        '7xl': '80rem',
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "#FFFFFF",
        foreground: "#212121",
        primary: {
          DEFAULT: "rgba(0, 151, 167, 0.8)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F5",
          foreground: "#212121",
        },
        destructive: {
          DEFAULT: "#E63946",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E0E0E0",
          foreground: "#757575",
        },
        accent: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107",
        error: "#E63946",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
        'custom': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'nav': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} 