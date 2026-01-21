const { promptInput, promptSelect } = require("../src/utils/interactive");

console.log("Interactive controller module test");
console.log("====================================");
console.log(
  "This test would verify the interactive logic is properly integrated.",
);
console.log("");
console.log("Test cases to verify manually:");
console.log("1. Run: node src/index.js controller");
console.log('   - Should prompt: "Enter controller name:"');
console.log('   - Then prompt: "Select controller type:"');
console.log("");
console.log("2. Run: node src/index.js controller mycontroller");
console.log("   - Should skip name prompt");
console.log('   - Should prompt: "Select controller type:"');
console.log("");
console.log("3. Run: node src/index.js controller mycontroller -t grpc");
console.log("   - Should skip both prompts");
console.log("   - Should create controller with grpc type");
console.log("");
console.log("Interactive module test:");
console.log("promptInput type:", typeof promptInput);
console.log("promptSelect type:", typeof promptSelect);
