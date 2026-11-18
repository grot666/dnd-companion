import { z } from "zod";

// Round-3 storage format (dnd-workbench-v1). Read only, for migration and old JSON imports.
export const WB_KEY_V1 = "dnd-workbench-v1";
export const PROJECT_FORMAT_V1 = "dnd-workbench-project";

const id = z.string().min(1).max(80);
const text = (max = 4000) => z.string().max(max).default("");

export const characterSchema = z.object({
  id,
  name: z.string().min(1).max(120),
  appearance: text(),
  identity: text(),
  history: text(),
  motivation: text(),
  desire: text(),
  secret: text(),
  abilities: text(),
  limits: text(),
  notes: text(),
  entrySlugs: z.array(z.string()).default([]),
  image: z.string().max(200).optional(),
});
export const relationshipSchema = z.object({
  id,
  from: id,
  to: id,
  type: z.string().min(1).max(40),
  description: text(2000),
});
export const plotSchema = z.object({
  id,
  title: z.string().min(1).max(160),
  cause: text(),
  conflict: text(),
  consequence: text(),
  characterIds: z.array(z.string()).default([]),
  locationIds: z.array(z.string()).default([]),
  entrySlugs: z.array(z.string()).default([]),
});
export const locationSchema = z.object({
  id,
  name: z.string().min(1).max(120),
  description: text(),
  entrySlugs: z.array(z.string()).default([]),
});
export const adaptationSchema = z.object({
  slug: z.string().min(1),
  adopted: text(),
  changed: text(),
  addedAt: z.string(),
});
export const projectSchema = z.object({
  id,
  name: z.string().min(1).max(160),
  summary: text(),
  example: z.boolean().default(false),
  image: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  characters: z.array(characterSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  plots: z.array(plotSchema).default([]),
  locations: z.array(locationSchema).default([]),
  adaptations: z.array(adaptationSchema).default([]),
});
export const wbStateSchema = z.object({
  version: z.literal(1),
  projects: z.array(projectSchema),
  favorites: z.array(z.string()).default([]),
});
export type Character = z.infer<typeof characterSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type Plot = z.infer<typeof plotSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Adaptation = z.infer<typeof adaptationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type WbState = z.infer<typeof wbStateSchema>;

export function migrateV1(raw: unknown): WbState {
  if (!raw || typeof raw !== "object") throw new Error("存档不是对象");
  const r = raw as Record<string, unknown>;
  const candidate = { version: 1, projects: Array.isArray(r.projects) ? r.projects : [], favorites: Array.isArray(r.favorites) ? r.favorites : [] };
  if (r.version !== undefined && r.version !== 1) throw new Error(`不支持的存档版本：${String(r.version)}`);
  return wbStateSchema.parse(candidate);
}
