/** Returns a time-of-day greeting based on the hour (0–23). */
export function greeting(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Converts a point total into a dollar string. 10 points = $1. */
export function calculateEarnings(points: number): string {
  if (points < 10) return "$0.00";
  const dollars = Math.floor(points / 10);
  return `$${dollars}.00`;
}

/** Returns an array of 7 Date objects (Sun–Sat) for the week offset from today. */
export function getWeekDates(offset: number = 0): Date[] {
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
}

/** Formats a Date into "YYYY-MM-DD". */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Returns an emoji for a grocery section name. */
export function getSectionEmoji(section: string): string {
  switch (section) {
    case "Produce":
      return "\u{1F96C}";
    case "Meat":
      return "\u{1F969}";
    case "Dairy":
      return "\u{1F9C0}";
    case "Bakery":
      return "\u{1F35E}";
    case "Frozen":
      return "\u{1F9CA}";
    case "Canned":
      return "\u{1F96B}";
    case "Pantry":
      return "\u{1FAD9}";
    default:
      return "\u{1F4E6}";
  }
}

/** Returns the start of the current week (Sunday at midnight). */
export function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

/** Returns midnight (00:00:00.000) of the given date. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns end of day (23:59:59.999) of the given date. */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Checks whether a user is authorized to complete a chore. */
export function canUserCompleteChore(
  assignments: { userId: string }[],
  userId: string,
  isClaimable: boolean,
): boolean {
  if (isClaimable) return true;
  return assignments.some((a) => a.userId === userId);
}
