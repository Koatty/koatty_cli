const config = require("../src/command/config");

console.log("Config path test");
console.log("=================");
console.log("");
console.log("Local template paths:");
console.log("TEMPLATE_PATH:", config.TEMPLATE_PATH);
console.log("CLI_TEMPLATE_PATH:", config.CLI_TEMPLATE_PATH);
console.log("COM_TEMPLATE_PATH:", config.COM_TEMPLATE_PATH);
console.log("");
console.log("Remote template URLs (fallback):");
console.log("TEMPLATE_URL:", config.TEMPLATE_URL);
console.log("CLI_TEMPLATE_URL:", config.CLI_TEMPLATE_URL);
console.log("COM_TEMPLATE_URL:", config.COM_TEMPLATE_URL);
