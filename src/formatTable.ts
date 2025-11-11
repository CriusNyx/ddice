import _ from "lodash";
import { safeTransform } from "./util.ts";

interface FormatTableOptions {
  header?: string[];
  headerSeparator?: ((len: number) => string) | string;
  body: string[][];
  columnSeparator?: string;
  leftBorder?: string;
  rightBorder?: string;
  paddingSide?: "start" | "end";
}

interface MarkdownTableOptions {
  header?: string[];
  body: string[][];
}

export function formatMarkdownTable(opts: MarkdownTableOptions) {
  return formatTable({
    header: opts.header,
    body: opts.body,
    headerSeparator: "-",
    leftBorder: "| ",
    rightBorder: " |",
    columnSeparator: " | ",
  });
}

export function formatTable(opts: FormatTableOptions) {
  const { header, body } = opts;
  const columnSeparator = opts.columnSeparator ?? " ";
  const leftBorder = opts.leftBorder ?? "";
  const rightBorder = opts.rightBorder ?? "";

  function pad(source: string, len: number) {
    switch (opts.paddingSide) {
      case "end":
        return _.padEnd(source, len);
      case "start":
      default:
        return _.padStart(source, len);
    }
  }

  const columns = Math.max(
    header?.length ?? 0,
    body.map((x) => x.length).reduce(
      (prev, current) => Math.max(prev, current),
      0,
    ),
  );
  const columnWidhts = _.range(columns).map(() => 0);

  const separatorFunc = safeTransform(opts.headerSeparator, (sep) => {
    if (_.isFunction(sep)) {
      return sep;
    }

    return (len: number) => {
      return _.range(len).map((_x) => sep).join("").substring(0, len);
    };
  });

  function updateWidths(row: string[]) {
    row.forEach((value, i) => {
      columnWidhts[i] = Math.max(columnWidhts[i], value.length);
    });
  }

  updateWidths(header ?? []);
  body.forEach(updateWidths);

  function formatRow(row: string[]) {
    return `${leftBorder}${
      row.map((x, i) => pad(x, columnWidhts[i])).join(columnSeparator)
    }${rightBorder}\n`;
  }

  let output = "";
  if (header) {
    output = formatRow(header);
  }

  // Add separator
  if (separatorFunc) {
    const separator = columnWidhts.map(separatorFunc);
    output += formatRow(separator);
  }

  body.forEach((row) => output += formatRow(row));

  return output;
}

function formatTable2(header: string[], body: string[][]) {
  const columns = Math.max(
    header.length,
    body.map((x) => x.length).reduce(
      (prev, current) => Math.max(prev, current),
      0,
    ),
  );
  const columnWidhts = _.range(columns).map(() => 0);

  function updateWidths(row: string[]) {
    row.forEach((value, i) => {
      columnWidhts[i] = Math.max(columnWidhts[i], value.length);
    });
  }

  updateWidths(header);
  body.forEach(updateWidths);

  function formatRow(row: string[]) {
    return `| ${
      row.map((x, i) => x.padStart(columnWidhts[i], " ")).join(" | ")
    } |\n`;
  }

  const separator = columnWidhts.map((width) =>
    _.range(width).map(() => "-").join("")
  );

  let output = formatRow(header);
  output += formatRow(separator);
  body.forEach((row) => output += formatRow(row));

  return output;
}
