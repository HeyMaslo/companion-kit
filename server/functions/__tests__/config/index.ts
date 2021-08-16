export type TestEnvironment
    = 'DOCKER'	// Docker image build, used for CI
    | 'DEV';	// local development environment i.e. user machine

export type TestConfig = {
    environment: TestEnvironment,
};

import config from './test-config';

const testConfig: TestConfig = config;

export default testConfig;