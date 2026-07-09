'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Code2, Maximize2, X } from 'lucide-react';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import { useMounted } from '@/lib/useMounted';
import { cn } from '@/lib/utils';

/**
 * A compact trigger that opens the given implementation in an embedded window
 * (a modal with a blurred backdrop). Long code lines therefore never stretch
 * the surrounding card layout — they live in the overlay instead.
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
  const [open, set_open] = useState(false);
  const preview_line = code.trim().split('\n', 1)[0] ?? '';

  return (
    <div className={cn('mt-3', class_name)}>
      <button
        type="button"
        onClick={() => set_open(true)}
        className="group/code flex w-full items-center gap-3 rounded-2xl border border-border bg-background/60 px-3.5 py-2.5 text-left transition hover:border-primary/50 hover:bg-background"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Code2 className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
            查看實作程式碼
            {complexity ? (
              <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-200">
                {complexity}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
            {preview_line}
          </span>
        </span>
        <Maximize2
          className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover/code:text-primary"
          aria-hidden
        />
      </button>

      <CodeWindow
        code={code}
        title={title}
        language={language}
        complexity={complexity}
        open={open}
        onClose={() => set_open(false)}
      />
    </div>
  );
}

function CodeWindow({
  code,
  title,
  language,
  complexity,
  open,
  onClose: on_close
}: {
  code: string;
  title?: string;
  language: string;
  complexity?: string;
  open: boolean;
  onClose: () => void;
}) {
  const mounted = useMounted();

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        on_close();
      }
    }
    document.addEventListener('keydown', onKey);
    const previous_overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous_overflow;
    };
  }, [open, on_close]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} 實作` : '實作程式碼'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Blurred, dimmed backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={on_close} aria-hidden />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Code2 className="h-4 w-4 text-primary" aria-hidden />
              {title ?? '實作程式碼'}
            </p>
            {complexity ? <p className="mt-1 text-xs text-muted-foreground">複雜度：{complexity}</p> : null}
          </div>
          <button
            type="button"
            onClick={on_close}
            aria-label="關閉"
            className="rounded-full border border-border p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-auto px-5 py-4">
          <MarkdownBlock>{`\`\`\`${language}\n${code}\n\`\`\``}</MarkdownBlock>
        </div>
      </div>
    </div>,
    document.body
  );
}
