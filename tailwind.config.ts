import type { Config } from "tailwindcss";

const colorToken = (token: string) => `hsl(var(${token}))`;

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: colorToken("--border"),
        input: colorToken("--input"),
        ring: colorToken("--ring"),
        background: colorToken("--background"),
        foreground: colorToken("--foreground"),
        primary: {
          DEFAULT: colorToken("--primary"),
          foreground: colorToken("--primary-foreground"),
        },
        secondary: {
          DEFAULT: colorToken("--secondary"),
          foreground: colorToken("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: colorToken("--destructive"),
          foreground: colorToken("--destructive-foreground"),
        },
        muted: {
          DEFAULT: colorToken("--muted"),
          foreground: colorToken("--muted-foreground"),
        },
        accent: {
          DEFAULT: colorToken("--accent"),
          foreground: colorToken("--accent-foreground"),
        },
        popover: {
          DEFAULT: colorToken("--popover"),
          foreground: colorToken("--popover-foreground"),
        },
        card: {
          DEFAULT: colorToken("--card"),
          foreground: colorToken("--card-foreground"),
        },
        sidebar: {
          DEFAULT: colorToken("--sidebar-background"),
          foreground: colorToken("--sidebar-foreground"),
          primary: colorToken("--sidebar-primary"),
          "primary-foreground": colorToken("--sidebar-primary-foreground"),
          accent: colorToken("--sidebar-accent"),
          "accent-foreground": colorToken("--sidebar-accent-foreground"),
          border: colorToken("--sidebar-border"),
          ring: colorToken("--sidebar-ring"),
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
