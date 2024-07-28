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
        0: '#15803d',
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
    'h-content': 'h-[calc(100vh-95px)]', // Height of the full page
    'h-admin-content': 'h-[calc(100vh-100px-80px)] md:h-[calc(100vh-95px)]', // Height of the full admin page
    'max-h-content': 'max-h-[calc(100vh-100px)]', // Height of the full page
    'min-h-admin-content': 'min-h-[calc(100vh-100px-80px)] md:min-h-[calc(100vh-95px)]', // Height of the full page
    'card-button': 'cursor-pointer hover:border-color-[#D4D7DE]! hover:bg-hover-bg!',
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
  variants: [
    {
      match: (s) => {
        if (s.startsWith('i-')) {
          return {
            matcher: s,
            selector: (s) => {
              return s.startsWith('.') ? `${s.slice(1)},${s}` : s;
            },
          };
        }
      },
    },
  ],
});
