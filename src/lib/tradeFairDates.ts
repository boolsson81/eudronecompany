// Datumhjälpare för Mässor & Events. Ligger fristående från komponenterna så att
// de går att testa utan att dra in React.

/** "15–17 sep 2026", "22 apr – 3 maj 2027", "29 sep 2026". */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = endDate ? new Date(`${endDate}T00:00:00Z`) : null;
  const day = (d: Date) => d.getUTCDate();
  const month = (d: Date) =>
    d.toLocaleDateString("sv-SE", { month: "short", timeZone: "UTC" }).replace(".", "");
  const year = (d: Date) => d.getUTCFullYear();

  if (!end || startDate === endDate) return `${day(start)} ${month(start)} ${year(start)}`;
  if (year(start) !== year(end)) {
    return `${day(start)} ${month(start)} ${year(start)} – ${day(end)} ${month(end)} ${year(end)}`;
  }
  if (month(start) !== month(end)) {
    return `${day(start)} ${month(start)} – ${day(end)} ${month(end)} ${year(end)}`;
  }
  return `${day(start)}–${day(end)} ${month(end)} ${year(end)}`;
}

/** Dagar kvar till mässan. Negativt = passerad. null = datum saknas. */
export function daysUntil(startDate: string | null, now: Date = new Date()): number | null {
  if (!startDate) return null;
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const today = Date.parse(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((start - today) / 86_400_000);
}
