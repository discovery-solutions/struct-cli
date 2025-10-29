// log.ts
import chalk from "chalk";
export const logInfo = (m) => console.log(chalk.cyan("i"), m);
export const logSuccess = (m) => console.log(chalk.green("✔"), m);
export const logWarn = (m) => console.log(chalk.yellow("!"), m);
export const logError = (m) => console.log(chalk.red("x"), m);
