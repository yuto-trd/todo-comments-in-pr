import { exec } from 'node:child_process';
import util from 'node:util';
const execAsync = util.promisify(exec);

export async function outputDiff(
  path: string[],
  commit: string
): Promise<string> {
  await execAsync(`git fetch origin ${commit}`);
  const { stdout } = await execAsync(
    `git diff ${commit} -U0 --diff-filter=AM -- ${path.map(s => `'${s}'`).join(' ')}`
  );
  return stdout;
}
