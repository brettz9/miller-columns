module.exports = {
  "extends": ["ash-nazg/sauron", "plugin:testcafe/recommended"],
  "parserOptions": {
    "sourceType": "module"
  },
  settings: {
    polyfills: [
      'URL'
    ]
  },
  "env": {
    "node": false,
    "browser": true
  },
  overrides: [
    {
      files: ["*.md"],
      rules: {
        'import/no-unresolved': 0,
        'no-console': 0
      }
    }
  ],
  "rules": {
    // Disable for now
    'require-unicode-regexp': 0,
    'max-len': 0
  }
};
