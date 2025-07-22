module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      // add your custom fontSizes, fontFamilies, etc. if you like:
      fontSize: {
        sm: "0.875rem",
        med: "1rem",
        lg: "1.125rem",
      },
      fontFamily: {
        default: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
      lineHeight: {
        normal: "1.6",
      },
      colors: {
        // use CSS vars for background/foreground
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
    },
  },
  plugins: [],
};
