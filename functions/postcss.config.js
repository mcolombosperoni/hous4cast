// Empty PostCSS config — prevents Vite from climbing to the monorepo root
// and loading the root postcss.config.js (which requires tailwindcss,
// not installed in the functions package).
module.exports = {};

