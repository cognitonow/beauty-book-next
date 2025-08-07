/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  // Add a transform entry for .ts and .tsx files to explicitly use ts-jest with Babel presets
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
        babelConfig: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-typescript',
          ],
        },
      },
    ],
  },
};