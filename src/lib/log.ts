// log.ts
import chalk from "chalk";
export const logInfo = (m: string) => console.log(chalk.cyan("i"), m);
export const logSuccess = (m: string) => console.log(chalk.green("✔"), m);
export const logWarn = (m: string) => console.log(chalk.yellow("!"), m);
export const logError = (m: string) => console.log(chalk.red("x"), m);