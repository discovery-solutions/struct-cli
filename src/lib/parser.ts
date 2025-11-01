import { identifyEntitiesGenerate, expandEntityGenerate, expandedEntitySchema } from "./generate-objects.js";
import { z } from "zod";

export type Entity = z.infer<typeof expandedEntitySchema>;

/**
 * parseDocToEntitiesChain agora aceita options.installPath
 */
export async function parseDocToEntitiesChain(rawDoc: string): Promise<Entity[]> {
  // Step 1: identificar entidades (name + description)
  let identified: { name: string; description: string }[] = [];
  try {
    identified = await identifyEntitiesGenerate(rawDoc);
  } catch (err: any) {
    console.error("Failed to identify entities:", err?.message ?? err);
    return [];
  }

  if (!identified?.length) return [];

  const results = await Promise.allSettled(
    identified.map((e) => {
      console.log(`Expanding entity: ${e.name}`);
      return expandEntityGenerate(e.name, e.description, rawDoc)
    })
  );

  const entities: Entity[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      const expanded = r.value as Entity;
      // NÃO setamos domain aqui — espera-se que o LLM tenha preenchido domain
      // validação extra:
      if (!expanded.domain || typeof expanded.domain !== "string") {
        console.warn(`Entity ${expanded.name} não tem domain fornecido pelo LLM. Marcar para revisão.`);
        // opcional: pular ou atribuir "content" automaticamente — mas você pediu que IA defina
        // continue; // ou push com flag de revisão
      }
      entities.push(expanded);
    } else {
      const err: any = r.reason;
      console.error("Error expanding entity:", err?.message ?? err);
      if (err?.text) console.error("Raw expand output:", err.text);
    }
  }

  return entities;
}