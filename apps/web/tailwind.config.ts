import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: "500px",
        md: "800px",
        lg: "1200px",
        xl: "1536px",
      },

      colors: {
        /* ======================
           Design Tokens (NEW)
           ====================== */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          tint: {
            50: "var(--primary-tint-50)",
            75: "var(--primary-tint-75)",
            100: "var(--primary-tint-100)",
          },
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          700: "var(--primary-700)",
          710: "var(--primary-710)",
          720: "var(--primary-720)",
          900: "var(--primary-900)",
          910: "var(--primary-910)",
          920: "var(--primary-920)",
        },
        primaryForeground: "hsl(var(--primary-foreground))",

        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        error: "hsl(var(--error))",

        base: {
          100: "hsl(var(--base-100))",
          200: "hsl(var(--base-200))",
          300: "hsl(var(--base-300))",
          350: "var(--base-350)",
          360: "var(--base-360)",
          400: "hsl(var(--base-400))",
          500: "var(--base-500)",
          600: "hsl(var(--base-600))",
          700: "var(--base-700)",
          710: "var(--base-710)",
          720: "var(--base-720)",
          730: "var(--base-730)",
          740: "var(--base-740)",
          750: "var(--base-750)",
          760: "var(--base-760)",
          770: "var(--base-770)",
        },

        gray: {
          100: "var(--gray-100)",
        },

        ink: {
          100: "var(--ink-100)",
          200: "var(--ink-200)",
          300: "var(--ink-300)",
          400: "var(--ink-400)",
          500: "var(--ink-500)",
          600: "var(--ink-600)",
          700: "var(--ink-700)",
          icon: "var(--ink-icon)",
          navy: "var(--ink-navy)",
        },

        "menu-ink": "var(--menu-ink)",
        "menu-ink-200": "var(--menu-ink-200)",

        "hero-base": "#141B1F",

        border: "hsl(var(--border))",
        "border-secondary": "hsl(var(--border-secondary))",
        "border-tertiary": "hsl(var(--border-tertiary))",
        "border-focus": "hsl(var(--border-focus))",
        "border-quiet": "var(--border-quiet)",
        "border-faint": "var(--border-faint)",
        "border-cool": "var(--border-cool)",

        input: "hsl(var(--input))",
        inputBg: "hsl(var(--bg-input))",

        disabled: "hsl(var(--btn-disabled))",

        editor: {
          100: "var(--editor-100)",
          200: "var(--editor-200)",
          300: "var(--editor-300)",
          400: "var(--editor-400)",
          500: "var(--editor-500)",
          600: "var(--editor-600)",
        },

        "hover-bg": "var(--hover-bg)",
        "hover-border": "var(--hover-border)",

        warning: "var(--warning)",
        link: "var(--link)",
        "link-tint": "var(--link-tint)",
        "accent-violet": "var(--accent-violet)",
        "error-tint": "var(--error-tint)",
        "error-shade": "var(--error-shade)",
        "info-tint": "var(--info-tint)",
        "icon-muted": "var(--icon-muted)",
        teal: "var(--teal)",

        /* ======================
           Legacy Colors (OLD)
           ====================== */
        ring: "hsl(var(--ring))",

        legacy: {
          primary: "#A308F0",
          lightBorder: "#E9ECEF",
          lightText: "#455768",
          lightMain: "#1A1A1A",

          darkBorder: "#262A30",
          darkBg: "#010100",

          brand: {
            accent: "#5AD769",
            main: "#324BC3",
            orange: "#FF7F4F",
          },

          text: {
            secondary: "#0C0F19",
            gray: "#888888",
          },

          heroBg: "#000",
          neutral500: "#868E96",
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
