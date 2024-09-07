import { extractTasks, TodoComment } from '../src/extractTasks';
import { CommentChunk } from '../src/parseComments';

describe('extractTasks', () => {
  const comments: CommentChunk[] = [
    {
      startLine: 1,
      endLine: 1,
      content: '// TODO: refactor this function',
      fileName: 'file1.ts'
    },
    {
      startLine: 2,
      endLine: 2,
      content: '// FIXME: fix this bug',
      fileName: 'file2.ts'
    },
    {
      startLine: 3,
      endLine: 3,
      content: '// This is a regular comment',
      fileName: 'file3.ts'
    },
    {
      startLine: 4,
      endLine: 4,
      content: '/*\n * TODO: add more tests\n */',
      fileName: 'file4.ts'
    }
  ];

  it('should extract TODO comments', () => {
    const regex = /TODO:/;
    const result = extractTasks(regex, comments);
    const expected: TodoComment[] = [
      {
        startLine: 1,
        endLine: 1,
        content: '// TODO: refactor this function',
        fileName: 'file1.ts'
      },
      {
        startLine: 4,
        endLine: 4,
        content: '/*\n * TODO: add more tests\n */',
        fileName: 'file4.ts'
      }
    ];
    expect(result).toEqual(expected);
  });

  it('should extract FIXME comments', () => {
    const regex = /FIXME:/;
    const result = extractTasks(regex, comments);
    const expected: TodoComment[] = [
      {
        startLine: 2,
        endLine: 2,
        content: '// FIXME: fix this bug',
        fileName: 'file2.ts'
      }
    ];
    expect(result).toEqual(expected);
  });

  it('should return an empty array if no comments match the regex', () => {
    const regex = /NOTE:/;
    const result = extractTasks(regex, comments);
    expect(result).toEqual([]);
  });

  it('should handle an empty comments array', () => {
    const regex = /TODO:/;
    const result = extractTasks(regex, []);
    expect(result).toEqual([]);
  });
});
