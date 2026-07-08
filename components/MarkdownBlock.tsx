import { Fragment, type ReactNode, useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, Lightbulb, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { remarkGithubAlerts } from '@/lib/remarkGithubAlerts';
import { cn } from '@/lib/utils';

const kOrderedItemPattern = /^(\s*)(\d{1,9})([.)])(\s+)/;
const kBulletItemPattern = /^(\s*)([-*+])(\s+)/;
const kFencePattern = /^(\s*)(`{3,}|~{3,})/;

type ListItemMatch = { indent: number; contentStart: number; isOrdered: boolean };

function matchListItem(line: string): ListItemMatch | null {
  const ordered_match = line.match(kOrderedItemPattern);
  if (ordered_match) {
    return { indent: ordered_match[1].length, contentStart: ordered_match[0].length, isOrdered: true };
  }
  const bullet_match = line.match(kBulletItemPattern);
  if (bullet_match) {
    return { indent: bullet_match[1].length, contentStart: bullet_match[0].length, isOrdered: false };
  }
  return null;
}

/**
 * CommonMark/GFM (the spec GitHub itself renders against) only treats a
 * bullet or numbered line as *nested* under the previous list item when it's
 * indented to at least that item's content column. Notes pasted or typed
 * into this app often use a 1-2 space "visual" indent for sub-bullets under
 * a numbered step, which is one space short of that requirement — remark
 * then parses each numbered step as its own separate single-item list,
 * which is why the numbering resets to "1." every time and sub-bullets look
 * flat instead of nested (see the `思路` preview bug report). This pass
 * re-indents such under-indented continuation lines so they parse the way
 * GitHub would render them if they'd been indented correctly, without
 * touching content inside fenced code blocks.
 */
function normalizeListIndentation(markdown: string): string {
  const lines = markdown.split('\n');
  let in_fence = false;
  let fence_marker = '';
  let parent: ListItemMatch | null = null;

  const normalized_lines = lines.map((line) => {
    const fence_match = line.match(kFencePattern);
    if (fence_match) {
      const marker_char = fence_match[2][0];
      if (!in_fence) {
        in_fence = true;
        fence_marker = marker_char;
      } else if (marker_char === fence_marker) {
        in_fence = false;
      }
      return line;
    }

    if (in_fence || line.trim() === '') {
      return line;
    }

    const match = matchListItem(line);
    if (!match) {
      const indent_match = line.match(/^\s*/);
      const indent = indent_match ? indent_match[0].length : 0;
      if (parent && indent < parent.contentStart && indent <= parent.indent) {
        parent = null;
      }
      return line;
    }

    if (!parent || match.indent < parent.indent) {
      parent = match;
      return line;
    }

    if (match.isOrdered === parent.isOrdered && match.indent <= parent.indent) {
      parent = match;
      return line;
    }

    if (match.indent >= parent.contentStart) {
      // Already indented enough to be a proper nested list; leave as-is.
      return line;
    }

    // Under-indented relative to the parent item's content column: pad it so
    // it parses as a nested list instead of breaking the parent list apart.
    return ' '.repeat(parent.contentStart) + line.slice(match.indent);
  });

  return normalized_lines.join('\n');
}

/**
 * Renders a prose string with only inline `code` spans honoured; every other
 * character (including `*`, `_`, `[`, `]` used in math such as `2^k` or
 * `Σ_{d|n}`) is emitted literally. We deliberately do NOT run these short
 * summaries through a full Markdown parser: they contain no intentional
 * bold/italic/links, and a parser would mangle bare `*`/`_` in formulae into
 * emphasis. This keeps inline code like `rand()` or `__gnu_pbds` styled while
 * leaving math untouched.
 */
export function InlineMarkdown({ children, className: class_name }: { children: string; className?: string }) {
  // Split on properly-paired backtick spans; unmatched backticks stay literal.
  const segments = children.split(/(`[^`]+`)/g);

  return (
    <span className={cn(class_name)}>
      {segments.map((segment, index) => {
        if (segment.length >= 2 && segment.startsWith('`') && segment.endsWith('`')) {
          return (
            <code
              key={index}
              className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {segment.slice(1, -1)}
            </code>
          );
        }
        return <Fragment key={index}>{segment}</Fragment>;
      })}
    </span>
  );
}

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

type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

// Mirrors GitHub's five `> [!TYPE]` alert callouts (colors, icon, label).
const kAlertMeta: Record<AlertType, { icon: typeof Info; label: string; container: string; title: string }> = {
  note: {
    icon: Info,
    label: 'Note',
    container: 'border-blue-400/50 bg-blue-500/10',
    title: 'text-blue-700 dark:text-blue-300'
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    container: 'border-emerald-400/50 bg-emerald-500/10',
    title: 'text-emerald-700 dark:text-emerald-300'
  },
  important: {
    icon: AlertCircle,
    label: 'Important',
    container: 'border-purple-400/50 bg-purple-500/10',
    title: 'text-purple-700 dark:text-purple-300'
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    container: 'border-amber-400/50 bg-amber-500/10',
    title: 'text-amber-700 dark:text-amber-300'
  },
  caution: {
    icon: XCircle,
    label: 'Caution',
    container: 'border-rose-400/50 bg-rose-500/10',
    title: 'text-rose-700 dark:text-rose-300'
  }
};

function alertTypeFromClassName(class_name?: string): AlertType | null {
  const token = class_name?.split(/\s+/).find((entry) => entry.startsWith('markdown-alert-'));
  const type = token?.replace('markdown-alert-', '');
  return type && type in kAlertMeta ? (type as AlertType) : null;
}

export function MarkdownBlock({ children, className: class_name }: { children: string; className?: string }) {
  const normalized_children = useMemo(() => normalizeListIndentation(children), [children]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, remarkGithubAlerts]}
      rehypePlugins={[rehypeKatex]}
      className={cn('space-y-3 text-sm leading-7', class_name)}
      components={{
        p: ({ children: paragraph_children }) => <p>{paragraph_children}</p>,
        h1: ({ children: heading_children }) => (
          <h1 className="text-lg font-semibold text-foreground">{heading_children}</h1>
        ),
        h2: ({ children: heading_children, className: heading_class_name }) => {
          // The GFM footnotes section ships a "Footnotes" <h2 class="sr-only">
          // label meant only for screen readers (GitHub relies on a visual
          // divider instead) — respect that instead of forcing our own style.
          if (heading_class_name?.includes('sr-only')) {
            return <h2 className="sr-only">{heading_children}</h2>;
          }
          return <h2 className="text-base font-semibold text-foreground">{heading_children}</h2>;
        },
        h3: ({ children: heading_children }) => (
          <h3 className="text-sm font-semibold text-foreground">{heading_children}</h3>
        ),
        h4: ({ children: heading_children }) => (
          <h4 className="text-sm font-semibold text-foreground">{heading_children}</h4>
        ),
        h5: ({ children: heading_children }) => (
          <h5 className="text-sm font-medium text-muted-foreground">{heading_children}</h5>
        ),
        h6: ({ children: heading_children }) => (
          <h6 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {heading_children}
          </h6>
        ),
        blockquote: ({ children: quote_children, className: bq_class_name }) => {
          const alert_type = alertTypeFromClassName(bq_class_name);
          if (alert_type) {
            const meta = kAlertMeta[alert_type];
            const Icon = meta.icon;
            return (
              <div className={cn('rounded-2xl border-l-4 p-4', meta.container)}>
                <p className={cn('mb-2 flex items-center gap-2 text-sm font-semibold', meta.title)}>
                  <Icon className="h-4 w-4" aria-hidden />
                  {meta.label}
                </p>
                <div className="space-y-3 text-foreground/90">{quote_children}</div>
              </div>
            );
          }
          return (
            <blockquote className="space-y-3 border-l-4 border-primary/40 pl-4 text-muted-foreground italic">
              {quote_children}
            </blockquote>
          );
        },
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
        // `list-outside` (GitHub's default) keeps the marker hanging in the
        // gutter so wrapped lines align under the item text instead of the
        // marker, and nested lists get their own tight spacing below.
        ul: ({ children: list_children }) => (
          <ul className="list-outside list-['・'] space-y-1.5 pl-6 marker:text-muted-foreground/70">
            {list_children}
          </ul>
        ),
        ol: ({ children: list_children }) => (
          <ol className="list-outside list-decimal space-y-1.5 pl-6 marker:text-muted-foreground/70">
            {list_children}
          </ol>
        ),
        li: ({ children: item_children, className: li_class_name }) => {
          const is_task_item = li_class_name?.includes('task-list-item');
          if (is_task_item) {
            return (
              <li className="flex list-none items-start gap-2 pl-0 [&>ol]:mb-0 [&>ol]:mt-1.5 [&>p]:my-0 [&>ul]:mb-0 [&>ul]:mt-1.5">
                {item_children}
              </li>
            );
          }
          return (
            <li className="pl-1 [&>ol]:mb-0 [&>ol]:mt-1.5 [&>p]:my-0 [&>ul]:mb-0 [&>ul]:mt-1.5">{item_children}</li>
          );
        },
        input: ({ type: input_type, checked: input_checked }) => {
          if (input_type !== 'checkbox') {
            return null;
          }
          return (
            <input
              type="checkbox"
              checked={input_checked ?? false}
              disabled
              readOnly
              className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-border accent-primary"
            />
          );
        },
        table: ({ children: table_children }) => (
          <div className="my-1 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-sm">{table_children}</table>
          </div>
        ),
        thead: ({ children: thead_children }) => <thead className="bg-muted/60">{thead_children}</thead>,
        tbody: ({ children: tbody_children }) => (
          <tbody className="divide-y divide-border [&_tr:nth-child(even)]:bg-muted/30">{tbody_children}</tbody>
        ),
        th: ({ children: th_children, style: th_style }) => (
          <th
            style={th_style}
            className="border-b border-border px-3 py-2 text-left font-semibold text-foreground"
          >
            {th_children}
          </th>
        ),
        td: ({ children: td_children, style: td_style }) => (
          <td style={td_style} className="px-3 py-2 align-top text-muted-foreground">
            {td_children}
          </td>
        ),
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element -- markdown images have
          // arbitrary, unconfigured remote sources that next/image can't optimize.
          <img src={src} alt={alt ?? ''} loading="lazy" className="max-w-full rounded-xl border border-border" />
        ),
        section: ({ children: section_children, className: section_class_name }) => {
          if (section_class_name?.includes('footnotes')) {
            return (
              <section className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                {section_children}
              </section>
            );
          }
          return <section>{section_children}</section>;
        },
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
      {normalized_children}
    </ReactMarkdown>
  );
}
