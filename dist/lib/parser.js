import { identifyEntitiesGenerate, expandEntityGenerate } from "./generate-objects.js";
/**
 * parseDocToEntitiesChain agora aceita options.installPath
 */
export async function parseDocToEntitiesChain(rawDoc) {
    // Step 1: identificar entidades (name + description)
    let identified = [];
    try {
        identified = await identifyEntitiesGenerate(rawDoc);
    }
    catch (err) {
        console.error("Failed to identify entities:", err?.message ?? err);
        return [];
    }
    if (!identified?.length)
        return [];
    const results = await Promise.allSettled(identified.map((e) => {
        console.log(`Expanding entity: ${e.name}`);
        return expandEntityGenerate(e.name, e.description, rawDoc);
    }));
    const entities = [];
    for (const r of results) {
        if (r.status === "fulfilled") {
            const expanded = r.value;
            // NÃO setamos domain aqui — espera-se que o LLM tenha preenchido domain
            // validação extra:
            if (!expanded.domain || typeof expanded.domain !== "string") {
                console.warn(`Entity ${expanded.name} não tem domain fornecido pelo LLM. Marcar para revisão.`);
                // opcional: pular ou atribuir "content" automaticamente — mas você pediu que IA defina
                // continue; // ou push com flag de revisão
            }
            entities.push(expanded);
        }
        else {
            const err = r.reason;
            console.error("Error expanding entity:", err?.message ?? err);
            if (err?.text)
                console.error("Raw expand output:", err.text);
        }
    }
    return entities;
}
