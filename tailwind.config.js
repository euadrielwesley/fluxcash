/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#7c3aed",
                "primary-dark": "#6d28d9",
                "primary-light": "#a78bfa",
                "background-light": "#f8fafc",
                "card-light": "#ffffff",
                "text-main": "#0f172a",
                "text-muted": "#64748b",
                "danger": "#f43f5e",
                "warning": "#eab308",
                "success": "#10b981",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"]
            },
            borderRadius: {
                "xl": "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
            },
            boxShadow: {
                "soft": "0 2px 10px rgba(0, 0, 0, 0.03)",
                "glow": "0 0 20px rgba(124, 58, 237, 0.5)",
            },
            animation: {
                'shimmer': 'shimmer 2s linear infinite',
                'fade-in': 'fade-in 0.5s ease-out',
                'bounce-slow': 'bounce 3s infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            }
        }
    },
    plugins: [],
}
