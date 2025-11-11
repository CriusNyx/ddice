import { program } from "@commander-js/extra-typings";
import chalk from "chalk";
import _ from "lodash";
import { generateSaveTables } from "./saveTable.ts";
import { rollAndPrint } from "./diceRoller.ts";
import { generateManyPDF, generatePDF } from "./diePDF.ts";
import { Result } from "ts-results";
import { formatTable } from "./formatTable.ts";

const examples = [
  ["ddice", "Roll 1d20"],
  ["ddice 8d6", "Roll 8d6"],
  [
    "ddice --save-table",
    "Print probability tables for making a saving throw.",
  ],
  ["ddice 4d4 --pdf", "Print probability distribution funrtion for 4d4."],
  [
    "ddice 4d4 --pdf --out-file out.png",
    "Compute probability distribution function for 4d4 and write them to a PNG file.",
  ],
];

const formattedExamples = examples.map((x) => {
  const [example, description] = x;
  return [`  ${example}`, description];
});

const additionalHelpText = `\nExamples:\n${
  formatTable({
    body: formattedExamples,
    paddingSide: "end",
    columnSeparator: "  ",
  })
}`;

const parser = program.argument("[string]", "Dice to roll", "1d20")
  .addHelpText(
    "beforeAll",
    "Small program to roll dice, or generates tables and graphs with probability functions.\n",
  ).option(
    "--save-table",
    "Generate save table",
  ).option(
    "--pdf",
    "Compute and graph probability distribution function for specified dice",
  ).option("--many-pdf", "Print all pdf functions for 1 to 10 dice.").option(
    "--out-file <string>",
    "File to write graphics to.",
  ).addHelpText(
    "afterAll",
    additionalHelpText,
  )
  .action(main);

type ProgramArgs = Parameters<Parameters<typeof parser.action>["0"]>;

parser.parse();

async function main(...[dice, opts]: ProgramArgs) {
  if (opts.saveTable) {
    generateSaveTables();
  } else if (opts.pdf) {
    runWithResult(await generatePDF(dice, opts.outFile));
  } else if (opts.manyPdf) {
    await generateManyPDF();
  } else {
    runWithResult(rollAndPrint(dice));
  }
}

function runWithResult<T>(result: Result<T, string>) {
  return result.mapErr(printError);
}

function printError(error: string) {
  console.error(chalk.red(error));
}
