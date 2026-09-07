/**
 * Jest configuration for INTEGRATION tests only
 * These tests need MongoDB Memory Server
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: ["**/tests/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetModules: false,
  testTimeout: 60000,
  maxWorkers: 1,
};
