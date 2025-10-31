import { existsSync } from "node:fs";
import { ensureDir } from "fs-extra";
import prompts from "prompts";
import path from "node:path";
import { cloneBoilerplate, personalizeProject } from "../lib/git.js";
import { logInfo, logSuccess, logWarn } from "../lib/log.js";
export default async function init(opts) {
    const answers = await prompts([
        {
            type: opts.name ? null : "text",
            name: "name",
            message: "Nome do projeto (pasta destino):",
            initial: "my-struct-app"
        }
    ]);
    const projectName = opts.name || answers.name;
    const targetDir = path.resolve(process.cwd(), projectName);
    if (existsSync(targetDir)) {
        logWarn(`Diretório ${projectName} já existe. Arquivos podem ser sobrescritos.`);
    }
    else {
        await ensureDir(targetDir);
    }
    const repo = "https://github.com/discovery-solutions/struct-boilerplate";
    logInfo(`Clonando boilerplate de ${repo} (branch: ${opts.branch}) ...`);
    await cloneBoilerplate({ repo, branch: opts.branch, targetDir });
    logInfo("Personalizando projeto...");
    await personalizeProject({ targetDir, projectName });
    logSuccess(`Projeto criado em ./${projectName}`);
    logInfo("Próximos passos:");
    console.log(`  cd ${projectName}`);
    console.log("  pnpm install");
    console.log("  cp .env.example .env.local   # configure suas variáveis");
    console.log("  pnpm dev");
}
