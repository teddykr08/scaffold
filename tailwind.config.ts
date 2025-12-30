import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        scaffold: {
          brand: '#fdcd13',      // brand yellow
          brandHover: '#e5b811',
          steel: '#455A64',      // metal gray
        },
      },
      fontFamily: {
        graffiti: ['var(--font-graffiti)', 'cursive'],
      },
    },
  },
  plugins: [],
};
export default config;





