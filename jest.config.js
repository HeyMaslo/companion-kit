module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    'testMatch': [
        '<rootDir>/server/functions/__tests__/*.spec.ts'
    ],
    'moduleNameMapper': {
        //'^common/(.*)': '../common/$1'
        // add mappings if needed
    },
    'modulePaths': [
        '.',
        // add additional modules if needed
    ],
};
