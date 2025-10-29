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
        await fs.ensureDir(apiDir);
        await writeFileSafe(path.join(apiDir, "route.ts"), apiRouteTemplate(plural, namePascal));
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
    const fields = (ent.ui?.form || ent.fields.map(f => f.name))
        .map(name => {
        const ff = ent.fields.find(x => x.name === name);
        if (!ff)
            return `  // campo desconhecido: ${name}`;
        const type = uiType(ff);
        return `  { name: "${ff.name}", label: "${labelize(ff.name)}", type: "${type}"${ff.required ? ", required: true" : ""} },`;
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
        case "text": return "string";
        case "number": return "number";
        case "boolean": return "boolean";
        case "date": return "string";
        case "datetime": return "string";
        case "enum": return f.enumValues?.map(v => `"${v}"`).join(" | ") || "string";
        case "relation": return "string"; // _id referenciado
        case "image":
        case "file":
        case "avatar":
        case "markdown":
        case "tags":
            return "any";
        default: return "any";
    }
}
function zodType(f) {
    let zt = "z.any()";
    switch (f.type) {
        case "text":
            zt = "z.string()";
            break;
        case "number":
            zt = "z.number()";
            break;
        case "boolean":
            zt = "z.boolean()";
            break;
        case "date":
        case "datetime":
            zt = "z.string()";
            break;
        case "enum":
            zt = f.enumValues?.length ? `z.enum([${f.enumValues.map(v => `"${v}"`).join(", ")}])` : "z.string()";
            break;
        case "relation":
            zt = "z.string()";
            break;
        case "image":
        case "file":
        case "avatar":
        case "markdown":
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
        case "boolean": return `{ type: Boolean${baseReq} }`;
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
        case "text": return "text";
        case "number": return "number";
        case "boolean": return "checkbox";
        case "date": return "date";
        case "datetime": return "date";
        case "enum": return "select";
        case "image": return "image";
        case "file": return "file";
        case "avatar": return "avatar";
        case "markdown": return "markdown";
        case "tags": return "tags";
        case "relation": return "select";
        default: return "text";
    }
}
