/** Turn SCREAMING_SNAKE / snake_case into Title Case for the desk UI. */
export function formatLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
