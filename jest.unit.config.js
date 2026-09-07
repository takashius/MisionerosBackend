/**
 * Jest configuration for UNIT tests only
 * These tests use mocks and don't need MongoDB
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/**/__tests__/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 10000,
};
