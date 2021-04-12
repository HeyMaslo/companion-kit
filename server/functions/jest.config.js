module.exports = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    globals: {
        "ts-jest": { "astTransformers": ["ts-nameof"] }
    },
	roots: [
		'<rootDir>',
	],
   	testMatch: [
        '<rootDir>/__tests__/*.spec.ts',
    ],
	moduleNameMapper: {
		'^common/(.*)': '<rootDir>/../../common/$1',
        '^server/(.*)': '<rootDir>/src/$1',
		// add mappings if needed
	},
	modulePaths: [
		'<rootDir>/node_modules',
		'<rootDir/../../dashboard/node_modules>',
        'src',
        'node_modules',
        '../..',
		// add additional modules if needed
	],
    testPathIgnorePatterns: [
        '/util/*',
        '/mocks/*'
    ]
};
