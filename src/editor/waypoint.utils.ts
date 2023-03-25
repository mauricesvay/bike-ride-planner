export function getPlaceholder(i: number, total: number) {
  if (i === 0) {
    return "Départ";
  }
  if (i === total - 1) {
    return "Arrivée";
  }
  return `Point ${i}`;
}
