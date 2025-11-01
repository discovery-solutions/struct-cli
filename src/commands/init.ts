#!/usr/bin/env node
import { existsSync } from "node:fs";
import { ensureDir } from "fs-extra";
import prompts from "prompts";
import path from "node:path";

import { cloneBoilerplate, personalizeProject } from "../lib/git.js";
import { logInfo, logSuccess, logWarn } from "../lib/log.js";

/**
 * opts: { name?: string; branch?: string; installPath?: string }
 */
export default async function init(opts: {
  name?: string;
  branch?: string;
  installPath?: string;
} = {}) {
  const answers = await prompts([
    {
      type: opts.name ? null : "text",
      name: "name",
      message: "Nome do projeto (pasta destino):",
      initial: "my-struct-app"
    }
  ]);

  const projectName = opts.name || answers.name;
  // If user provided an explicit installPath, use it. Otherwise default to cwd/projectName
  const targetDir = opts.installPath
    ? path.resolve(process.cwd(), opts.installPath, projectName)
    : path.resolve(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    logWarn(`Diretório ${targetDir} já existe. Arquivos podem ser sobrescritos.`);
  } else {
    await ensureDir(targetDir);
  }

  const repo = "https://github.com/discovery-solutions/struct-boilerplate";
  logInfo(`Clonando boilerplate de ${repo} (branch: ${opts.branch || "main"}) ...`);
  await cloneBoilerplate({ repo, branch: opts.branch || "main", targetDir });

  logInfo("Personalizando projeto...");
  await personalizeProject({ targetDir, projectName });

  logSuccess(`Projeto criado em ${targetDir}`);
  logInfo("Próximos passos:");
  console.log(`  cd ${targetDir}`);
  console.log("  pnpm install");
  console.log("  cp .env.example .env.local   # configure suas variáveis");
  console.log("  pnpm dev");
}