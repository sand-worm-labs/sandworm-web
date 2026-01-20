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

        primary: "hsl(var(--primary))",
        primaryForeground: "hsl(var(--primary-foreground))",

        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        error: "hsl(var(--error))",

        base: {
          100: "hsl(var(--base-100))",
          200: "hsl(var(--base-200))",
          300: "hsl(var(--base-300))",
        },

        ink: {
          100: "var(--ink-100)",
          200: "var(--ink-200)",
          300: "var(--ink-300)",
          400: "var(--ink-400)",
          500: "var(--ink-500)",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        inputBg: "hsl(var(--bg-input))",

        disabled: "hsl(var(--btn-disabled))",

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
