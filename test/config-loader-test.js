const { loadConfig } = require("../src/utils/config_loader");
const path = require("path");
const fs = require("fs");
const os = require("os");

console.log("Config loader test");
console.log("===================");
console.log("");

const homeDir = os.homedir();
console.log("Home directory:", homeDir);
console.log("Config path:", path.join(homeDir, ".koattyrc"));
console.log("");

console.log("Test 1: No config file");
const config1 = loadConfig();
console.log("Config:", JSON.stringify(config1));
console.log("Config type:", typeof config1);
console.log("Keys:", Object.keys(config1));
console.log("");

console.log("Test 2: Create temp config file");
const testConfigPath = path.join(homeDir, ".koattyrc_test");
fs.writeFileSync(
  testConfigPath,
  JSON.stringify({ author: "test_user" }),
  "utf8",
);
console.log("Created test config:", testConfigPath);
console.log("");

console.log("Note: To test with actual config file, run:");
console.log(
  '1. Create ~/.koattyrc with: echo \'{"author": "test_user"}\' > ~/.koattyrc',
);
console.log("2. Run: node test/config-loader-test.js");
console.log("3. Check if author field is loaded");
console.log("");

console.log("Test 3: Load without config file");
const config2 = loadConfig();
console.log("Config:", JSON.stringify(config2));
console.log("Expected: {} (empty object)");

fs.unlinkSync(testConfigPath);
