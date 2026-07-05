'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/lib/useMounted';

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, resolvedTheme: resolved_theme, setTheme: set_theme } = useTheme();

  if (!mounted) {
    return (
      <Button type="button" variant="secondary" size="sm" aria-label="切換色彩模式">
        <Monitor className="h-4 w-4" aria-hidden />
      </Button>
    );
  }

  const current_theme = theme ?? 'system';
  const is_dark = resolved_theme === 'dark';
  const next_theme = current_theme === 'system' ? 'light' : current_theme === 'light' ? 'dark' : 'system';
  const label = current_theme === 'system' ? '系統' : is_dark ? '深色' : '淺色';
  const Icon = current_theme === 'system' ? Monitor : current_theme === 'light' ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label={`色彩模式：${label}（點擊切換）`}
      title={`色彩模式：${label}`}
      className="gap-1.5"
      onClick={() => set_theme(next_theme)}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
