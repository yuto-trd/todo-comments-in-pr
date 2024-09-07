import * as core from '@actions/core';

export type DiffAdditionLine = {
  line: number;
  content: string;
};

export type DiffChunk = {
  filename: string;
  lines: DiffAdditionLine[];
};

type DiffAddtionLineAndFileName = DiffAdditionLine & { filename: string };

function groupBy<K extends PropertyKey, V>(
  array: readonly V[],
  keySelector: (cur: V, idx: number, src: readonly V[]) => K
): Partial<Record<K, V[]>> {
  return array.reduce(
    (obj, cur, idx, src) => {
      const key = keySelector(cur, idx, src);
      let arr = obj[key];
      if (!arr) {
        arr = [];
        obj[key] = arr;
      }

      arr.push(cur);
      return obj;
    },
    {} as Partial<Record<K, V[]>>
  );
}

export function parseDiff(diff: string): DiffChunk[] {
  let filename = '';
  let startLine = 0;
  const lines: DiffAddtionLineAndFileName[] = [];

  for (const line of diff.split('\n')) {
    if (/^diff --git a\/.* b\/.*/.test(line)) {
      filename = line
        .substring(13)
        .replace(/^a\//, '')
        .replace(/ b\/.*/, '');
    } else if (line.startsWith('@@ ')) {
      const arr = line.split(/[@, ]+/);
      const lineNumString = arr.find(i => i.startsWith('+'))?.substring(1);
      if (!lineNumString) {
        core.warning(`Failed to parse line number from: ${line}`);
      } else {
        startLine = Number.parseInt(lineNumString);
      }
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      lines.push({ filename, line: startLine, content: line.substring(1) });
      startLine++;
    }
  }

  const result: DiffChunk[] = [];
  const group = groupBy(lines, l => l.filename);
  for (const [filename, lines] of Object.entries(group)) {
    let currentLine = -1;
    let currentChunk: DiffAdditionLine[] = [];

    for (const line of lines ?? []) {
      if (currentLine === -1 || currentLine + 1 === line.line) {
        currentLine = line.line;
        currentChunk.push({ line: line.line, content: line.content });
      } else {
        currentLine = line.line;
        result.push({ filename: line.filename, lines: currentChunk });
        currentChunk = [{ line: line.line, content: line.content }];
      }
    }

    if (currentChunk.length > 0) {
      result.push({ filename: filename, lines: currentChunk });
    }
  }

  return result;
}
