import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
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
        brand: {
          accent: "#5AD769",
          main: "#324BC3",
          orange: "#FF7F4F",
        },
        text: {
          primary: "#FFF",
          secondary: "#0C0F19",
          gray: "#888888",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        customgray: "#18181B",
        borderLight: "hsla(0, 100%, 100%, 0.14)",
        borderHover: "rgba(255, 255, 255, 0.15)",
        btnHover: "hsla(0, 0%, 100%, 0.09)",
        "dark-translucent": "#ffffff20",
        "dark-gray": "#1A1A1A",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#FF887A",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        /* -----  ------ */
        "hero-bg": "#000",
        "custom-gray": "#8A919E",
        "custom-light-gray": "#DFE1E6",
        "custom-dark-gray": "#141B1F",
        "custom-medium-gray": "#363C46",
        "custom-black": "#0B0B12",
        "neutral-500": "#868E96",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: [...defaultTheme.fontFamily.mono],
        poppins: ["var(--font-poppins)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "3.5xl": "2.2rem",
        "4xl": "2.5rem",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
