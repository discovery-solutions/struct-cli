#!/usr/bin/env node
import path from "node:path";
import fs from "fs-extra";
import prompts from "prompts";
import { logError, logInfo, logSuccess, logWarn } from "../lib/log.js";
import { parseDocToEntitiesChain } from "../lib/parser.js";
import { writeEntities } from "../lib/writer.js";
import { updateNavMenu } from "../lib/nav-updater.js";
/**
 * opts: {
 *   doc: string;
 *   ui?: boolean;
 *   yes?: boolean;
 *   installPath?: string;
 * }
 */
export default async function generate(opts = {}) {
    if (!opts.doc) {
        logError("Caminho do documento de entrada é obrigatório. Use --doc <path>");
        process.exit(1);
    }
    const docPath = path.resolve(process.cwd(), opts.doc);
    if (!(await fs.pathExists(docPath))) {
        logError(`Documento não encontrado: ${docPath}`);
        process.exit(1);
    }
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY não encontrada no ambiente. Defina no .env.local ou export OPENAI_API_KEY=...");
    }
    const raw = await fs.readFile(docPath, "utf-8");
    logInfo("Fase 1: identificando entidades via IA...");
    // Pass installPath to parser so the model can use it as context (and so parser can forward if needed)
    const entities = await parseDocToEntitiesChain(raw);
    logInfo(`Detectadas ${entities.length} entidades: ${entities.map((e) => e.name).join(", ") || "(nenhuma)"}`);
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
    // projectRoot is where the boilerplate is installed or where the user wants files written
    const projectRoot = opts.installPath ? path.resolve(process.cwd(), opts.installPath) : process.cwd();
    // Only entities that have a domain (provided by the IA) will be written.
    const entitiesWithDomain = entities.filter((e) => e.domain && e.domain.trim());
    // Warn if some entities did not include domain (they will be skipped)
    const skipped = entities.length - entitiesWithDomain.length;
    if (skipped > 0) {
        logWarn(`${skipped} entidade(s) não tinham "domain" e serão ignoradas. Revise as saídas da IA.`);
        logWarn(`Entidades sem domain: ${entities.filter(e => !e.domain || !e.domain.trim()).map(e => e.name).join(", ")}`);
    }
    // Escrita dos artefatos (writer já lida entidade por entidade)
    await writeEntities({
        entities: entitiesWithDomain,
        withUI: opts.ui !== false,
        projectRoot,
    });
    // Atualiza o menu de navegação apenas com as entidades escritas
    await updateNavMenu({ projectRoot, entities: entitiesWithDomain });
    logSuccess("Geração concluída.");
}
