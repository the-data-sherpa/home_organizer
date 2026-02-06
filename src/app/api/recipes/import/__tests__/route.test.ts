import { describe, expect, test } from "bun:test";
import {
  parseDuration,
  parseNumber,
  extractImageUrl,
  parseInstructions,
  hasType,
} from "../route";

describe("parseDuration", () => {
  test("parses PT30M to 30", () => {
    expect(parseDuration("PT30M")).toBe(30);
  });

  test("parses PT1H30M to 90", () => {
    expect(parseDuration("PT1H30M")).toBe(90);
  });

  test("parses PT2H to 120", () => {
    expect(parseDuration("PT2H")).toBe(120);
  });

  test("returns null for undefined", () => {
    expect(parseDuration(undefined)).toBeNull();
  });

  test("returns null for invalid string", () => {
    expect(parseDuration("invalid")).toBeNull();
  });

  test("parses PT0H15M to 15", () => {
    expect(parseDuration("PT0H15M")).toBe(15);
  });
});

describe("parseNumber", () => {
  test("extracts number from '450 calories'", () => {
    expect(parseNumber("450 calories")).toBe(450);
  });

  test("extracts float from '25.5g'", () => {
    expect(parseNumber("25.5g")).toBe(25.5);
  });

  test("returns 0 for undefined", () => {
    expect(parseNumber(undefined)).toBe(0);
  });

  test("returns 0 for empty string", () => {
    expect(parseNumber("")).toBe(0);
  });
});

describe("extractImageUrl", () => {
  test("returns string directly", () => {
    expect(extractImageUrl("https://example.com/img.jpg")).toBe(
      "https://example.com/img.jpg",
    );
  });

  test("returns first string from array of strings", () => {
    expect(
      extractImageUrl(["https://example.com/a.jpg", "https://example.com/b.jpg"]),
    ).toBe("https://example.com/a.jpg");
  });

  test("returns url from array of objects", () => {
    expect(
      extractImageUrl([{ url: "https://example.com/obj.jpg" }]),
    ).toBe("https://example.com/obj.jpg");
  });

  test("returns null for null/undefined", () => {
    expect(extractImageUrl(null)).toBeNull();
    expect(extractImageUrl(undefined)).toBeNull();
  });
});

describe("hasType", () => {
  test("matches string @type", () => {
    expect(hasType({ "@type": "Recipe" }, "Recipe")).toBe(true);
  });

  test("rejects non-matching string @type", () => {
    expect(hasType({ "@type": "Article" }, "Recipe")).toBe(false);
  });

  test("matches when @type is an array containing the type", () => {
    expect(hasType({ "@type": ["Recipe", "NewsArticle"] }, "Recipe")).toBe(true);
  });

  test("rejects when @type array does not contain the type", () => {
    expect(hasType({ "@type": ["Article", "NewsArticle"] }, "Recipe")).toBe(false);
  });

  test("returns false for undefined @type", () => {
    expect(hasType({}, "Recipe")).toBe(false);
  });
});

describe("parseInstructions", () => {
  test("parses string array", () => {
    expect(parseInstructions(["Step 1", "Step 2"])).toEqual([
      "Step 1",
      "Step 2",
    ]);
  });

  test("parses object-with-text array", () => {
    expect(
      parseInstructions([
        { "@type": "HowToStep", text: "Do this" },
        { "@type": "HowToStep", text: "Do that" },
      ]),
    ).toEqual(["Do this", "Do that"]);
  });

  test("returns empty array for undefined", () => {
    expect(parseInstructions(undefined)).toEqual([]);
  });

  test("filters out empty strings", () => {
    expect(parseInstructions(["Step 1", "", "Step 3"])).toEqual([
      "Step 1",
      "Step 3",
    ]);
  });
});
