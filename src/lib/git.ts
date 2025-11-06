import simpleGit from "simple-git";
import path from "node:path";
import fs from "fs-extra";
import { logInfo } from "./log.js";

export async function cloneBoilerplate(opts: { repo: string; branch: string; targetDir: string }) {
  const git = simpleGit();
  await git.clone(opts.repo, opts.targetDir, ["--branch", opts.branch, "--single-branch", "--depth", "1"]);
  await fs.remove(path.join(opts.targetDir, ".git"));
}

export async function personalizeProject(opts: { targetDir: string; projectName: string }) {
  // Ajustar package.json, README e .env.example
  const pkgPath = path.join(opts.targetDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJSON(pkgPath);
    pkg.name = opts.projectName.replace(/\s+/g, "-").toLowerCase();
    await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
  }

  // README foi escrito para boilerplate; opcionalmente inserir nome do projeto no título
  const readmePath = path.join(opts.targetDir, "README.md");
  if (await fs.pathExists(readmePath)) {
    let content = await fs.readFile(readmePath, "utf-8");
    content = content.replace("### Boilerplate DSCVR Struct", `### ${opts.projectName} (DSCVR Struct)`);
    await fs.writeFile(readmePath, content, "utf-8");
  }

  // .env.example -> se não existir, criar base
  const envExamplePath = path.join(opts.targetDir, ".env.example");
  if (!(await fs.pathExists(envExamplePath))) {
    const base = `NEXT_PUBLIC_APP_URL=http://localhost:3000

AUTH_SECRET=change_me
AUTH_URL=

MONGODB_URI=
MONGODB_NAME=

EMAIL_FROM="Seu App <noreply@seu-dominio.com>"
EMAIL_SERVER=

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

PLATFORM_API_KEY=

OPENAI_API_KEY=
BLOB_READ_WRITE_TOKEN=
`;
    await fs.writeFile(envExamplePath, base, "utf-8");
  }

  logInfo("Personalização concluída.");
}