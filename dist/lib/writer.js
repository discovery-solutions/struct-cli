import path from "node:path";
import fs from "fs-extra";
import { toKebabPlural, toPascalCase } from "./names.js";
import { idxTemplate, modelTemplate, utilsTemplate, apiRouteTemplate, pageListTemplate } from "./templates.js";
import { logInfo } from "./log.js";
export async function writeEntities(opts) {
    for (const ent of opts.entities) {
        const namePascal = toPascalCase(ent.name);
        const plural = toKebabPlural(ent.name);
        // Paths
        const modelDir = path.join(opts.projectRoot, "src/models", opts.domain, namePascal.toLowerCase());
        await fs.ensureDir(modelDir);
        // Compose fields
        const { fieldsTs, zodCreate, zodUpdate, mongooseFields, columns, fields } = toCodeFromEntity(ent);
        // Write index.ts
        await writeFileSafe(path.join(modelDir, "index.ts"), idxTemplate(namePascal, fieldsTs, zodCreate, zodUpdate));
        // Write model.tsx
        await writeFileSafe(path.join(modelDir, "model.tsx"), modelTemplate(namePascal, mongooseFields));
        // Write utils.tsx
        await writeFileSafe(path.join(modelDir, "utils.tsx"), utilsTemplate(namePascal, columns, fields));
        // API route
        const apiDir = path.join(opts.projectRoot, "src/app/api", plural, "[[...id]]");
        const rolesJson = JSON.stringify(ent.api?.roles ?? { GET: ["admin", "user"], POST: "admin", PATCH: "admin", DELETE: "superadmin" }, null, 2);
        const softDelete = ent.api?.softDelete ?? true;
        const populateJson = JSON.stringify(ent.api?.populate ?? [], null, 2);
        await fs.ensureDir(apiDir);
        await writeFileSafe(path.join(apiDir, "route.ts"), apiRouteTemplate(plural, namePascal, rolesJson, softDelete, populateJson));
        // UI page (list)
        if (opts.withUI) {
            const pageDir = path.join(opts.projectRoot, "src/app/dashboard", plural);
            await fs.ensureDir(pageDir);
            await writeFileSafe(path.join(pageDir, "page.tsx"), pageListTemplate(plural, namePascal));
        }
        logInfo(`✔ Entidade ${namePascal} gerada.`);
    }
}
async function writeFileSafe(filePath, content) {
    if (await fs.pathExists(filePath)) {
        await fs.copy(filePath, `${filePath}.bak`);
    }
    await fs.writeFile(filePath, content, "utf-8");
}
function toCodeFromEntity(ent) {
    // TS interface fields
    const fieldsTs = ent.fields.map(f => `  ${f.name}${f.required === false ? "?" : ""}: ${tsType(f)};`).join("\n");
    // Zod create/update
    const zodCreate = `z.object({\n${ent.fields.map(f => `  ${f.name}: ${zodType(f)}`).join(",\n")}\n}).strict()`;
    const zodUpdate = `${zodCreate}.partial()`;
    // Mongoose fields
    const mongooseFields = ent.fields.map(f => `  ${f.name}: ${mongooseField(f)},`).join("\n");
    // Columns
    const columns = (ent.ui?.list || ent.fields.slice(0, 4).map(f => f.name))
        .map(name => `  { accessorKey: "${name}", header: "${labelize(name)}" },`).join("\n");
    // Fields (Form)
    const fields = (ent.ui?.form || ent.fields.map(f => f.name)).map(name => {
        const ff = ent.fields.find(x => x.name === name);
        if (!ff)
            return `  // campo desconhecido: ${name}`;
        const type = uiType(ff);
        const parts = [
            `name: "${ff.name}"`,
            `label: "${labelize(ff.name)}"`,
            `type: "${type}"`
        ];
        if (ff.required)
            parts.push(`required: true`);
        if (ff.placeholder)
            parts.push(`placeholder: "${ff.placeholder.replace(/"/g, '\\"')}"`);
        if (ff.colSpan)
            parts.push(`colSpan: ${ff.colSpan}`);
        if (ff.className)
            parts.push(`className: "${ff.className}"`);
        if (ff.default !== undefined)
            parts.push(`defaultValue: ${JSON.stringify(ff.default)}`);
        if (ff.folder)
            parts.push(`folder: "${ff.folder}"`);
        // enum/select → options (se já veio enumValues/options)
        if (ff.type === "enum" || ff.type === "select") {
            const options = ff.options ?? (ff.enumValues?.map(v => ({ value: v, label: labelize(v) })) || []);
            if (options.length)
                parts.push(`options: ${JSON.stringify(options, null, 2)}`);
        }
        // relation/model-select → model + params
        if (ff.type === "relation" || ff.type === "model-select") {
            const model = ff.model || ff.ref || "";
            if (model)
                parts.push(`model: "${model}"`);
            if (ff.params)
                parts.push(`params: ${JSON.stringify(ff.params)}`);
        }
        return `  { ${parts.join(", ")} },`;
    }).join("\n");
    return { fieldsTs, zodCreate, zodUpdate, mongooseFields, columns, fields };
}
// Helpers
function labelize(name) {
    return name
        .replace(/[_\-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .replace(/^./, c => c.toUpperCase());
}
function tsType(f) {
    switch (f.type) {
        case "text":
        case "textarea":
        case "password":
        case "markdown":
        case "image":
        case "file":
        case "document":
        case "file-openai":
            return "string";
        case "number": return "number";
        case "toggle":
            return "boolean";
        case "date":
        case "datetime":
            return "string";
        case "enum":
        case "select":
            return f.enumValues?.map(v => `"${v}"`).join(" | ") || "string";
        case "relation":
        case "model-select":
            return "string"; // id; pode evoluir para ObjectId
        case "tags":
            return "any";
        default:
            return "any";
    }
}
function zodType(f) {
    let zt = "z.any()";
    switch (f.type) {
        case "text":
        case "textarea":
        case "password":
        case "markdown":
        case "image":
        case "file":
        case "document":
        case "file-openai":
            zt = "z.string()";
            break;
        case "number":
            zt = "z.number()";
            break;
        case "toggle":
            zt = "z.boolean()";
            break;
        case "date":
        case "datetime":
            zt = "z.string()";
            break;
        case "enum":
            zt = f.enumValues?.length
                ? `z.enum([${f.enumValues.map(v => `"${v}"`).join(", ")}])`
                : "z.string()";
            break;
        case "select":
            zt = "z.string()";
            break;
        case "relation":
        case "model-select":
            zt = "z.string()";
            break;
        case "tags":
            zt = "z.any()";
            break;
    }
    if (!f.required)
        zt += ".optional()";
    return zt;
}
function mongooseField(f) {
    const baseReq = f.required ? ", required: true" : "";
    switch (f.type) {
        case "text": return `{ type: String${baseReq} }`;
        case "number": return `{ type: Number${baseReq} }`;
        case "date":
        case "datetime": return `{ type: Date${baseReq} }`;
        case "enum":
            if (f.enumValues?.length)
                return `{ type: String, enum: [${f.enumValues.map(v => `"${v}"`).join(", ")}]${baseReq} }`;
            return `{ type: String${baseReq} }`;
        case "relation":
            return `{ type: String${baseReq} }`; // simplificado; pode trocar para ObjectId + ref
        default:
            return `{ type: String${baseReq} }`;
    }
}
function uiType(f) {
    switch (f.type) {
        case "password": return "password";
        case "textarea": return "textarea";
        case "number": return "number";
        case "toggle": return "select"; // se vier “toggle”, também convertemos para select
        case "date": return "date";
        case "datetime": return "date";
        case "enum":
        case "select": return "select";
        case "relation":
        case "model-select": return "model-select";
        case "image": return "image";
        case "avatar": return "avatar";
        case "file": return "file";
        case "document": return "document";
        case "file-openai": return "file-openai";
        case "markdown": return "markdown";
        case "tags": return "tags";
        case "text":
        default:
            return "text";
    }
}
