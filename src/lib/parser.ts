import { identifyEntitiesGenerate, expandEntityGenerate, expandedEntitySchema } from "./generate-objects.js";
import { z } from "zod";

export type Entity = z.infer<typeof expandedEntitySchema>;

export async function parseDocToEntitiesChain(rawDoc: string): Promise<Entity[]> {
  // Step 1: identificar entidades (name + description)
  let identified: { name: string; description: string }[] = [];
  try {
    identified = await identifyEntitiesGenerate(rawDoc);
  } catch (err: any) {
    console.error("Failed to identify entities:", err?.message ?? err);
    // se quiser, tentamos fallback (por enquanto retornamos array vazio)
    return [];
  }

  if (!identified?.length) return [];

  console.log("Identified:", identified);

  // Step 2: para cada entidade, expandir (em paralelo)
  const results = await Promise.allSettled(
    identified.map((e) =>
      expandEntityGenerate(e.name, e.description, rawDoc)
    )
  );

  console.log("expand results:", results);

  const entities: Entity[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      const expanded = r.value as Entity;
      if (!expanded.domain) expanded.domain = "content";
      entities.push(expanded);
    } else {
      const err: any = r.reason;
      console.error("Error expanding entity:", err?.message ?? err);
      if (err?.text) console.error("Raw expand output:", err.text);
    }
  }

  console.log("Final entities:", entities);
  return entities;
}