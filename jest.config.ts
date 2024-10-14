import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest',
};

export default config;
