import { describe, expect, test } from "bun:test";
import { getWeatherIcon } from "../route";

describe("getWeatherIcon", () => {
  test("returns sun for code 113", () => {
    expect(getWeatherIcon("113")).toBe("☀️");
  });

  test("returns partly cloudy for code 116", () => {
    expect(getWeatherIcon("116")).toBe("⛅");
  });

  test("returns cloudy for code 119", () => {
    expect(getWeatherIcon("119")).toBe("☁️");
  });

  test("returns cloudy for code 122", () => {
    expect(getWeatherIcon("122")).toBe("☁️");
  });

  test("returns rain for code 200 (matched before thunderstorm range)", () => {
    expect(getWeatherIcon("200")).toBe("🌧️");
  });

  test("returns snow for code 320", () => {
    expect(getWeatherIcon("320")).toBe("❄️");
  });

  test("returns fog for code 143", () => {
    expect(getWeatherIcon("143")).toBe("🌫️");
  });

  test("returns default for unknown code 999", () => {
    expect(getWeatherIcon("999")).toBe("🌤️");
  });
});
