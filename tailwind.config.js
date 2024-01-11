module.exports = {
  purge: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    fontSize: {
      base: "14px",
      sm: "12px",
    },
    extend: {
      fontFamily: {
        roboto: ["Roboto"],
      },
      colors: {
        primary: "#008181",
        "primary-hover": "#A6D3D3",
        grey: "#787878",
        black: "#000000",
        red: "#B3261E",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  plugins: [],
};
