module.exports = {
    presets: [require("nativewind/preset")],
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                brand: {
                    cream: {
                        DEFAULT: "#F9F7F4",
                        dark: "#121212",
                    },
                    sage: {
                        DEFAULT: "#697D59",
                        dark: "#4A5D3F",
                    },
                    charcoal: {
                        DEFAULT: "#2D2D2D",
                        light: "#A1A1A1",
                        dark: "#E8E5E1",
                    }
                }
            }
        },
    },
    plugins: [],
}
