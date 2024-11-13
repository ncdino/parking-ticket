module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",

    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        paperlogy: ["var(--font-paperlogy)", "sans-serif"],
        pretendard: ["var(--font-pretendard)"],
      },
    },
  },
  plugins: [],
};
