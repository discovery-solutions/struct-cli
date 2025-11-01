#!/usr/bin/env node
import { Command } from "commander";
import generate from "./commands/generate.js";
import init from "./commands/init.js";

const program = new Command();

program
  .name("struct-cli")
  .description("CLI para scaffolding e geração de entidades do DSCVR Struct")
  .version("0.1.0");

program
  .command("init")
  .description("Scaffold do projeto a partir do boilerplate oficial")
  .option("-n, --name <projectName>", "Nome do projeto / pasta destino")
  .option("-b, --branch <branch>", "Branch do boilerplate", "main")
  .option("-p, --install-path <path>", "Path onde o boilerplate está/será instalado")
  .action((opts) => init(opts));

program
  .command("generate")
  .description("Gera entidades a partir de um documento (md|json)")
  .requiredOption("-d, --doc <path>", "Caminho do documento de entrada")
  .option("-p, --install-path <path>", "Path onde o boilerplate está/será instalado")
  .option("--no-ui", "Não gerar páginas de UI")
  .option("--yes", "Não perguntar antes de escrever no disco")
  .action((opts) => generate(opts));

program.parseAsync(process.argv);