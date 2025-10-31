import path from "node:path";
import fs from "fs-extra";
import prompts from "prompts";
import { logError, logInfo, logSuccess, logWarn } from "../lib/log.js";
import { parseDocToEntitiesChain } from "../lib/parser.js";
import { writeEntities } from "../lib/writer.js";
import { updateNavMenu } from "../lib/nav-updater.js";

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
    throw new Error("OPENAI_API_KEY não encontrada no ambiente. Defina no .env.local ou export OPENAI_API_KEY=...");
  }

  const raw = await fs.readFile(docPath, "utf-8");
  logInfo("Fase 1: identificando entidades via Chain...");
  const entities = await parseDocToEntitiesChain(raw);

  logInfo(
    `Detectadas ${entities.length} entidades: ${entities.map((e) => e.name).join(", ") || "(nenhuma)"}`
  );
  if (!entities.length) {
    logWarn("Nenhuma entidade identificada. Verifique o documento ou ajuste o prompt.");
    process.exit(0);
  }

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

  // Força domain se usuário passou; caso contrário, respeita o que veio da chain (com fallback 'content' no parser)
  const entitiesWithDomain = entities.map((e) => ({ ...e, domain: opts.domain || e.domain || "content" }));

  // Escrita dos artefatos (writer já lida entidade por entidade)
  await writeEntities({
    projectRoot,
    domain: opts.domain || "content",
    entities: entitiesWithDomain,
    withUI: opts.ui !== false
  });

  await updateNavMenu({ projectRoot, entities: entitiesWithDomain });

  logSuccess("Geração concluída.");
}