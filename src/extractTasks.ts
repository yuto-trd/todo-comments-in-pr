import { CommentChunk } from "./parseComments";

export type TodoComment = {
  startLine: number;
  endLine: number;
  content: string;
  fileName: string;
}

export function extractTasks(regex: RegExp, comments: CommentChunk[]): TodoComment[] {
  return comments.filter((comment) => regex.test(comment.content))
    .map((comment) => ({
      startLine: comment.startLine,
      endLine: comment.endLine,
      content: comment.content,
      fileName: comment.fileName
    }));
}