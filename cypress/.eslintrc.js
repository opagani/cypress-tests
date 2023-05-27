module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:cypress/recommended'
  ],
  rules: {
    'no-async-promise-executor': 'off',
    'no-console': 'error',
    'no-irregular-whitespace': 'off',
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],

    // Change "warn" to "off" or "error"
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: true },
    ],
  },
  overrides: [
    {
      files: ['**/*.int.spec.ts', '**/*.js'],
      rules: {
        'jest/consistent-test-it': 'off',
        'jest/expect-expect': 'off',
        'jest/valid-expect-in-promise': 'off',
        'promise/catch-or-return': 'off',
        'promise/no-nesting': 'off',
        'promise/always-return': 'off',
      },
    },
  ],
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  "parserOptions": {
    "ecmaVersion": 2020
  }
};
