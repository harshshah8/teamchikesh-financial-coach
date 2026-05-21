export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 1);
  return { start, end };
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
}
