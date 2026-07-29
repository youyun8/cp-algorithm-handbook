'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) {
    throw new Error('Unable to copy code');
  }
}

export function CopyCodeButton({ code, className: class_name }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const reset_timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (reset_timeout.current) clearTimeout(reset_timeout.current);
    },
    []
  );

  const handleCopy = async () => {
    try {
      await copyText(code);
      setCopied(true);

      if (reset_timeout.current) clearTimeout(reset_timeout.current);
      reset_timeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-transparent px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        copied && 'text-emerald-600 dark:text-emerald-400',
        class_name
      )}
      aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
