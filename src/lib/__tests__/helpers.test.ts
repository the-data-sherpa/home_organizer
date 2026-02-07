import { describe, expect, test } from "bun:test";
import {
  greeting,
  calculateEarnings,
  getWeekDates,
  formatDate,
  getSectionEmoji,
  getStartOfWeek,
  startOfDay,
  endOfDay,
  canUserCompleteChore,
} from "@/lib/helpers";

describe("greeting", () => {
  test("returns Good Morning at hour 0", () => {
    expect(greeting(0)).toBe("Good Morning");
  });

  test("returns Good Morning at hour 11", () => {
    expect(greeting(11)).toBe("Good Morning");
  });

  test("returns Good Afternoon at hour 12", () => {
    expect(greeting(12)).toBe("Good Afternoon");
  });

  test("returns Good Afternoon at hour 16", () => {
    expect(greeting(16)).toBe("Good Afternoon");
  });

  test("returns Good Evening at hour 17", () => {
    expect(greeting(17)).toBe("Good Evening");
  });

  test("returns Good Evening at hour 23", () => {
    expect(greeting(23)).toBe("Good Evening");
  });
});

describe("calculateEarnings", () => {
  test("0 points returns $0.00", () => {
    expect(calculateEarnings(0)).toBe("$0.00");
  });

  test("9 points returns $0.00", () => {
    expect(calculateEarnings(9)).toBe("$0.00");
  });

  test("10 points returns $1.00", () => {
    expect(calculateEarnings(10)).toBe("$1.00");
  });

  test("25 points returns $2.00", () => {
    expect(calculateEarnings(25)).toBe("$2.00");
  });

  test("100 points returns $10.00", () => {
    expect(calculateEarnings(100)).toBe("$10.00");
  });
});

describe("getWeekDates", () => {
  test("returns 7 dates", () => {
    const dates = getWeekDates(0);
    expect(dates).toHaveLength(7);
  });

  test("first date is a Sunday", () => {
    const dates = getWeekDates(0);
    expect(dates[0].getDay()).toBe(0);
  });

  test("last date is a Saturday", () => {
    const dates = getWeekDates(0);
    expect(dates[6].getDay()).toBe(6);
  });

  test("offset shifts by 7 days", () => {
    const thisWeek = getWeekDates(0);
    const nextWeek = getWeekDates(1);
    const diff = nextWeek[0].getTime() - thisWeek[0].getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe("formatDate", () => {
  test("returns YYYY-MM-DD format", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatDate(date)).toBe("2024-06-15");
  });

  test("pads month and day with zeros", () => {
    const date = new Date("2024-01-05T00:00:00Z");
    expect(formatDate(date)).toBe("2024-01-05");
  });
});

describe("getSectionEmoji", () => {
  test("returns correct emoji for Produce", () => {
    expect(getSectionEmoji("Produce")).toBe("\u{1F96C}");
  });

  test("returns correct emoji for Meat", () => {
    expect(getSectionEmoji("Meat")).toBe("\u{1F969}");
  });

  test("returns correct emoji for Dairy", () => {
    expect(getSectionEmoji("Dairy")).toBe("\u{1F9C0}");
  });

  test("returns correct emoji for Bakery", () => {
    expect(getSectionEmoji("Bakery")).toBe("\u{1F35E}");
  });

  test("returns correct emoji for Frozen", () => {
    expect(getSectionEmoji("Frozen")).toBe("\u{1F9CA}");
  });

  test("returns correct emoji for Canned", () => {
    expect(getSectionEmoji("Canned")).toBe("\u{1F96B}");
  });

  test("returns correct emoji for Pantry", () => {
    expect(getSectionEmoji("Pantry")).toBe("\u{1FAD9}");
  });

  test("returns default emoji for unknown section", () => {
    expect(getSectionEmoji("Unknown")).toBe("\u{1F4E6}");
  });
});

describe("getStartOfWeek", () => {
  test("returns a Sunday", () => {
    const start = getStartOfWeek();
    expect(start.getDay()).toBe(0);
  });

  test("returns midnight", () => {
    const start = getStartOfWeek();
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });
});

describe("startOfDay", () => {
  test("sets time to midnight", () => {
    const date = new Date("2024-06-15T14:30:00");
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  test("preserves the date", () => {
    const date = new Date("2024-06-15T14:30:00");
    const result = startOfDay(date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });

  test("does not mutate original date", () => {
    const date = new Date("2024-06-15T14:30:00");
    const original = date.getTime();
    startOfDay(date);
    expect(date.getTime()).toBe(original);
  });
});

describe("endOfDay", () => {
  test("sets time to 23:59:59.999", () => {
    const date = new Date("2024-06-15T14:30:00");
    const result = endOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });

  test("preserves the date", () => {
    const date = new Date("2024-06-15T14:30:00");
    const result = endOfDay(date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });

  test("does not mutate original date", () => {
    const date = new Date("2024-06-15T14:30:00");
    const original = date.getTime();
    endOfDay(date);
    expect(date.getTime()).toBe(original);
  });
});

describe("canUserCompleteChore", () => {
  test("allows assigned user", () => {
    const assignments = [{ userId: "user1" }, { userId: "user2" }];
    expect(canUserCompleteChore(assignments, "user1", false)).toBe(true);
  });

  test("rejects unassigned user", () => {
    const assignments = [{ userId: "user1" }];
    expect(canUserCompleteChore(assignments, "user2", false)).toBe(false);
  });

  test("allows any user when claimable", () => {
    const assignments: { userId: string }[] = [];
    expect(canUserCompleteChore(assignments, "user2", true)).toBe(true);
  });

  test("allows any user when claimable even with assignments", () => {
    const assignments = [{ userId: "user1" }];
    expect(canUserCompleteChore(assignments, "user2", true)).toBe(true);
  });

  test("rejects when no assignments and not claimable", () => {
    expect(canUserCompleteChore([], "user1", false)).toBe(false);
  });
});
