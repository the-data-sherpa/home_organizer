import { describe, expect, test } from "bun:test";
import { categorizeIngredient } from "../route";

describe("categorizeIngredient", () => {
  test("categorizes 'chicken breast' as Meat", () => {
    expect(categorizeIngredient("chicken breast")).toBe("Meat");
  });

  test("categorizes 'spinach' as Produce", () => {
    expect(categorizeIngredient("spinach")).toBe("Produce");
  });

  test("categorizes 'milk' as Dairy", () => {
    expect(categorizeIngredient("milk")).toBe("Dairy");
  });

  test("categorizes 'bread' as Bakery", () => {
    expect(categorizeIngredient("bread")).toBe("Bakery");
  });

  test("categorizes 'frozen peas' as Frozen", () => {
    expect(categorizeIngredient("frozen peas")).toBe("Frozen");
  });

  test("categorizes 'canned beans' as Canned", () => {
    expect(categorizeIngredient("canned beans")).toBe("Canned");
  });

  test("categorizes 'olive oil' as Pantry", () => {
    expect(categorizeIngredient("olive oil")).toBe("Pantry");
  });

  test("categorizes 'paper towels' as Other", () => {
    expect(categorizeIngredient("paper towels")).toBe("Other");
  });

  test("categorizes 'salmon fillet' as Meat", () => {
    expect(categorizeIngredient("salmon fillet")).toBe("Meat");
  });

  test("categorizes 'butter' as Dairy", () => {
    expect(categorizeIngredient("butter")).toBe("Dairy");
  });
});
