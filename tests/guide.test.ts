import { describe, it, expect } from "vitest";
import {
  classGuides,
  raceGuides,
  starterSections,
  spellLessons,
  sourceLinks,
} from "../src/guide-data";
import { classes, races } from "../src/rules";
describe("Chinese guide completeness and distinct content", () => {
  it("covers exactly all 12 SRD classes once", () => {
    expect(classGuides).toHaveLength(12);
    expect(new Set(classGuides.map((c) => c.id))).toEqual(
      new Set(classes.map((c) => c.index)),
    );
  });
  it.each(classGuides)(
    "$id has substantive authored intros, mechanics and progression",
    (c) => {
      expect(c.intro.length).toBeGreaterThan(45);
      expect(c.features).toHaveLength(3);
      expect(c.growth).toHaveLength(3);
      expect(c.advice).toHaveLength(3);
      expect(c.subclass.length).toBeGreaterThan(6);
      expect(c.example.length).toBeGreaterThan(35);
      for (const [, text] of c.features)
        expect(text.length).toBeGreaterThan(30);
    },
  );
  it("class mechanics are not the same repeated text", () => {
    expect(
      new Set(classGuides.flatMap((c) => c.features.map((f) => f[1]))).size,
    ).toBe(36);
    expect(new Set(classGuides.map((c) => c.intro)).size).toBe(12);
  });
  it("covers every SRD base race and explains subrace boundaries", () => {
    for (const race of races) {
      expect(raceGuides[race.index].intro.length).toBeGreaterThan(30);
      expect(raceGuides[race.index].note.length).toBeGreaterThan(30);
    }
  });
  it("includes d20 categories, action economy and separate spell lessons", () => {
    expect(starterSections.map((s) => s.id)).toContain("combat");
    expect(starterSections.map((s) => s.id)).toContain("advantage");
    expect(spellLessons).toHaveLength(8);
    expect(sourceLinks.srd).toContain("SRD5.1");
  });
});
