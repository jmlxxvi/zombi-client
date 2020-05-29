const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: [
    "./src/*.html",
    "./src/views/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/ui'),
  ],
  corePlugins: {
    float: false,
    clear: false
  }
}