import ashNazg from 'eslint-config-ash-nazg';

export default [
  {
    ignores: ['dist']
  },
  ...ashNazg(['sauron', 'browser']),
  {
    files: ['tests/**'],
    languageOptions: {
      globals: {
        fixture: true
      }
    },
    rules: {
      // Get rid of these when may switch to cypress
      'mocha/no-global-tests': 'off',
      'mocha/handle-done-callback': 'off',
      'chai-friendly/no-unused-expressions': 'off',
      'sonarjs/no-unused-expressions': 'off',
      'new-cap': 'off'
    }
  },
  {
    files: ['*.md/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off'
    }
  },
  {
    rules: {
      // Disable for now
      'require-unicode-regexp': 0,
      '@stylistic/max-len': 0
    }
  }
];
