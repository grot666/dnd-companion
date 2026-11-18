/** "source": summary of a cited source. "editorial": this site's interpretation, shown quietly apart. */
export type Provenance = "source" | "editorial";

/** A paragraph with its provenance. `cite` is [sourceId, locator]. */
export type Block = { p: Provenance; text: string; cite?: [string, string][] };

export type Section = { title: string; blocks: Block[] };

export type Category =
  | "class"
  | "race"
  | "background"
  | "concept"
  | "creature"
  | "plane"
  | "faction"
  | "setting";

export type ArtRef = { src: string; focus: string; alt: string };

export type Entry = {
  slug: string;
  zh: string;
  en: string;
  category: Category;
  summary: string;
  depth: "deep" | "catalog";
  edition: string;
  setting: string;
  image?: ArtRef;
  sections: Section[];
  /** Secondary rules area: numbers and mechanics, kept out of the main reading flow. */
  rules?: { items: [string, string][]; cite: [string, string][] };
  sources: [string, string][];
  /**
   * Author-facing drafts: claims that could not be confirmed first-hand. Never rendered in
   * reading mode; listed only on the separate drafts page with what is missing.
   */
  drafts?: Draft[];
  related: string[];
  themes: string[];
  tags: string[];
};

export type Theme = {
  slug: string;
  zh: string;
  en: string;
  image: ArtRef;
  intro: string;
  conditions: string[];
  scenarios: { title: string; tags: string[]; entries: string[]; note: string }[];
  entries: { slug: string; why: string }[];
  adjacent: string[];
};

export type Draft = {
  claim: string;
  /** Where the claim was located, possibly only through secondary material. */
  located: [string, string][];
  missing: string;
  blocker: string;
};
