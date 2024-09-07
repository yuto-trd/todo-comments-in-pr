import * as core from '@actions/core';
import { outputDiff } from './outputDiff';
import { parseDiff } from './parseDiff';
import { parseComments } from './parseComments';
import { extractTasks } from './extractTasks';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const pathJson: string = core.getInput('path');
    const path = JSON.parse(pathJson) as string[];
    const commit: string = core.getInput('commit');
    const singleLineComment = core.getInput('single_line_comment', {
      trimWhitespace: true
    });
    const multiLineCommentStart = core.getInput('multi_line_comment_start', {
      trimWhitespace: true
    });
    const multiLineCommentEnd = core.getInput('multi_line_comment_end', {
      trimWhitespace: true
    });
    const regexpOptions =
      singleLineComment && multiLineCommentStart && multiLineCommentEnd
        ? {
            singleLine: new RegExp(singleLineComment),
            multiLine: {
              start: new RegExp(multiLineCommentStart),
              end: new RegExp(multiLineCommentEnd)
            }
          }
        : undefined;
    const regexp = new RegExp(
      core.getInput('regex', { trimWhitespace: true }) ?? 'TODO'
    );

    const diff = await outputDiff(path, commit);
    core.debug(`Diff: ${diff}`);

    const diffChunks = parseDiff(diff);
    core.debug(`Diff chunks: ${diffChunks}`);

    const commentChunks = diffChunks
      .flatMap(chunk => parseComments(chunk, regexpOptions));
    core.debug(`Comment chunks: ${commentChunks}`);

    const tasks = extractTasks(regexp, commentChunks);

    core.setOutput('tasks', tasks);
    core.setOutput('tasks_count', tasks.length);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
