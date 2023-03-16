const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,vue,ts}", "./src/App.vue"],
    theme: {
        extend: {
            colors: {
                background: colors.slate[100],
                panel: colors.slate[200],
                "darker-panel": colors.slate[300],
                border: colors.slate[500],
                field: colors.slate[50],
                "indicator-ambient": colors.blue[500],
                "indicator-ambient-darker": colors.blue[600],
                "indicator-positive": colors.emerald[500],
                "indicator-positive-darker": colors.emerald[600],
                "indicator-negative": colors.red[500],
                "indicator-negative-darker": colors.red[600],
                "indicator-caution": colors.yellow[500],
                "indicator-caution-darker": colors.yellow[600],
            },
            fontFamily: {
                roboto: ["Roboto", ...defaultTheme.fontFamily.sans],
                sans: ["Open Sans", ...defaultTheme.fontFamily.sans],
            },
        },
    },
};
