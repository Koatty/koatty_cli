const { promptInput, promptSelect } = require("../src/utils/interactive");

console.log("Interactive module loaded successfully");
console.log("promptInput:", typeof promptInput);
console.log("promptSelect:", typeof promptSelect);

console.log("\nTo test interactively, uncomment the code below:");
console.log("// Uncomment for interactive testing:");
console.log("// (async () => {");
console.log(
  '//   const name = await promptInput("Enter your name:", "Guest");',
);
console.log('//   console.log("Hello, " + name);');
console.log(
  '//   const choice = await promptSelect("Select a fruit:", ["Apple", "Banana", "Orange"], "Apple");',
);
console.log('//   console.log("You selected: " + choice);');
console.log("// })();");
