import { parseComments, CommentChunk } from '../src/parseComments';
import { DiffChunk } from '../src/parseDiff';

describe('parseComments', () => {
  it('should parse single line comments', () => {
    const chunk: DiffChunk = {
      filename: 'testFile.ts',
      lines: [
        { line: 1, content: '// This is a single line comment' },
        { line: 2, content: 'const a = 1;' },
        { line: 3, content: '// Another single line comment' }
      ]
    };

    const expected: CommentChunk[] = [
      {
        startLine: 1,
        endLine: 1,
        content: '// This is a single line comment',
        fileName: 'testFile.ts'
      },
      {
        startLine: 3,
        endLine: 3,
        content: '// Another single line comment',
        fileName: 'testFile.ts'
      }
    ];

    expect(parseComments(chunk)).toEqual(expected);
  });

  it('should parse multi-line comments', () => {
    const chunk: DiffChunk = {
      filename: 'testFile.ts',
      lines: [
        { line: 1, content: '/* This is a' },
        { line: 2, content: 'multi-line comment */' },
        { line: 3, content: 'const a = 1;' }
      ]
    };

    const expected: CommentChunk[] = [
      {
        startLine: 1,
        endLine: 2,
        content: '/* This is a\nmulti-line comment */',
        fileName: 'testFile.ts'
      }
    ];

    expect(parseComments(chunk)).toEqual(expected);
  });

  it('should parse mixed comments', () => {
    const chunk: DiffChunk = {
      filename: 'testFile.ts',
      lines: [
        { line: 1, content: '// Single line comment' },
        { line: 2, content: 'const a = 1;' },
        { line: 3, content: '/* Multi-line' },
        { line: 4, content: 'comment */' }
      ]
    };

    const expected: CommentChunk[] = [
      {
        startLine: 1,
        endLine: 1,
        content: '// Single line comment',
        fileName: 'testFile.ts'
      },
      {
        startLine: 3,
        endLine: 4,
        content: '/* Multi-line\ncomment */',
        fileName: 'testFile.ts'
      }
    ];

    expect(parseComments(chunk)).toEqual(expected);
  });

  it('should handle no comments', () => {
    const chunk: DiffChunk = {
      filename: 'testFile.ts',
      lines: [
        { line: 1, content: 'const a = 1;' },
        { line: 2, content: 'const b = 2;' }
      ]
    };

    const expected: CommentChunk[] = [];

    expect(parseComments(chunk)).toEqual(expected);
  });

  it('should handle comments with code', () => {
    const chunk: DiffChunk = {
      filename: 'testFile.ts',
      lines: [
        { line: 1, content: 'const a = 1; // Inline comment' },
        { line: 2, content: '/* Multi-line comment' },
        { line: 3, content: 'with code */ const b = 2;' }
      ]
    };

    const expected: CommentChunk[] = [
      {
        startLine: 1,
        endLine: 1,
        content: 'const a = 1; // Inline comment',
        fileName: 'testFile.ts'
      },
      {
        startLine: 2,
        endLine: 3,
        content: '/* Multi-line comment\nwith code */ const b = 2;',
        fileName: 'testFile.ts'
      }
    ];

    expect(parseComments(chunk)).toEqual(expected);
  });
});
