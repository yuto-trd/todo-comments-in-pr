# Find TODOs in pull requests

[![GitHub Super-Linter](https://github.com/indigo-san/todo-comments-in-pr/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/indigo-san/todo-comments-in-pr/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/indigo-san/todo-comments-in-pr/actions/workflows/check-dist.yml/badge.svg)](https://github.com/indigo-san/todo-comments-in-pr/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/indigo-san/todo-comments-in-pr/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/indigo-san/todo-comments-in-pr/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Find the TODO comment in the pull request diff.

## Example usage

```yaml
name: Find TODOs in pull requests

on:
  pull_request:

jobs:
  find-todos:
    permissions:
      pull-requests: write

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: indigo-san/todo-comments-in-pr@v1
        id: todos

      - name: Generate a summary of the tasks
        uses: actions/github-script@v7
        id: summary
        with:
          result-encoding: string
          script: |
            const tasks = JSON.parse('${{ steps.todos.outputs.tasks }}');
            let body = tasks.map(task => `https://github.com/${{ github.repository }}/blob/${{ github.sha }}/${item.fileName}#L${item.startLine}-L${item.endLine}`).join('\n');

            if (tasks.length > 0) {
              body = `The following TODO comments were found:\n\n${body}`;
            } else {
              body = 'No TODO comments were found.';
            }
            return body;

      - name: Comment on the pull request
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          header: todo-cooments
          recreate: true
          message: |
            ${{ steps.summary.outputs.result }}
```

## Inputs

### `path`

**Optional** The path to the file to search for TODOs. Need to specify a Json
array.  
(default: `["*.cs","*.js","*.jsx","*.ts","*.tsx","*.css","*.scss","*.sass"]`)

### `commit`

**Optional** The commit to compare the current commit to.  
(default: `${{ github.event.pull_request.base.ref }}`)

### `single_line_comment`

**Optional** The regex pattern to match single-line comments.  
(default: `\/\/.*`)

### `multi_line_comment_start`

**Optional** The regex pattern to match the start of a multi-line comment.  
(default: `\/\*`)

### `multi_line_comment_end`

**Optional** The regex pattern to match the end of a multi-line comment.  
(default: `\*\/`)

### `regex`

**Optional** The regex pattern to match the keywords.  
(default: `TODO`)

## Outputs

### `tasks`

The list of tasks found in the diff.

```json
[
  {
    "startLine": 1,
    "endLine": 1,
    "content": "// TODO: test",
    "fileName": "path/to/file"
  }
]
```

### `tasks_count`

The number of tasks found in the diff.
