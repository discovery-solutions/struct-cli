import { identifyEntitiesGenerate, expandEntityGenerate } from "./generate-objects.js";
export async function parseDocToEntitiesChain(rawDoc) {
    // Step 1: identificar entidades (name + description)
    let identified = [];
    try {
        identified = await identifyEntitiesGenerate(rawDoc);
    }
    catch (err) {
        console.error("Failed to identify entities:", err?.message ?? err);
        // se quiser, tentamos fallback (por enquanto retornamos array vazio)
        return [];
    }
    if (!identified?.length)
        return [];
    console.log("Identified:", identified);
    // Step 2: para cada entidade, expandir (em paralelo)
    const results = await Promise.allSettled(identified.map((e) => expandEntityGenerate(e.name, e.description, rawDoc)));
    console.log("expand results:", results);
    const entities = [];
    for (const r of results) {
        if (r.status === "fulfilled") {
            const expanded = r.value;
            if (!expanded.domain)
                expanded.domain = "content";
            entities.push(expanded);
        }
        else {
            const err = r.reason;
            console.error("Error expanding entity:", err?.message ?? err);
            if (err?.text)
                console.error("Raw expand output:", err.text);
        }
    }
    console.log("Final entities:", entities);
    return entities;
}
