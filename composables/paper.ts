export function useScoreColor(score: 'A' | 'B' | 'C' | 'D' | null) {
  if (score === 'A')
    return 'success';
  else if (score === 'B')
    return 'warning';
  else
    return 'danger';
}
