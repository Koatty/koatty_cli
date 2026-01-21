const { loadConfig } = require("../src/utils/config_loader");

console.log("Template config test");
console.log("====================");
console.log("");
console.log("This test verifies template URL configuration override.");
console.log("");
console.log("To test with custom template URL:");
console.log("1. Create ~/.koattyrc with:");
console.log("   {");
console.log('     "template_url": {');
console.log('       "koatty_template": "https://github.com/custom/template",');
console.log(
  '       "koatty_template_cli": "https://github.com/custom/cli_template"',
);
console.log("     }");
console.log("   }");
console.log("");
console.log("2. Run: node src/index.js new test-project");
console.log(
  '   - Should see "Using custom template URL from config: ..." in output',
);
console.log("");

const config = loadConfig();
console.log(
  "Current config template_url:",
  config.template_url
    ? JSON.stringify(config.template_url, null, 2)
    : "Not configured",
);
