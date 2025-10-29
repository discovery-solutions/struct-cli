import path from "node:path";
import fs from "fs-extra";
import prompts from "prompts";
import { parseDocToEntities } from "../lib/parser.js";
import { writeEntities } from "../lib/writer.js";
import { updateNavMenu } from "../lib/nav-updater.js";
import { logError, logInfo, logSuccess, logWarn } from "../lib/log.js";

export default async function generate(opts: {
  doc: string;
  domain: string;
  ui?: boolean;
  yes?: boolean;
}) {
  const docPath = path.resolve(process.cwd(), opts.doc);
  if (!(await fs.pathExists(docPath))) {
    logError(`Documento não encontrado: ${docPath}`);
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    logWarn("OPENAI_API_KEY não encontrada no ambiente. Defina no .env.local ou export OPENAI_API_KEY=...");
  }

  const raw = await fs.readFile(docPath, "utf-8");
  logInfo("Extraindo entidades do documento via LLM + heurísticas...");
  const entities = await parseDocToEntities(raw);

  logInfo(`Foram detectadas ${entities.length} entidades: ${entities.map(e => e.name).join(", ") || "(nenhuma)"}`);
  if (!opts.yes) {
    const ans = await prompts({
      type: "confirm",
      name: "confirm",
      message: "Deseja gerar os arquivos agora?",
      initial: true
    });
    if (!ans.confirm) {
      logInfo("Operação cancelada.");
      process.exit(0);
    }
  }

  const projectRoot = process.cwd();
  await writeEntities({
    projectRoot,
    domain: opts.domain,
    entities,
    withUI: opts.ui !== false
  });

  await updateNavMenu({ projectRoot, entities });

  logSuccess("Geração concluída.");
}