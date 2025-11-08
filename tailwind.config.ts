// tailwind.config.ts

import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: "class",
  theme: {
    colors: {
      // ... (toda tu configuración de colores permanece igual que en la respuesta anterior)
      neutral: {
        50: 'oklch(0.985 0 0)',
        100: 'oklch(0.97 0 0)',
        200: 'oklch(0.922 0 0)',
        300: 'oklch(0.832 0 0)',
        400: 'oklch(0.708 0 0)',
        500: 'oklch(0.571 0 0)',
        600: 'oklch(0.439 0 0)',
        700: 'oklch(0.336 0 0)',
        800: 'oklch(0.235 0 0)',
        900: 'oklch(0.175 0 0)',
        950: 'oklch(0.125 0 0)',
      },
      positive: {
        50: 'oklch(0.97 0.02 142)',
        100: 'oklch(0.94 0.04 142)',
        200: 'oklch(0.88 0.08 142)',
        300: 'oklch(0.78 0.12 142)',
        400: 'oklch(0.68 0.14 142)',
        500: 'oklch(0.58 0.15 142)',
        600: 'oklch(0.48 0.14 142)',
        700: 'oklch(0.4 0.12 142)',
        800: 'oklch(0.32 0.1 142)',
        900: 'oklch(0.26 0.08 142)',
        950: 'oklch(0.2 0.06 142)',
        DEFAULT: 'var(--positive)',
        foreground: 'var(--positive-foreground)',
      },
      secondary: {
        50: 'oklch(0.96 0.01 45)',
        100: 'oklch(0.92 0.02 45)',
        200: 'oklch(0.84 0.04 45)',
        300: 'oklch(0.72 0.06 45)',
        400: 'oklch(0.6 0.08 45)',
        500: 'oklch(0.5 0.09 45)',
        600: 'oklch(0.42 0.08 45)',
        700: 'oklch(0.35 0.07 45)',
        800: 'oklch(0.28 0.06 45)',
        900: 'oklch(0.22 0.05 45)',
        950: 'oklch(0.17 0.04 45)',
        DEFAULT: 'var(--secondary)',
        foreground: 'var(--secondary-foreground)',
      },
      negative: {
        50: 'oklch(0.97 0.02 27)',
        100: 'oklch(0.94 0.05 27)',
        200: 'oklch(0.88 0.1 27)',
        300: 'oklch(0.78 0.16 27)',
        400: 'oklch(0.68 0.2 27)',
        500: 'oklch(0.58 0.22 27)',
        600: 'oklch(0.5 0.21 27)',
        700: 'oklch(0.42 0.18 27)',
        800: 'oklch(0.34 0.15 27)',
        900: 'oklch(0.28 0.12 27)',
        950: 'oklch(0.22 0.09 27)',
        DEFAULT: 'var(--negative)',
        foreground: 'var(--negative-foreground)',
      },
      background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input-background)',
        ring: 'var(--ring)',
      primary: { DEFAULT: 'var(--primary)',
        foreground: 'var(--primary-foreground)' },
      destructive: { DEFAULT: 'var(--destructive)',
        foreground: 'var(--destructive-foreground)' },
      muted: { DEFAULT: 'var(--muted)',
        foreground: 'var(--muted-foreground)' },
      accent: { DEFAULT: 'var(--accent)',
        foreground: 'var(--accent-foreground)' },
      popover: { DEFAULT: 'var(--popover)',
        foreground: 'var(--popover-foreground)' },
      card: { DEFAULT: 'var(--card)',
        foreground: 'var(--card-foreground)' },
      sidebar: { DEFAULT: 'var(--sidebar)',
        foreground: 'var(--sidebar-foreground)',
        primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
        accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
        border: 'var(--sidebar-border)',
        ring: 'var(--sidebar-ring)' },
    },
    
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
      xl: "calc(var(--radius) + 4px)",
    },
    
    extend: {
      fontFamily: {
        // 2. USO CORREGIDO: Accede a la propiedad 'sans' del objeto 'fontFamily'
        // que está dentro del objeto 'defaultTheme' que importamos.
        sans: ["Manrope", ...defaultTheme.fontFamily.sans],
      },
    },
  },

  plugins: [],

} satisfies Config;