module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dependencies/*'],
  rules: {
    '@typescript-eslint/no-unused-vars': 0,
    'react-native/no-inline-styles': 0,
  }
};
