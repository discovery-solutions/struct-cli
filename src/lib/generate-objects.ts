import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/* -------------------------
   Schemas (mantive os seus)
   ------------------------- */

// Etapa 1: identificar nomes e descrições de entidades
export const identifiedEntitySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5)
});

export const identifiedEntitiesSchema = z.array(identifiedEntitySchema).min(1).max(50);

// Etapa 2: expandir uma entidade em fields, UI e API
const optionSchema = z.object({ value: z.string(), label: z.string() });

const fieldSchema = z.object({
  name: z.string(),
  type: z.enum([
    "text", "number", "date", "datetime",
    "textarea", "markdown",
    "select", "enum", "relation", "model-select", "tags",
    "image", "file", "avatar", "document", "file-openai",
    "password", "toggle"
  ]),
  label: z.string().optional(),
  required: z.boolean().optional(),
  enumValues: z.array(z.string()).optional(),
  options: z.array(optionSchema).optional(),
  ref: z.string().optional(),
  model: z.string().optional(),
  params: z.record(z.any()).optional(),
  default: z.any().optional(),
  placeholder: z.string().optional(),
  colSpan: z.number().optional(),
  className: z.string().optional(),
  folder: z.string().optional()
});

export const expandedEntitySchema = z.object({
  name: z.string().min(2),
  domain: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(fieldSchema).min(1),
  ui: z.object({
    list: z.array(z.string()).optional(),
    form: z.array(z.string()).optional()
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

/* -------------------------
   GenerateObject wrappers
   ------------------------- */

/**
 * Identify entities (returns array of { name, description })
 */
export async function identifyEntitiesGenerate(doc: string) {
  try {
    const { object, usage, finishReason, response } = await generateObject({
      model: openai("gpt-4o-mini"),
      output: "array", // return an array of items matching the schema
      schema: identifiedEntitySchema, // schema for array element
      schemaName: "IdentifiedEntity",
      schemaDescription: "A simple object with name and description of a domain entity",
      maxRetries: 2,
      prompt: `
Você é um analista de produto. Sua única tarefa é identificar entidades (name e description) a partir do documento abaixo.

Regras obrigatórias:
- Retorne APENAS um array JSON de objetos com "name" e "description".
- NÃO inclua "fields", "ui", "api" ou qualquer outra chave.
- NÃO inclua texto fora do JSON.
- Máximo de 10 entidades.
- Nomes devem ser em ingles, pascal case (ex.: User, ProductItem).

Documento:
---
${doc}
---

OBRIGATÓRIO: Lembre-se que usuarios/atores tem seus papais definidos via role.

Formato de saída ESTRITO:
[
  { "name": "User", "description": "Representa um usuário do sistema." },
  { "name": "Product", "description": "Representa um item disponível para venda." }
]
`,
    });

    return object as Array<{ name: string; description: string }>;
  } catch (err: any) {
    console.error("identifyEntitiesGenerate error:", err?.message ?? err);
    if (err?.text) {
      console.error("identify raw model output:", err.text);
    }
    throw err;
  }
}

/**
 * Expand a single entity (returns one object matching expandedEntitySchema)
 */
export async function expandEntityGenerate(
  name: string,
  description: string,
  doc: string
) {
  try {
    const { object, usage, finishReason, response } = await generateObject({
      model: openai("gpt-5-mini"),
      schema: expandedEntitySchema,
      schemaName: "ExpandedEntity",
      maxRetries: 2,
      schemaDescription:
        "Detailed entity definition with fields, ui and api configuration for Next.js + Mongoose + Struct boilerplate.",
      prompt: `
Você é um gerador de esquemas para um boilerplate Next.js + Mongoose + Struct.

Entrada:
Entidade: ${name} - ${description}
Documento (contexto):
---
${doc}
---

Regras obrigatórias:
- Retorne APENAS um objeto JSON ESTRITO com as chaves: name, description, fields, ui, api.
- Types permitidos em fields[].type:
  text, number, date, datetime, textarea, markdown, select, enum, relation, model-select, tags, image, file, avatar, document, file-openai, password, toggle
- Booleanos devem ser representados como select com options semânticas (ex.: active/inactive ou yes/no).
- Para enums/select, preencha "options": [{ value, label }].
- Para relation, use "ref" com o nome da entidade alvo.
- NÃO inclua createdAt/updatedAt/deletedAt nos fields.
- "name" precisa ser inglês.

OBRIGATÓRIO: sempre inclua em api.roles permissões para cada método HTTP (GET, POST, PATCH, DELETE). Use arrays de roles (ex.: "GET": ["admin","user"]). Se o domínio envolve múltiplos atores (ex.: autor, admin, manager, customer), gere regras diferenciadas e inclua rolesExplanation (curta) explicando por que cada role foi escolhida).

Formato de saída ESTRITO (exemplo):
{
  "name": "${name}",
  "description": "${description}",
  "fields": [ ... ],
  "ui": { "list": [...], "form": [...] },
  "api": { "roles": { "GET": ["admin"] }, "softDelete": true, "populate": [...] }
}
`,
    });

    return object as z.infer<typeof expandedEntitySchema>;
  } catch (err: any) {
    console.error(`expandEntityGenerate error for ${name}:`, err?.message ?? err);
    if (err?.text) {
      console.error(`expand raw model output for ${name}:`, err.text);
    }
    throw err;
  }
}