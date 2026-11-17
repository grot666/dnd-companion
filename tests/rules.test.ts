import { describe, it, expect, vi, afterEach } from "vitest";
import * as R from "../src/rules";
const base = { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 };
const wizard = () =>
  R.createCharacter("瑟林", "human", "wizard", base, ["arcana", "history"]);
afterEach(() => vi.unstubAllGlobals());
describe("2014 SRD calculations", () => {
  it.each([
    [1, -5],
    [8, -1],
    [9, -1],
    [10, 0],
    [15, 2],
    [18, 4],
    [30, 10],
  ])("ability %i => %i", (score, want) => expect(R.mod(score)).toBe(want));
  it.each([
    [1, 2],
    [4, 2],
    [5, 3],
    [8, 3],
    [9, 4],
    [13, 5],
    [17, 6],
    [20, 6],
  ])("level %i proficiency %i", (lv, want) =>
    expect(R.proficiency(lv)).toBe(want),
  );
  it("accepts standard array regardless of order", () =>
    expect(R.validateAbilities(Object.values(base), "array")).toBe(true));
  it("rejects duplicate standard array", () =>
    expect(R.validateAbilities([15, 15, 13, 12, 10, 8], "array")).toBe(false));
  it("validates point buy cost and bounds", () => {
    expect(R.pointTotal([15, 15, 15, 8, 8, 8])).toBe(27);
    expect(R.validateAbilities([15, 15, 15, 8, 8, 8], "point")).toBe(true);
    expect(R.validateAbilities([15, 15, 15, 9, 8, 8], "point")).toBe(false);
    expect(R.validateAbilities([7, 15, 15, 8, 8, 8], "point")).toBe(false);
    expect(R.validateAbilities([8.1, 8, 8, 8, 8, 8], "point")).toBe(false);
  });
  it("adds fixed human bonuses and class/background proficiencies", () => {
    const c = wizard();
    expect(c.scores).toEqual({
      str: 9,
      dex: 15,
      con: 14,
      int: 16,
      wis: 13,
      cha: 11,
    });
    expect(c.hp).toBe(8);
    expect(c.saveProfs).toEqual(["int", "wis"]);
    expect(c.skillProfs).toContain("insight");
    expect(R.skillBonus(c, "arcana")).toBe(5);
  });
  it("uses fixed average HP after first level and respects override", () => {
    const c = { ...wizard(), level: 3 };
    expect(R.maxHP(c)).toBe(20);
    expect(R.maxHP({ ...c, hpOverride: 42 })).toBe(42);
  });
  it("never gives less than 1 HP per level", () =>
    expect(
      R.maxHP({ ...wizard(), level: 5, scores: { ...base, con: 1 } }),
    ).toBe(5));
  it("calculates unarmored and standard armor AC", () => {
    const c = wizard();
    expect(R.armorClass(c)).toBe(12);
    c.inventory = [
      { id: "leather-armor", qty: 1, equipped: true },
      { id: "shield", qty: 1, equipped: true },
    ];
    expect(R.armorClass(c)).toBe(15);
    c.inventory = [{ id: "chain-mail", qty: 1, equipped: true }];
    expect(R.armorClass(c)).toBe(16);
    expect(R.armorClass({ ...c, acOverride: 22 })).toBe(22);
  });
  it("caps medium armor dex bonus", () => {
    const c = wizard();
    c.scores.dex = 20;
    c.inventory = [{ id: "half-plate-armor", qty: 1, equipped: true }];
    expect(R.armorClass(c)).toBe(17);
  });
  it("uses unarmored defense with shield distinction", () => {
    const c = { ...wizard(), classId: "monk" };
    expect(R.armorClass(c)).toBe(13);
    c.inventory = [{ id: "shield", qty: 1, equipped: true }];
    expect(R.armorClass(c)).toBe(14);
    expect(R.armorClass({ ...c, classId: "barbarian" })).toBe(16);
  });
  it("requires proficiency for expertise multiplier", () => {
    const c = wizard();
    expect(R.skillBonus({ ...c, expertise: ["arcana"] }, "arcana")).toBe(7);
    expect(R.skillBonus({ ...c, expertise: ["stealth"] }, "stealth")).toBe(2);
  });
  it("reads exact wizard and pact slots from 2014 table", () => {
    expect(R.slots({ ...wizard(), level: 3 })).toEqual({ "1": 4, "2": 2 });
    expect(R.slots({ ...wizard(), classId: "warlock", level: 5 })).toEqual({
      "3": 2,
    });
    expect(R.slots({ ...wizard(), classId: "fighter" })).toEqual({});
  });
  it("supports manual spell slot caps", () =>
    expect(R.slots({ ...wizard(), slotOverrides: { "1": 0, "2": 3 } })).toEqual(
      { "1": 0, "2": 3 },
    ));
  it("absorbs damage using temporary HP before current HP", () => {
    const c = { ...wizard(), tempHp: 3 };
    expect(R.damage(c, 5)).toMatchObject({ tempHp: 0, hp: 6 });
    expect(R.damage(c, 2)).toMatchObject({ tempHp: 1, hp: 8 });
    expect(R.damage(c, 99).hp).toBe(0);
    expect(R.damage(c, -10).hp).toBe(8);
  });
  it("caps healing and clears death saves on recovery", () => {
    const c = { ...wizard(), hp: 0, deathSuccess: 2, deathFailure: 1 };
    expect(R.heal(c, 99)).toMatchObject({
      hp: 8,
      deathSuccess: 0,
      deathFailure: 0,
    });
  });
  it("short rest spends hit dice but not ordinary slots", () => {
    const c = { ...wizard(), hp: 1, slotsUsed: { "1": 1 } };
    expect(R.shortRest(c, 1, 5)).toMatchObject({
      hp: 6,
      hitDice: 0,
      slotsUsed: { "1": 1 },
    });
    expect(R.shortRest({ ...c, classId: "warlock" }, 1, 5).slotsUsed).toEqual(
      {},
    );
  });
  it("long rest restores half total hit dice, rounded down, min one", () => {
    const c = {
      ...wizard(),
      level: 5,
      hitDice: 0,
      hp: 1,
      tempHp: 2,
      slotsUsed: { "1": 2 },
      conditions: ["poisoned"],
      deathFailure: 1,
    };
    expect(R.longRest(c)).toMatchObject({
      hp: R.maxHP(c),
      tempHp: 0,
      hitDice: 2,
      slotsUsed: {},
      conditions: ["poisoned"],
      deathFailure: 0,
    });
    expect(R.longRest({ ...c, level: 1 }).hitDice).toBe(1);
  });
});
describe("save schema and backups", () => {
  const state = () => ({
    version: 1 as const,
    characters: [wizard()],
    activeId: null,
  });
  it("round trips a valid v1 backup", () => {
    const s = state();
    expect(R.parseBackup(JSON.stringify(s))).toEqual(s);
  });
  it.each([
    "not json",
    "{}",
    '{"version":2,"characters":[]}',
    '{"version":1,"characters":{},"activeId":null}',
  ])("rejects malformed input %s", (s) =>
    expect(() => R.parseBackup(s)).toThrow(),
  );
  it("rejects oversized and out-of-range content", () => {
    expect(() => R.parseBackup(" ".repeat(5_000_001))).toThrow();
    const s = state();
    s.characters[0].level = 21;
    expect(() => R.parseBackup(JSON.stringify(s))).toThrow();
  });
  it("rejects duplicate ids and invalid active selection", () => {
    const s = state();
    s.characters.push(s.characters[0]);
    expect(() => R.parseBackup(JSON.stringify(s))).toThrow();
    expect(() =>
      R.parseBackup(JSON.stringify({ ...state(), activeId: "missing" })),
    ).toThrow();
  });
  it("rejects bad inventories and coins", () => {
    const s = state();
    s.characters[0].coins.gp = -1;
    expect(() => R.parseBackup(JSON.stringify(s))).toThrow();
  });
  it("does not mutate HTML in user strings into markup", () => {
    const s = state();
    s.characters[0].notes = "<script>alert(1)</script>";
    expect(R.parseBackup(JSON.stringify(s)).characters[0].notes).toBe(
      "<script>alert(1)</script>",
    );
  });
  it("flags corrupted local data without silently overwriting", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => "{corrupt", setItem });
    expect(R.loadState().warning).not.toBe("");
    expect(setItem).not.toHaveBeenCalled();
  });
  it("loads missing storage as an empty collection", () => {
    vi.stubGlobal("localStorage", { getItem: () => null });
    expect(R.loadState()).toEqual({ state: R.emptyState, warning: "" });
  });
  it("propagates quota failures to the UI", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => R.persist(state())).toThrow("Quota");
  });
  it("persists only validated schema", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem });
    const s = state();
    R.persist(s);
    expect(setItem).toHaveBeenCalledWith(R.STORAGE_KEY, JSON.stringify(s));
  });
});
describe("bundled content provenance", () => {
  it("has all 319 SRD spells and 599 equipment / magic items", () => {
    expect(R.spells).toHaveLength(319);
    expect(R.items).toHaveLength(599);
  });
  it("preserves fireball SRD mechanics and original text", () => {
    const spell = R.spells.find((s) => s.index === "fireball")!;
    expect(spell).toMatchObject({
      level: 3,
      range: "150 feet",
      casting_time: "1 action",
    });
    expect(spell.desc?.join(" ")).toContain("8d6");
  });
  it("keeps separate item and spell shield data", () => {
    expect(R.items.find((s) => s.index === "shield")?.armor_class?.base).toBe(
      2,
    );
    expect(R.spells.find((s) => s.index === "shield")?.level).toBe(1);
  });
  it("all identifiers within each catalog are unique", () => {
    for (const a of [R.spells, R.items])
      expect(new Set(a.map((e) => e.index)).size).toBe(a.length);
  });
});
