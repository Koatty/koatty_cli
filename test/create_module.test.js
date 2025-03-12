const createModule = require('../src/command/create_module');
const log = require('../src/utils/log');
const ufs = require('../src/utils/fs');
const template = require('../src/utils/template');
const path = require('path');

// Mock dependencies
jest.mock('../src/utils/log');
jest.mock('../src/utils/fs');
jest.mock('../src/utils/template');
jest.mock('../src/processor/controller');
jest.mock('../src/processor/middleware');
jest.mock('../src/processor/model');
jest.mock('../src/processor/service');
jest.mock('../src/processor/default');
jest.mock('../src/utils/path');
jest.mock('prettier', () => ({
  resolveConfig: jest.fn().mockResolvedValue({}),
  format: jest.fn().mockImplementation((code) => Promise.resolve(code))
}));
// 手动模拟format.js
jest.mock('../src/utils/format', () => ({
  writeAndFormatFile: jest.fn().mockResolvedValue(undefined)
}));


describe('createModule', () => {
  const mockTemplatePath = '/mock/template/path';
  const mockDestMap = { '/mock/src': '/dest/path' };
  const mockCreateMap = { '/mock/create.js': 'content' };
  const mockReplaceMap = { '{{name}}': 'TestModule' };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    template.loadAndUpdateTemplate.mockResolvedValue(mockTemplatePath);
    ufs.isExist.mockReturnValue(true);
    require('../src/utils/path').isKoattyApp.mockReturnValue(true);
  });

  test('should create controller module successfully', async () => {
    // Mock controller processor
    const { createController } = require('../src/processor/controller');
    createController.mockReturnValue({
      newName: 'TestController',
      destMap: mockDestMap,
      createMap: mockCreateMap,
      replaceMap: mockReplaceMap,
      callBack: jest.fn()
    });

    await createModule('Test', 'controller', {});

    // Verify core logic
    expect(log.info).toHaveBeenCalledWith('Start create module...');
    expect(template.loadAndUpdateTemplate).toHaveBeenCalled();
    expect(createController).toHaveBeenCalledWith('Test', 'controller', {}, expect.any(String));
    expect(ufs.copyFile).toHaveBeenCalledWith('/mock/src', '/dest/path');
  });

  test('should handle non-Koatty project error', async () => {
    require('../src/utils/path').isKoattyApp.mockReturnValue(false);

    await createModule('Test', 'controller', {});

    expect(log.error).toHaveBeenCalledWith('Current project is not a Koatty project.');
  });

  test('should handle template loading failure', async () => {
    template.loadAndUpdateTemplate.mockResolvedValue(null);

    await createModule('Test', 'controller', {});

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Create module fail'));
  });

  test('should handle file creation errors', async () => {
    const { createController } = require('../src/processor/controller');
    createController.mockReturnValue({
      destMap: { '/invalid/path': '/dest' },
      createMap: mockCreateMap,
      replaceMap: mockReplaceMap
    });
    ufs.copyFile.mockRejectedValue(new Error('File error'));

    await createModule('Test', 'controller', {});

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Create module error'));
  });

  test('should create service module with custom options', async () => {
    const { createService } = require('../src/processor/service');
    createService.mockReturnValue({
      newName: 'TestService',
      destMap: mockDestMap,
      createMap: mockCreateMap,
      replaceMap: mockReplaceMap
    });

    await createModule('Test', 'service', { force: true });

    expect(createService).toHaveBeenCalledWith('Test', 'service', { force: true }, expect.any(String));
  });
});
