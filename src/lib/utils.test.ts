import { describe, expect, it } from "vitest";
import { cn, formatPrice, generateSlug } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting tailwind classes, keeping the last", () => {
    expect(cn("px-2 text-sm", "px-4")).toContain("px-4");
    expect(cn("px-2 text-sm", "px-4")).not.toContain("px-2");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false, "", undefined, null, "bar")).toBe("foo bar");
  });
});

describe("formatPrice", () => {
  it("formats whole shillings with thousands separators", () => {
    expect(formatPrice(1500)).toBe("KSh 1,500");
  });

  it("formats values in the millions", () => {
    expect(formatPrice(1200000)).toBe("KSh 1,200,000");
  });
});

describe("generateSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(generateSlug("Fresh Farm Produce")).toBe("fresh-farm-produce");
  });

  it("strips characters outside word and hyphen range", () => {
    expect(generateSlug("Mama's & Baba's — Flour!")).toBe("mamas-babas-flour");
  });

  it("collapses runs of dashes", () => {
    expect(generateSlug("  a--b---c  ")).toBe("a-b-c");
  });

  it("trims leading and trailing dashes", () => {
    expect(generateSlug("-value-add-")).toBe("value-add");
  });
});
