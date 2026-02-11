module.exports = {
    presets: [require("nativewind/preset")],
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                brand: {
                    // Primary - Teal
                    teal: {
                        DEFAULT: "#307b75",
                        light: "#cbe8e5",
                        dark: "#1f5450",
                    },
                    // Accent - Coral
                    coral: {
                        DEFAULT: "#f45d48",
                        light: "#ff8a7a",
                        dark: "#d43d28",
                    },
                    // Secondary - Orange
                    orange: {
                        DEFAULT: "#fd7223",
                        light: "#ff9d5c",
                        dark: "#e55a0a",
                    },
                    // Backgrounds
                    peach: {
                        DEFAULT: "#f2f2f2",
                        light: "#f9f9f9",
                        dark: "#2a2a2a",
                    },
                    // Text & Neutrals
                    gray: {
                        DEFAULT: "#2a2a2a",
                        light: "#f2f2f2",
                        medium: "#8a8a8a",
                    },
                    // Legacy aliases for gradual migration
                    cream: {
                        DEFAULT: "#ffe4cc",
                        dark: "#2a2a2a",
                    },
                    sage: {
                        DEFAULT: "#307b75",
                        dark: "#1f5450",
                    },
                    charcoal: {
                        DEFAULT: "#2a2a2a",
                        light: "#8a8a8a",
                        dark: "#f2f2f2",
                    }
                }
            }
        },
    },
    plugins: [],
}
