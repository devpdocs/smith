import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: [
      '**/types/generated/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/build/**',
      '**/public/uploads/**',
    ],
  },
];
