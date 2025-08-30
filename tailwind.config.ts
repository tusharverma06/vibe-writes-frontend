import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import scrollbar from "tailwind-scrollbar";

export default {
  // darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
          background: "#0A0A0A",
          "background-dark": "#070708",
          "background-light": "rgba(7,7,8,0.90)",
          border: "#17171a",
          "border-light": "rgba(255,255,255,0.06)",
          green: "rgba(14,208,101,0.10)",
          purple: "rgba(138,99,210,0.10)",
          red: "#F03D3D",
          yellow: "rgba(252,191,4,0.10)",
          text: {
            "white-88": "rgba(255,255,255,0.88)",
            "white-32": "rgba(255,255,255,0.32)",
            "white-4": "rgba(255,255,255,0.04)",
            "white-8": "rgba(255,255,255,0.08)",
            "white-7": "rgba(255,255,255,0.07)",
            "white-6": "rgba(255,255,255,0.06)",
            "white-2": "rgba(255,255,255,0.02)",
            green: "#0ED065",
            purple: "#8A63D2",
            yellow: "#FCBF04",
          },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      height: {
        "10.5": "42px",
      },
      fontSize: {
        "15": "15px",
      },
    },
  },
  plugins: [animate, scrollbar({ nocompatible: true })],
} satisfies Config;
