export function useScoreColor(score: TPaperScore) {
  switch (score) {
    case 'A': return 'success';
    case 'B': return 'primary';
    case 'C': return 'warning';
    case 'D': return 'danger';
    default: return 'info';
  }
}
