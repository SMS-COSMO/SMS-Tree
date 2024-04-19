export function useScoreColor(score: TPaperScore) {
  if (score === 'A')
    return 'success';
  else if (score === 'B')
    return 'warning';
  else
    return 'danger';
}
