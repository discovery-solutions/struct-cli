import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
export const entitySchema = z.object({
    name: z.string().min(2),
    domain: z.string().optional(),
    fields: z.array(z.object({
        name: z.string(),
        type: z.enum([
            "text", "number", "boolean", "date", "datetime", "enum", "relation", "image", "file", "avatar", "markdown", "tags"
        ]),
        label: z.string().optional(),
        required: z.boolean().optional(),
        enumValues: z.array(z.string()).optional(),
        ref: z.string().optional(),
        default: z.any().optional()
    })).min(1),
    ui: z.object({
        list: z.array(z.string()).optional(), // campos para tabela
        form: z.array(z.string()).optional() // campos para form
    }).optional(),
    api: z.object({
        roles: z.object({
            GET: z.union([z.string(), z.array(z.string())]).optional(),
            POST: z.union([z.string(), z.array(z.string())]).optional(),
            PATCH: z.union([z.string(), z.array(z.string())]).optional(),
            DELETE: z.union([z.string(), z.array(z.string())]).optional()
        }).optional(),
        softDelete: z.boolean().optional(),
        populate: z.array(z.string()).optional()
    }).optional()
});
export const entitiesSchema = z.array(entitySchema).max(50);
export async function llmExtractEntities(input) {
    const model = openai("gpt-4o-mini");
    const { object } = await generateObject({
        model,
        schema: entitiesSchema,
        system: "Você é um gerador de modelos de dados e UIs para um boilerplate Next.js/Mongoose/Struct. Retorne somente objetos válidos para geração.",
        prompt: `
Analise o documento do produto e extraia entidades do domínio com campos, tipos, enums, relações e sugestões de UI (lista/form). 
Tipos aceitos: text, number, boolean, date, datetime, enum, relation, image, file, avatar, markdown, tags.
Para relation, defina ref para o nome da entidade referenciada.
Sugerir roles por método (GET, POST, PATCH, DELETE). softDelete geralmente true.
Documento:
${input}
`
    });
    return object;
}
