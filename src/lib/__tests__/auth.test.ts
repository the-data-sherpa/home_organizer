import { describe, expect, test } from "bun:test";
import { hashPin, verifyPin } from "@/lib/auth";

describe("hashPin", () => {
  test("returns a consistent SHA256 hex string", () => {
    const hash = hashPin("123456");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashPin("123456")).toBe(hash);
  });

  test("produces different hashes for different inputs", () => {
    expect(hashPin("123456")).not.toBe(hashPin("654321"));
  });
});

describe("verifyPin", () => {
  test("returns true for the correct PIN", () => {
    expect(verifyPin("123456")).toBe(true);
  });

  test("returns false for an incorrect PIN", () => {
    expect(verifyPin("000000")).toBe(false);
  });

  test("returns false when FAMILY_PIN_HASH is missing", () => {
    const original = process.env.FAMILY_PIN_HASH;
    delete process.env.FAMILY_PIN_HASH;
    expect(verifyPin("123456")).toBe(false);
    process.env.FAMILY_PIN_HASH = original;
  });
});
