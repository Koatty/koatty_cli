/*
 * @Description: CLI功能测试
 * @Usage: 测试CLI工具的基本功能
 * @Author: richen
 * @Date: 2025-06-12
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI_PATH = path.join(__dirname, '..', 'src', 'index.js');

describe('CLI Functionality Tests', () => {
  describe('Basic CLI Commands', () => {
    test('应该能显示帮助信息', (done) => {
      exec(`node ${CLI_PATH} --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('Usage:');
        expect(stdout).toContain('Commands:');
        done();
      });
    });

    test('应该能显示版本信息', (done) => {
      exec(`node ${CLI_PATH} --version`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        // 检查版本号格式（应该是语义化版本）
        expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
        done();
      });
    });

    test('应该能显示短格式的帮助信息', (done) => {
      exec(`node ${CLI_PATH} -h`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('Usage:');
        expect(stdout).toContain('Commands:');
        done();
      });
    });

    test('应该能显示短格式的版本信息', (done) => {
      exec(`node ${CLI_PATH} -V`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
        done();
      });
    });
  });

  describe('Command Help', () => {
    test('应该能显示project命令的帮助', (done) => {
      exec(`node ${CLI_PATH} project --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('project');
        expect(stdout).toContain('Usage:');
        done();
      });
    });

    test('应该能显示controller命令的帮助', (done) => {
      exec(`node ${CLI_PATH} controller --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('controller');
        expect(stdout).toContain('Usage:');
        done();
      });
    });

    test('应该能显示service命令的帮助', (done) => {
      exec(`node ${CLI_PATH} service --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('service');
        expect(stdout).toContain('Usage:');
        done();
      });
    });

    test('应该能显示middleware命令的帮助', (done) => {
      exec(`node ${CLI_PATH} middleware --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('middleware');
        expect(stdout).toContain('Usage:');
        done();
      });
    });

    test('应该能显示model命令的帮助', (done) => {
      exec(`node ${CLI_PATH} model --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('model');
        expect(stdout).toContain('Usage:');
        done();
      });
    });

    test('应该能显示plugin命令的帮助', (done) => {
      exec(`node ${CLI_PATH} plugin --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stdout).toContain('plugin');
        expect(stdout).toContain('Usage:');
        done();
      });
    });
  });

  describe('Command Validation', () => {
    test('should handle invalid commands', (done) => {
      exec(`node ${CLI_PATH} invalid-command`, (error, stdout, stderr) => {
        if (!error) {
          fail('Expected command to fail');
        }
        expect(error.code).not.toBe(0);
        expect(stderr).toMatch(/Unknown command: invalid-command/);
        done();
      });
    });

    test('should handle missing required parameters', (done) => {
      exec(`node ${CLI_PATH} project`, (error, stdout, stderr) => {
        if (!error) {
          fail('Expected command to fail');
        }
        expect(error.code).not.toBe(0);
        expect(stderr).toMatch(/missing required argument 'projectName'/);
        done();
      });
    });
  });

  describe('Output Format', () => {
    test('帮助信息应该格式正确', (done) => {
      exec(`node ${CLI_PATH} --help`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        
        // 检查基本格式
        expect(stdout).toContain('Usage:');
        expect(stdout).toContain('Commands:');
        expect(stdout).toContain('Options:');
        
        // 检查是否包含主要命令
        expect(stdout).toContain('new');
        expect(stdout).toContain('controller');
        expect(stdout).toContain('service');
        done();
      });
    });

    test('版本信息应该只包含版本号', (done) => {
      exec(`node ${CLI_PATH} --version`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        
        // 版本信息应该只是版本号，没有其他内容
        const lines = stdout.trim().split('\n');
        expect(lines.length).toBe(1);
        expect(lines[0]).toMatch(/^\d+\.\d+\.\d+$/);
        done();
      });
    });
  });

  describe('Command Aliases', () => {
    test('应该支持命令别名', (done) => {
      // 测试是否支持常见的别名
      exec(`node ${CLI_PATH} --help`, (error1, stdout1, stderr1) => {
        expect(error1).toBeNull();
        exec(`node ${CLI_PATH} -h`, (error2, stdout2, stderr2) => {
          expect(error2).toBeNull();
          expect(stdout1).toBe(stdout2);
          done();
        });
      });
    });
  });

  describe('Exit Codes', () => {
    test('成功命令应该返回0退出码', (done) => {
      exec(`node ${CLI_PATH} --version`, (error, stdout, stderr) => {
        // exec在成功时error为null，这意味着退出码是0
        expect(error).toBeNull();
        expect(stdout).toBeTruthy();
        done();
      });
    });

    test('失败命令应该返回非0退出码', (done) => {
      exec(`node ${CLI_PATH} invalid-command`, (error, stdout, stderr) => {
        expect(error).not.toBeNull();
        expect(error.code).not.toBe(0);
        done();
      });
    });
  });

  describe('Package.json Integration', () => {
    test('版本号应该与package.json一致', (done) => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      exec(`node ${CLI_PATH} --version`, (error, stdout, stderr) => {
        expect(error).toBeNull();
        const cliVersion = stdout.trim();
        expect(cliVersion).toBe(packageJson.version);
        done();
      });
    });
  });
}); 