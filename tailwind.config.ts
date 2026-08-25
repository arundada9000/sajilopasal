import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* iOS Semantic Color Tokens (direct CSS var access) */
        "green": "var(--green)",
        "green-soft": "var(--green-soft)",
        "green-text": "var(--green-text)",
        "green-bg": "var(--green-bg)",
        "green-border": "var(--green-border)",
        "red": "var(--red)",
        "red-soft": "var(--red-soft)",
        "red-text": "var(--red-text)",
        "red-bg": "var(--red-bg)",
        "red-border": "var(--red-border)",
        "blue-text": "var(--blue-text)",
        "blue-bg": "var(--blue-bg)",
        "blue-border": "var(--blue-border)",
        "amber-text": "var(--amber-text)",
        "amber-bg": "var(--amber-bg)",
        "amber-border": "var(--amber-border)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        "surface-hover": "var(--surface-hover)",
        "glass-bg": "var(--glass-bg)",
        "glass-border": "var(--glass-border)",
        "numpad-key": "var(--numpad-key)",
        "overlay-bg": "var(--overlay-bg)",
        "sheet-bg": "var(--sheet-bg)",
        "on-primary": "var(--on-primary)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xs: "var(--radius-xs)",
        sheet: "var(--radius-sheet)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "var(--font-mukta)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
