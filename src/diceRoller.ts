import { Err, Ok, Result } from "ts-results";
import _ from "lodash";

const re = /^(\d+)d(\d+)$/;

export function rollAndPrint(
  source: string | undefined,
): Result<undefined, string> {
  return rollDice(source).map((result) => {
    if (result.rolls.length == 1) {
      console.log(`${source}: ${result.total}`);
    } else {
      console.log(`${source}: ${result.total} = ${result.rolls.join(" + ")}`);
    }
    return undefined;
  });
}

export function rollDice(
  source: string | undefined,
): Result<ReturnType<typeof rollMany>, string> {
  return parseDice(source).map(rollMany);
}

function rollOnce(dice: DDice) {
  return _.random(1, dice.face);
}

function rollMany(dice: DDice) {
  const rolls = _.range(dice.count).map(() => rollOnce(dice));
  const total = _.sum(rolls);
  return { total, rolls };
}

export interface DDice {
  count: number;
  face: number;
}

export function parseDice(source: string | undefined): Result<DDice, string> {
  if (!source) {
    return Err("Must specify dice. ie 1d20");
  }

  const result = re.exec(source);
  if (!result) {
    return Err(`Could not parse ddice ${source}`);
  }

  const countString = result[1];
  const faceString = result[2];
  const count = Number.parseInt(countString);
  const face = Number.parseInt(faceString);

  if (!Number.isInteger(count)) {
    return Err(`Could not parse ddice ${source}`);
  }
  if (!Number.isInteger(face)) {
    return Err(`Could not parse ddice ${source}`);
  }

  return Ok({ count, face });
}
