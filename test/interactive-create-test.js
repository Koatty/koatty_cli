const { promptInput, promptSelect } = require("../src/utils/interactive");

console.log("Interactive create_project test");
console.log("================================");
console.log(
  "This test would verify the interactive logic is properly integrated.",
);
console.log("");
console.log("Test cases to verify manually:");
console.log("1. Run: node src/index.js new");
console.log('   - Should prompt: "Please enter the project name:"');
console.log('   - Then prompt: "Select template type:"');
console.log("");
console.log("2. Run: node src/index.js new mytest");
console.log("   - Should skip project name prompt");
console.log('   - Should prompt: "Select template type:"');
console.log("");
console.log("3. Run: node src/index.js new mytest -t middleware");
console.log("   - Should skip both prompts");
console.log("   - Should create project with middleware template");
console.log("");
console.log("Interactive module test:");
console.log("promptInput type:", typeof promptInput);
console.log("promptSelect type:", typeof promptSelect);
