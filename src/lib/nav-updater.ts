import fs from "fs-extra";
import path from "node:path";
import { toKebabPlural } from "./names.js";
import type { Entity } from "./parser.js";

export async function updateNavMenu(opts: { projectRoot: string; entities: Entity[] }) {
  const filePath = path.join(opts.projectRoot, "src/components/nav/items.tsx");
  if (!(await fs.pathExists(filePath))) return;

  let code = await fs.readFile(filePath, "utf-8");

  // Ingênuo: inserir novas entradas antes do fechamento do array admin
  // Procurar bloco admin: [ { ... }, { Usuarios }, ... ]
  const insertions = opts.entities.map(e => {
    const plural = toKebabPlural(e.name);
    return `    {\n      title: "${titleFromName(e.name)}",\n      url: "/dashboard/${plural}",\n      icon: IconDashboard,\n    },`;
  }).join("\n");

  // Se já existe, evita duplicar
  for (const e of opts.entities) {
    const plural = toKebabPlural(e.name);
    if (code.includes(`/dashboard/${plural}"`)) {
      // já existe
      continue;
    }
    // Inserir antes do fechamento do array admin
    code = code.replace(
      /admin:\s*\[(.*?)\n\s*\]\s*}/s,
      (match, group) => {
        const withComma = group.trim().length ? group + "\n" : "";
        return `admin: [\n${withComma}${insertions}\n  ] }`;
      }
    );
  }

  await fs.writeFile(filePath, code, "utf-8");
}

function titleFromName(name: string) {
  const s = name.replace(/[_\-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const words = s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join(" ");
}