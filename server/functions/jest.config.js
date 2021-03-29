module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    'moduleNameMapper': {
        //'^common/(.*)': '../common/$1'
    },
    'modulePaths': [
        'src',
        'node_modules',
        '../..'
    ],
    'testPathIgnorePatterns': [
        '/util/*',
        '/mocks/*'
    ]
};
