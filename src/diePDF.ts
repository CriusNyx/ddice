import { Err, Ok, Result } from "ts-results";
import { DDice, parseDice } from "./diceRoller.ts";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import { Canvas } from "skia-canvas";
import _ from "lodash";
import { memoize } from "./util.ts";
import chalk from "chalk";

Chart.register([
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  BarController,
  BarElement,
  Title,
]);

export async function generateManyPDF() {
  const dieFaces = [4, 6, 8, 12, 20];
  const rolls = _.range(1, 11);
  const product = dieFaces.flatMap((face) => rolls.map((roll) => [face, roll]));
  await Promise.all(product.map(async ([face, roll]) => {
    const dieRoll = `${roll}d${face}`;
    await generatePDF(dieRoll, `d${face}_${roll}.png`);
  }));
}

export async function generatePDF(
  diceSource: string | undefined,
  outFile: string | undefined,
): Promise<Result<undefined, string>> {
  const output = await parseDice(diceSource).andThen(computePDF).map(
    (
      pdfResult,
    ) => {
      if (outFile) {
        return printBarGraph(pdfResult, outFile);
      } else {
        printBarGraphCLI(pdfResult);
      }
    },
  );
  return output.map((_x) => undefined);
}

function printBarGraphCLI(pdfResult: PDFResult) {
  const { pdf } = pdfResult;
  const keys = [...pdf.keys()].toSorted((a, b) => a - b);
  const max = _.max([...pdf.values()]) ?? 1;

  const { columns } = Deno.consoleSize();
  const width = Math.floor(columns * 0.5);

  for (const key of keys) {
    const value = pdf.get(key)!;
    const barWidth = Math.floor(width * value / max);
    console.log(
      `${_.padStart(key.toFixed(0), 2)} ${
        chalk.green(_.range(barWidth).map(() => "–").join(""))
      } ${(value * 100).toFixed(2)}%`,
    );
  }
}

interface PDFResult {
  pdf: Map<number, number>;
  dice: DDice;
}

function computePDF(dice: DDice): Result<PDFResult, string> {
  const pdf: Map<number, number> = new Map();

  for (const i of _.range(dice.count, dice.count * dice.face + 1)) {
    pdf.set(i, p_ndf(i, dice.count, dice.face));
  }
  return Ok({ pdf, dice });
}

async function printBarGraph(
  pdfResult: PDFResult,
  outFile: string | undefined,
): Promise<Result<undefined, string>> {
  if (!outFile) {
    return Err("--out-file must be defined");
  }

  const { pdf, dice } = pdfResult;
  const keys = [...pdf.keys()].toSorted((a, b) => a - b);

  const canvas = new Canvas(400, 300);
  const _chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: keys,
      datasets: [{
        label: "P",
        data: keys.map((key) => pdf.get(key)!),
        borderColor: "red",
      }],
    },
    options: {
      scales: {},
      plugins: {
        title: {
          display: true,
          text: `${dice.count}d${dice.face}`,
          align: "center",
          position: "top",
          font: {
            size: 16,
            weight: "normal",
            family: "Arial",
            style: "normal",
          },
          color: "black",
        },
      },
    },
  });

  const pngBuffer = await canvas.toBuffer("png", { matte: "white" });
  await Deno.writeFile(outFile, pngBuffer);

  return Ok(undefined);
}

const p_ndf = memoize((r: number, n: number, f: number): number => {
  if (r < n) {
    return 0;
  }
  if (r > f * n) {
    return 0;
  }
  if (n === 1) {
    return 1 / f;
  }
  let output = 0;

  for (const i of _.range(1, f + 1)) {
    const p_i = p_ndf(i, 1, f);
    const p_r_i = p_ndf(r - i, n - 1, f);
    output += p_i * p_r_i;
  }
  return output;
}, (r, n, f) => `${r} | ${n}d${f}`);
