module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: "#C8CAE8",         // Soft lavender background
          surface: "#171825",    // Deep navy/charcoal card surface
          accent: "#8F72FF",     // Violet primary accent
          border: "#1C1D2E",     // Visible dark borders
          text: "#E2E2F5",       // Light off-white text inside cards
          darktext: "#1C1D2E",   // Dark text for the lavender background
          olive: "#AEED5D",      // Lime accent
          amber: "#FFB74D",      // Amber accent
          sepia: "#FF8A80",      // Muted coral accent
          cyan: "#4FC3F7",       // Cyan accent
          violet: "#8F72FF",     // Violet accent
        }
      },
      fontFamily: {
        pixel: ["'Pixelify Sans'", "Silkscreen", "monospace"],
        terminal: ["'JetBrains Mono'", "'IBM Plex Mono'", "'Space Mono'", "monospace"],
        heading: ["'Pixelify Sans'", "VT323", "monospace"],
      }
    }
  },
  plugins: [],
}