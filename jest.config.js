module.exports = {
  testEnvironment: 'node', // 使用 Node 环境
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/test/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest' // 可选 Babel 转换
  },
};
