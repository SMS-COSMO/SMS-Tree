import type { TScore } from '~/types';

export function useScoreColor(score: TScore) {
  if (score === 'A')
    return 'success';
  else if (score === 'B')
    return 'warning';
  else
    return 'danger';
}
