module.exports = {
  purge: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#F78000",
        "primary-hover": "#db7506",
        peach: "#F4EAE1",
        "peach-light": "#FFF6EF",
        "peach-hover": "#FFE0B2",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
