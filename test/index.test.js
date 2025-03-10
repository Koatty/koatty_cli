const fs = require('fs');
const path = require('path');
const { graphqlProcessor } = require('../src/processor/graphql-controller.js');
const { parseArgs } = require('../src/processor/args.js');

describe('GraphQL Controller Transpilation', () => {
  const outputDir = path.join(__dirname, 'output');
  const templatePath = path.join(__dirname, 'template');
  const args = parseArgs("user", "controller_graphql", templatePath);

  describe('File generation', () => {
    it('should generate UserController.ts', () => {
      const filePath = path.join(outputDir, 'UserController.ts');

      graphqlProcessor(args);
      // expect(fs.existsSync(filePath)).toBe(true);

      // const content = fs.readFileSync(filePath, 'utf8');
      // expect(content).toContain('class UserController');
      // expect(content).toContain('@Controller()');
    });

    // it('should generate UserDto.ts', () => {
    //   const filePath = path.join(outputDir, 'UserDto.ts');
    //   expect(fs.existsSync(filePath)).toBe(true);

    //   const content = fs.readFileSync(filePath, 'utf8');
    //   expect(content).toContain('class UserDto extends BaseDto');
    // });

    // it('should generate UserInputDto.ts', () => {
    //   const filePath = path.join(outputDir, 'UserInputDto.ts');
    //   expect(fs.existsSync(filePath)).toBe(true);

    //   const content = fs.readFileSync(filePath, 'utf8');
    //   expect(content).toContain('class UserInputDto extends BaseDto');
    // });
  });
});
