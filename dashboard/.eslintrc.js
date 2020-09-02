
module.exports = {
    "parserOptions": {
        "ecmaVersion": 7,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
            "modules": false,
            "globalReturn": false
        }
    },
    "plugins": ["import"],
    "rules": {
        "camelcase": 2,
        "indent": ["warn", 4, { "SwitchCase": 1 }],
        "quotes": [2, "single"],
        "no-unused-vars": 1,
        "no-use-before-define": "warn",
        "no-console": 1,
        "no-continue": 0,
        "no-plusplus": 0,
        "no-tabs": 0,
        "linebreak-style": ["warn", process.platform === 'win32' ? 'windows' : "unix"],
        "prefer-destructuring": 1,
        "prefer-template": 1,
        "global-require": 1,
        "import/no-unresolved": 1,
        "class-methods-use-this": 1,
        "object-shorthand": 0,
    },
    "settings": {
        "import/resolver": "webpack"
    },
    "env": {
        "es6": true,
        "node": true,
        "browser": true
    }
};
