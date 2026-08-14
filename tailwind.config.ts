import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // ── Backgrounds (4 elevation levels) ──────────────────────────
        background: "var(--background)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        overlay: "var(--overlay)",

        // ── Text ──────────────────────────────────────────────────────
        foreground: "var(--foreground)",
        tertiary: "var(--tertiary)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        // ── Borders / inputs ──────────────────────────────────────────
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        input: "var(--input)",
        ring: "var(--ring)",

        // ── Surfaces ──────────────────────────────────────────────────
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        // ── Primary — Electric Blue ───────────────────────────────────
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          muted: "var(--primary-muted)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },

        // ── AI — Violet ───────────────────────────────────────────────
        ai: {
          DEFAULT: "var(--ai)",
          foreground: "var(--ai-foreground)",
          hover: "var(--ai-hover)",
          muted: "var(--ai-muted)",
        },

        // ── Status ────────────────────────────────────────────────────
        success: {
          DEFAULT: "var(--success)",
          muted: "var(--success-muted)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          muted: "var(--warning-muted)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          muted: "var(--danger-muted)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--primary-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          muted: "var(--info-muted)",
        },

        // ── Sidebar ───────────────────────────────────────────────────
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          border: "var(--sidebar-border)",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Sora", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-primary": "var(--shadow-glow-primary)",
        "glow-ai": "var(--shadow-glow-ai)",
        elevated: "var(--shadow-elevated)",
        "card-hover": "var(--shadow-card-hover)",
      },
      spacing: {
        sidebar: "248px",
        "sidebar-collapsed": "64px",
        header: "56px",
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
