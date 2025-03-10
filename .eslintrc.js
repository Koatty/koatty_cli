module.exports = {
  "env": {
    "commonjs": true,
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 13
  },
  "rules": {
    // 禁止未声明变量
    "no-undef": "error",

    // 强制使用 ===
    "eqeqeq": ["warn", "always"],

    // 强制箭头函数参数使用括号
    "arrow-parens": ["warn", "always"],

    // 禁止未使用的变量
    "no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }]
  }
};