import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
} from 'unocss';

export default defineConfig({
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      'border-light': '#E4E7ED',
      'hover-bg': '#F5F7FA',
      'primary': {
        0: '#146E3B',
        1: '#4AA06F',
        2: '#298551',
        3: '#035325',
        4: '#003517',
      },
    },
    breakpoints: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  presets: [
    presetUno({ attributifyPseudo: true }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'color': 'inherit',
        // Avoid crushing of icons in crowded situations
        'min-width': '1.2em',
      },
    }),
    presetTypography(),
    presetWebFonts({}),
  ],
  shortcuts: {
    'border-normal': 'border-solid! border-[2px]! border-border-light!',
    'border-top-normal': 'border-t-solid! border-t-[2px]! border-border-light!',
    'nav': 'fixed inset-x-auto w-screen select-none z-36',
    'h-content': 'h-[calc(100vh-100px)]',
  },
  rules: [
    ['rounded', { 'border-radius': '10px' }],
    [
      'scrollbar-hidden',
      {
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
      },
    ],
  ],
});
