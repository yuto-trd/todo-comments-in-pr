import { DiffChunk } from "./parseDiff";

export type CommentChunk = {
  startLine: number;
  endLine: number;
  content: string;
  fileName: string;
}

export type RegExOptions = {
  singleLine?: RegExp;
  multiLine?: {
    start: RegExp;
    end: RegExp;
  };
}

export function parseComments(chunk: DiffChunk, options?: RegExOptions): CommentChunk[] {
  options = options || {
    singleLine: /\/\/.*/g,
    multiLine: {
      start: /\/\*/g,
      end: /\*\//g
    }
  };
  if (options.multiLine) {
    if (!options.multiLine.start || !options.multiLine.end) {
      throw new Error('multiLine.start and multiLine.end are required');
    }
  }
  const comments: CommentChunk[] = [];
  let commentStartLine = 0;
  let commentEndLine = 0;
  let content: string[] = [];
  let multiLineComment = false;
  let singleLineComment = false;

  function reset() {
    commentStartLine = 0;
    commentEndLine = 0;
    content = [];
    multiLineComment = false;
    singleLineComment = false;
  }

  function pushComment() {
    if (commentStartLine > commentEndLine || (commentStartLine === 0 && commentEndLine === 0))
      return;
    if (content.length === 0)
      return;

    comments.push({
      startLine: commentStartLine,
      endLine: commentEndLine,
      content: content.join('\n'),
      fileName: chunk.filename
    });
    reset();
  }

  chunk.lines.forEach((line) => {
    const lineContent = line.content;
    if (options.multiLine?.start.test(lineContent)) {
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

    if (options.multiLine?.end.test(lineContent)) {
      multiLineComment = false;
      pushComment();
      return;
    }

    if (!multiLineComment) {
      if (options.singleLine?.test(lineContent)) {
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
  });

  pushComment();

  return comments;
}