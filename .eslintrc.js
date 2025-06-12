/**
 * ESLint configuration for JavaScript project
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
  ],
  plugins: [
    'jest',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "no-empty": "warn",
    "no-undef": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2],
  },
};
