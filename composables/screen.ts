import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

export function useScreen() {
  return useBreakpoints(breakpointsTailwind);
}
