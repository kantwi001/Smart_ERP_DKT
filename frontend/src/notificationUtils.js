// Utility to determine next role in procurement workflow
export function nextRole(stage) {
  switch (stage) {
    case 1: return 'cd';
    case 2: return 'procurement';
    case 3: return 'finance';
    case 4: return 'finance_manager';
    default: return null;
  }
}
