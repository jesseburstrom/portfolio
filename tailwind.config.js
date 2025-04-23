/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Scan app dir
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Scan components dir
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }