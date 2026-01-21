const inquirer = require("inquirer");

async function promptInput(message, defaultVal) {
  const { answer } = await inquirer.prompt([
    {
      type: "input",
      name: "answer",
      message,
      default: defaultVal || "",
    },
  ]);
  return answer;
}

async function promptSelect(message, choices, defaultVal) {
  const { answer } = await inquirer.prompt([
    {
      type: "list",
      name: "answer",
      message,
      choices,
      default: defaultVal || choices[0],
    },
  ]);
  return answer;
}

module.exports = {
  promptInput,
  promptSelect,
};
