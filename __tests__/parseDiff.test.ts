import { parseDiff, DiffChunk } from '../src/parseDiff';

describe('parseDiff', () => {
  it('should parse a simple diff with one file and one addition', () => {
    const diff = `
diff --git a/file1.txt b/file1.txt
index 83db48f..bf269f4 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
+Added line
`;
    const expected: DiffChunk[] = [
      {
        filename: 'file1.txt',
        lines: [
          { line: 1, content: 'Added line' }
        ]
      }
    ];
    expect(parseDiff(diff)).toEqual(expected);
  });

  it('should parse a diff with multiple files and additions', () => {
    const diff = `
diff --git a/file1.txt b/file1.txt
index 83db48f..bf269f4 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
+Added line in file1
diff --git a/file2.txt b/file2.txt
index 83db48f..bf269f4 100644
--- a/file2.txt
+++ b/file2.txt
@@ -1 +1 @@
+Added line in file2
`;
    const expected: DiffChunk[] = [
      {
        filename: 'file1.txt',
        lines: [
          { line: 1, content: 'Added line in file1' }
        ]
      },
      {
        filename: 'file2.txt',
        lines: [
          { line: 1, content: 'Added line in file2' }
        ]
      }
    ];
    expect(parseDiff(diff)).toEqual(expected);
  });

  it('should handle diffs with multiple additions in the same file', () => {
    const diff = `
diff --git a/file1.txt b/file1.txt
index 83db48f..bf269f4 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1,2 @@
+Added line 1
+Added line 2
`;
    const expected: DiffChunk[] = [
      {
        filename: 'file1.txt',
        lines: [
          { line: 1, content: 'Added line 1' },
          { line: 2, content: 'Added line 2' }
        ]
      }
    ];
    expect(parseDiff(diff)).toEqual(expected);
  });

  it('should handle diffs with no additions', () => {
    const diff = `
diff --git a/file1.txt b/file1.txt
index 83db48f..bf269f4 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
`;
    const expected: DiffChunk[] = [];
    expect(parseDiff(diff)).toEqual(expected);
  });

  it('should handle diffs with non-contiguous additions in the same file', () => {
    const diff = `
diff --git a/file1.txt b/file1.txt
index 83db48f..bf269f4 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1,2 @@
+Added line 1
@@ -3 +3,2 @@
+Added line 3
`;
    const expected: DiffChunk[] = [
      {
        filename: 'file1.txt',
        lines: [
          { line: 1, content: 'Added line 1' }
        ]
      },
      {
        filename: 'file1.txt',
        lines: [
          { line: 3, content: 'Added line 3' }
        ]
      }
    ];
    expect(parseDiff(diff)).toEqual(expected);
  });
});