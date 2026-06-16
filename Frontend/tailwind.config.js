module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: "#252525",         // Deep charcoal
          surface: "#474744",    // Muted graphite
          accent: "#E8E8C6",     // Warm ivory
          border: "#8A8A7F",     // Subtle beige/gray borders
          text: "#E2E2D5",       // Off-white
          olive: "#6B705C",      // Desaturated olive
          amber: "#D4A373",      // Muted amber
          sepia: "#A68A64",      // Sepia
        }
      },
      fontFamily: {
        pixel: ["Silkscreen", "monospace"],
        terminal: ["'Space Mono'", "'Courier Prime'", "monospace"],
        heading: ["VT323", "monospace"],
      }
    }
  },
  plugins: [],
}