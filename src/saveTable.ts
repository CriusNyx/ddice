import _ from "lodash";
import { formatMarkdownTable } from "./formatTable.ts";

type PFunction = (pSave: number, attempt: number) => number;

const highestAttemptCount = 10;

export function printSaveTables() {
}

export function generateSaveTables() {
  function printPTable(
    name: string,
    table: number[][],
  ) {
    const tableText = generateTableText(table);
    console.log(`# ${name}\n`);
    console.log(formatMarkdownTable(tableText));
  }

  printPTable(
    "Probability to make Nth save",
    generateSaveTable(p_make_nth_save),
  );
  printPTable(
    "Probability to fail at least N Saves",
    generateSaveTable(p_fail_at_least_n_times),
  );

  printPTable(
    "Probability to make Nth save (Advantage)",
    generateSaveTable(curryWithPModifier(p_make_nth_save, pWithAdvantage)),
  );
  printPTable(
    "Probability to fail at least N Saves (Advantage)",
    generateSaveTable(
      curryWithPModifier(p_fail_at_least_n_times, pWithAdvantage),
    ),
  );

  printPTable(
    "Probability to make Nth save (Disadvantage)",
    generateSaveTable(curryWithPModifier(p_make_nth_save, pWithDisadvantage)),
  );
  printPTable(
    "Probability to fail at least N Saves (Disadvantage)",
    generateSaveTable(
      curryWithPModifier(p_fail_at_least_n_times, pWithDisadvantage),
    ),
  );
}

function curryWithPModifier(
  func: PFunction,
  modifierFunc: (p: number) => number,
) {
  return (pSave: number, attempt: number) => func(modifierFunc(pSave), attempt);
}

function pWithAdvantage(pSave: number) {
  return 1 - Math.pow(1 - pSave, 2);
}

function pWithDisadvantage(pSave: number) {
  return pSave * pSave;
}

function format_p(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function generateTableText(table: number[][]) {
  const header = ["Save", ...table[0].map((_x, i) => `Roll ${i}`)];
  const body = table.map((x, i) => [(i + 1).toString(), ...x.map(format_p)]);
  return { header, body };
}

function generateSaveTable(pFunc: (pSave: number, attempt: number) => number) {
  return _.range(1, 21).map((i) => generateTableRow(i, pFunc));
}

function generateTableRow(
  saveDC: number,
  p_func: (pSave: number, attempt: number) => number,
) {
  return _.range(1, highestAttemptCount + 1).map((
    attempt,
  ) => p_func(p_dc(saveDC), attempt));
}

function p_dc(dc: number) {
  return (21 - dc) / 20;
}

function p_make_nth_save(pSave: number, attempt: number): number {
  return pSave * p_fail_at_least_n_times(pSave, attempt - 1);
}

function p_fail_at_least_n_times(p_save: number, attempt: number): number {
  const pFail = 1 - p_save;
  return Math.pow(pFail, attempt);
}
