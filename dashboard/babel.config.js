module.exports = {
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "entry",
            "corejs": "3",
            "modules": false,
            "targets": {
                "safari": "10",
                "chrome": "58",
                "ie": "11"
            }
        }],
    ],
    plugins: [
        "@babel/plugin-syntax-dynamic-import",
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ],
    comments: false,
}
