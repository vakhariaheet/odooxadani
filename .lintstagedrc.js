module.exports = {
  // Backend TypeScript files
  'backend/src/**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // Client TypeScript/React files
  'client/src/**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // JSON, YAML, Markdown files
  '**/*.{json,yml,yaml,md}': [
    'prettier --write',
  ],
  
  // Shell scripts
  '**/*.sh': [
    'shellcheck',
  ],
};
