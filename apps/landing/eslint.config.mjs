import astro from 'eslint-plugin-astro';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...astro.configs['flat/recommended'],
  {
    ignores: ['**/.astro/**', '**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.astro'],
    rules: {},
  },
];
