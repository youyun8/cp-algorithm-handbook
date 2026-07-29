import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

const kTypeScriptFiles = [
  'lib/trainingCampFoundation.ts',
  'lib/trainingCampStrengthening.ts',
  'lib/trainingCampAdvanced.ts'
];
const kJsonFiles = [
  'data/training-camp-problems-foundation.json',
  'data/training-camp-problems-strengthening.json',
  'data/training-camp-problems-advanced.json'
];
const kClangStyle = JSON.stringify({
  BasedOnStyle: 'Google',
  IndentWidth: 4,
  ContinuationIndentWidth: 4,
  ColumnLimit: 100
});

function toSnakeCase(identifier) {
  return identifier
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

function toPascalCase(identifier) {
  return identifier
    .split('_')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

function identifierRenames(code) {
  const renames = new Map();

  for (const match of code.matchAll(/\b(?:class|struct)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
    renames.set(match[1], toPascalCase(match[1]));
  }
  for (const match of code.matchAll(/\b(?:const|constexpr)\b[^;=\n]*\b([A-Z][A-Z0-9_]*)\s*=/g)) {
    renames.set(match[1], toSnakeCase(match[1]));
  }
  for (const match of code.matchAll(/^\s*#\s*define\s+([A-Z][A-Z0-9_]*)/gm)) {
    renames.set(match[1], toSnakeCase(match[1]));
  }
  for (const match of code.matchAll(/\b[a-z_][A-Za-z0-9_]*[A-Z][A-Za-z0-9_]*\b/g)) {
    if (!renames.has(match[0])) {
      renames.set(match[0], toSnakeCase(match[0]));
    }
  }

  return renames;
}

function renameIdentifiers(code) {
  const renames = identifierRenames(code);
  let result = '';
  let index = 0;
  let state = 'code';

  while (index < code.length) {
    const current = code[index];
    const next = code[index + 1];

    if (state === 'line-comment') {
      result += current;
      index += 1;
      if (current === '\n') state = 'code';
      continue;
    }
    if (state === 'block-comment') {
      result += current;
      index += 1;
      if (current === '*' && next === '/') {
        result += next;
        index += 1;
        state = 'code';
      }
      continue;
    }
    if (state === 'string' || state === 'character') {
      result += current;
      index += 1;
      if (current === '\\' && index < code.length) {
        result += code[index];
        index += 1;
      } else if ((state === 'string' && current === '"') || (state === 'character' && current === "'")) {
        state = 'code';
      }
      continue;
    }

    if (current === '/' && next === '/') {
      result += '//';
      index += 2;
      state = 'line-comment';
    } else if (current === '/' && next === '*') {
      result += '/*';
      index += 2;
      state = 'block-comment';
    } else if (current === '"') {
      result += current;
      index += 1;
      state = 'string';
    } else if (current === "'") {
      result += current;
      index += 1;
      state = 'character';
    } else if (/[A-Za-z_]/.test(current)) {
      let end = index + 1;
      while (end < code.length && /[A-Za-z0-9_]/.test(code[end])) end += 1;
      const identifier = code.slice(index, end);
      result += renames.get(identifier) ?? identifier;
      index = end;
    } else {
      result += current;
      index += 1;
    }
  }

  return result;
}

function collectSnippets() {
  const snippets = [];
  const sources = new Map();

  for (const file of kTypeScriptFiles) {
    const source = readFileSync(file, 'utf8');
    sources.set(file, source);
    for (const match of source.matchAll(/code: `([\s\S]*?)`/g)) {
      snippets.push({
        file,
        kind: 'typescript',
        original: match[1],
        formatted: renameIdentifiers(match[1])
      });
    }
  }

  for (const file of kJsonFiles) {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    sources.set(file, data);
    for (const problem of data) {
      for (const field of ['skeleton', 'solution']) {
        snippets.push({
          file,
          kind: 'json',
          owner: problem,
          field,
          original: problem[field],
          formatted: renameIdentifiers(problem[field])
        });
      }
    }
  }

  return { snippets, sources };
}

function formatSnippets(snippets) {
  const directory = mkdtempSync(join(tmpdir(), 'training-code-'));
  try {
    const paths = snippets.map((snippet, index) => {
      const path = join(directory, `${String(index).padStart(4, '0')}.cpp`);
      writeFileSync(path, `${snippet.formatted.trim()}\n`);
      return path;
    });

    for (let index = 0; index < paths.length; index += 100) {
      execFileSync(
        'npx',
        ['--yes', 'clang-format', '-i', `--style=${kClangStyle}`, ...paths.slice(index, index + 100)],
        { stdio: 'inherit' }
      );
    }

    snippets.forEach((snippet, index) => {
      snippet.formatted = readFileSync(paths[index], 'utf8').trimEnd();
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function writeSources(snippets, sources) {
  for (const file of kTypeScriptFiles) {
    let source = sources.get(file);
    for (const snippet of snippets.filter((item) => item.file === file)) {
      source = source.replace(`code: \`${snippet.original}\``, () => `code: \`${snippet.formatted}\``);
    }
    writeFileSync(file, source);
  }

  for (const file of kJsonFiles) {
    const data = sources.get(file);
    for (const snippet of snippets.filter((item) => item.file === file)) {
      snippet.owner[snippet.field] = snippet.formatted;
    }
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
}

const { snippets, sources } = collectSnippets();
formatSnippets(snippets);
writeSources(snippets, sources);
console.log(`Formatted ${snippets.length} training-camp C++ snippets across ${sources.size} files.`);
