import type { DiffChunk } from './parseDiff';

export type CommentChunk = {
  startLine: number;
  endLine: number;
  content: string;
  fileName: string;
};

export type RegExOptions = {
  singleLine?: RegExp;
  multiLine?: {
    start: RegExp;
    end: RegExp;
  };
};

export function parseComments(
  chunk: DiffChunk,
  options?: RegExOptions
): CommentChunk[] {
  const singleLineCommentRegEx = options ? options.singleLine : /\/\/.*/g;
  const multiLineCommentStartRegEx = options
    ? options.multiLine?.start
    : /\/\*/g;
  const multiLineCommentEndRegEx = options ? options.multiLine?.end : /\*\//g;

  if (options?.multiLine) {
    if (!options?.multiLine?.start || !options?.multiLine?.end) {
      throw new Error('multiLine.start and multiLine.end are required');
    }
  }
  const comments: CommentChunk[] = [];
  let commentStartLine = 0;
  let commentEndLine = 0;
  let content: string[] = [];
  let multiLineComment = false;
  let singleLineComment = false;

  function reset(): void {
    commentStartLine = 0;
    commentEndLine = 0;
    content = [];
    multiLineComment = false;
    singleLineComment = false;
  }

  function pushComment(): void {
    if (
      commentStartLine > commentEndLine ||
      (commentStartLine === 0 && commentEndLine === 0)
    )
      return;
    if (content.length === 0) return;

    comments.push({
      startLine: commentStartLine,
      endLine: commentEndLine,
      content: content.join('\n'),
      fileName: chunk.filename
    });
    reset();
  }

  for (const line of chunk.lines) {
    const lineContent = line.content;
    if (multiLineCommentStartRegEx?.test(lineContent)) {
      if (singleLineComment) {
        pushComment();
      }

      multiLineComment = true;
      commentStartLine = line.line;
    }

    if (multiLineComment) {
      content.push(lineContent);
      commentEndLine = line.line;
    }

    if (multiLineCommentEndRegEx?.test(lineContent)) {
      multiLineComment = false;
      pushComment();
      continue;
    }

    if (!multiLineComment) {
      if (singleLineCommentRegEx?.test(lineContent)) {
        content.push(lineContent);
        if (singleLineComment) {
          commentEndLine = line.line;
        } else {
          commentStartLine = line.line;
          commentEndLine = line.line;
          singleLineComment = true;
        }
      } else if (singleLineComment) {
        pushComment();
      }
    }
  }

  pushComment();

  return comments;
}
