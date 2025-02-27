import type { Config } from "tailwindcss";

export default {
  darkMode: "media", // Uses the prefers-color-scheme media query for dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Set in your globals.css
        foreground: "var(--foreground)", // Set in your globals.css
        primary: "#1E40AF",      // Can be adjusted; used for primary buttons/headers
        secondary: "#F97316",    // Accent for highlights
        accent: "#10B981",       // Additional accent color
      },
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;