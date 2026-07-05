import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

const kCppKeywords = new Set([
  'auto',
  'bool',
  'break',
  'case',
  'char',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'false',
  'float',
  'for',
  'if',
  'int',
  'long',
  'namespace',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'signed',
  'sizeof',
  'static',
  'struct',
  'switch',
  'template',
  'true',
  'typedef',
  'typename',
  'unsigned',
  'using',
  'void',
  'while'
]);

const kCppTypesAndFunctions = new Set([
  'array',
  'deque',
  'greater',
  'map',
  'max',
  'min',
  'pair',
  'priority_queue',
  'queue',
  'set',
  'sort',
  'string',
  'unordered_map',
  'unordered_set',
  'vector'
]);

function HighlightedCode({ children, className: class_name }: { children: string; className?: string }) {
  const language = class_name?.replace('language-', '') ?? 'text';

  return (
    <code className={cn('block min-w-max font-mono text-[13px]', class_name)} data-language={language}>
      {children
        .replace(/\n$/, '')
        .split('\n')
        .map((line, line_index) => (
          <span key={line_index} className="block">
            {highlightCppLine(line)}
          </span>
        ))}
    </code>
  );
}

function highlightCppLine(line: string) {
  const tokens: ReactNode[] = [];
  let index = 0;
  let token_index = 0;

  const push = (text: string, class_name?: string) => {
    if (!text) return;
    tokens.push(
      class_name ? (
        <span key={token_index++} className={class_name}>
          {text}
        </span>
      ) : (
        <span key={token_index++}>{text}</span>
      )
    );
  };

  while (index < line.length) {
    const comment_start = line.indexOf('//', index);

    if (comment_start === index) {
      push(line.slice(index), 'text-emerald-700 dark:text-emerald-300');
      break;
    }

    const char = line[index];

    if (char === '"' || char === "'") {
      const quote = char;
      let end = index + 1;

      while (end < line.length) {
        if (line[end] === '\\') {
          end += 2;
          continue;
        }

        if (line[end] === quote) {
          end += 1;
          break;
        }

        end += 1;
      }

      push(line.slice(index, end), 'text-amber-700 dark:text-amber-300');
      index = end;
      continue;
    }

    if (char === '#' && line.slice(0, index).trim() === '') {
      push(line.slice(index), 'text-violet-700 dark:text-violet-300');
      break;
    }

    const number_match = line.slice(index).match(/^\b\d+(?:\.\d+)?\b/);
    if (number_match) {
      push(number_match[0], 'text-blue-700 dark:text-blue-300');
      index += number_match[0].length;
      continue;
    }

    const word_match = line.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (word_match) {
      const word = word_match[0];

      if (kCppKeywords.has(word)) {
        push(word, 'font-semibold text-fuchsia-700 dark:text-fuchsia-300');
      } else if (kCppTypesAndFunctions.has(word)) {
        push(word, 'text-sky-700 dark:text-sky-300');
      } else {
        push(word);
      }

      index += word.length;
      continue;
    }

    const operator_match = line
      .slice(index)
      .match(/^(?:==|!=|<=|>=|\+\+|--|&&|\|\||->|::|[+\-*/%=!<>()[\]{}.,;:&|])/);
    if (operator_match) {
      push(operator_match[0], 'text-slate-700 dark:text-slate-300');
      index += operator_match[0].length;
      continue;
    }

    push(char);
    index += 1;
  }

  return tokens;
}

export function MarkdownBlock({ children, className: class_name }: { children: string; className?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn('space-y-3 text-sm leading-7', class_name)}
      components={{
        p: ({ children: paragraph_children }) => <p>{paragraph_children}</p>,
        h1: ({ children: heading_children }) => (
          <h1 className="text-lg font-semibold text-foreground">{heading_children}</h1>
        ),
        h2: ({ children: heading_children }) => (
          <h2 className="text-base font-semibold text-foreground">{heading_children}</h2>
        ),
        h3: ({ children: heading_children }) => (
          <h3 className="text-sm font-semibold text-foreground">{heading_children}</h3>
        ),
        blockquote: ({ children: quote_children }) => (
          <blockquote className="space-y-3 border-l-4 border-primary/40 pl-4 text-muted-foreground italic">
            {quote_children}
          </blockquote>
        ),
        a: ({ children: link_children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2"
          >
            {link_children}
          </a>
        ),
        hr: () => <hr className="border-border" />,
        ul: ({ children: list_children }) => (
          <ul className="list-inside list-['・'] space-y-2">{list_children}</ul>
        ),
        ol: ({ children: list_children }) => (
          <ol className="list-inside list-decimal space-y-2">{list_children}</ol>
        ),
        li: ({ children: item_children }) => <li>{item_children}</li>,
        code: ({ children: code_children, className: code_class_name }) => {
          if (code_class_name) {
            return <HighlightedCode className={code_class_name}>{String(code_children)}</HighlightedCode>;
          }

          return (
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {code_children}
            </code>
          );
        },
        pre: ({ children: pre_children }) => (
          <pre className="overflow-x-auto rounded-2xl border border-border bg-slate-100 p-4 font-mono leading-6 text-slate-900 dark:bg-[#0d1117] dark:text-slate-100">
            {pre_children}
          </pre>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
