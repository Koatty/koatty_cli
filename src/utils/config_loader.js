const path = require("path");
const fs = require("fs");
const os = require("os");

function loadConfig() {
  const homeDir = os.homedir();
  const configPath = path.join(homeDir, ".koattyrc");

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);
    return config;
  } catch (error) {
    return {};
  }
}

module.exports = {
  loadConfig,
};
