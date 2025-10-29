import { Command } from "commander";
import init from "./commands/init.js";
import generate from "./commands/generate.js";
const program = new Command();
program
    .name("dscvr-struct")
    .description("CLI para scaffolding e geração de entidades do DSCVR Struct")
    .version("0.1.0");
program
    .command("init")
    .description("Scaffold do projeto a partir do boilerplate oficial")
    .option("-n, --name <projectName>", "Nome do projeto / pasta destino")
    .option("-b, --branch <branch>", "Branch do boilerplate", "main")
    .action(init);
program
    .command("generate")
    .description("Gera entidades a partir de um documento (md|json)")
    .requiredOption("-d, --doc <path>", "Caminho do documento de entrada")
    .option("--domain <domain>", "Domínio (ex: identity, content)", "content")
    .option("--no-ui", "Não gerar páginas de UI")
    .option("--yes", "Não perguntar antes de escrever no disco")
    .action(generate);
program.parseAsync(process.argv);
