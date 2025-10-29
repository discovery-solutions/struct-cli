import { llmExtractEntities } from "./ai.js";
export async function parseDocToEntities(raw) {
    // Baseline: tenta LLM. Se falhar, retorna vazio.
    try {
        const parsed = await llmExtractEntities(raw);
        return parsed;
    }
    catch {
        return [];
    }
}
