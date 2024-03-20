import antfu from '@antfu/eslint-config';

export default antfu({
  unocss: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
  typescript: true,
  vue: true,
  ignores: ['.github/**/*', 'docs/**/*'],
}, {
  rules: {
    'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
  },
});
