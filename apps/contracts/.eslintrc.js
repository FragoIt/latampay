module.exports = {
  extends: ['@latampay/config'],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    node: true,
  },
  ignorePatterns: ['dist', 'node_modules', 'cache', 'artifacts'],
};

