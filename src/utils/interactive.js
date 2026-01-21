const inquirer = require("inquirer");

async function promptInput(message, defaultVal) {
  try {
    const { answer } = await inquirer.prompt([
      {
        type: "input",
        name: "answer",
        message,
        default: defaultVal || "",
      },
    ]);
    return answer;
  } catch (error) {
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment");
    } else {
      process.exit(0);
    }
  }
}

async function promptSelect(message, choices, defaultVal) {
  try {
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
  } catch (error) {
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment");
    } else {
      process.exit(0);
    }
  }
}

module.exports = {
  promptInput,
  promptSelect,
};
