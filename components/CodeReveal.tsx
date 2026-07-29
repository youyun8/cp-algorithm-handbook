import { ChevronDown, Code2 } from 'lucide-react';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import { cn } from '@/lib/utils';

/**
 * Renders code in place inside a native disclosure widget. The implementation
 * starts collapsed and expands downward without taking the reader away from
 * the surrounding lesson.
 */
export function CodeReveal({
  code,
  title,
  language = 'cpp',
  complexity,
  className: class_name
}: {
  code: string;
  title?: string;
  language?: string;
  complexity?: string;
  className?: string;
}) {
  return (
    <details
      className={cn(
        'group/code mt-3 overflow-hidden rounded-2xl border border-border bg-background/60',
        class_name
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-2.5 text-left marker:hidden transition hover:border-primary/50 hover:bg-background">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Code2 className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground">
            {title ? `查看 ${title} 程式碼` : '查看實作程式碼'}
            {complexity ? (
              <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-200">
                {complexity}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">點擊後於下方展開</span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition group-open/code:rotate-180 group-hover/code:text-primary"
          aria-hidden
        />
      </summary>

      <div className="overflow-x-auto border-t border-border px-4 py-3 sm:px-5 sm:py-4">
        <MarkdownBlock>{`\`\`\`${language}\n${code}\n\`\`\``}</MarkdownBlock>
      </div>
    </details>
  );
}
