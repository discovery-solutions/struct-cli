import { llmExtractEntities } from "./ai.js";
import { entitiesSchema } from "./ai.js";
import { z } from "zod";

export type Entity = z.infer<typeof entitiesSchema>[number];

export async function parseDocToEntities(raw: string): Promise<Entity[]> {
  // Baseline: tenta LLM. Se falhar, retorna vazio.
  try {
    const parsed = await llmExtractEntities(raw);
    return parsed;
  } catch {
    return [];
  }
}