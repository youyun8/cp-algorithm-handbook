'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/lib/useMounted';
import { useSettingsStore } from '@/store/useSettingsStore';

const kWidthClass = {
  standard: 'max-w-7xl',
  wide: 'max-w-[110rem]',
  full: 'max-w-none'
};

export function AppWidthContainer({
  as: Component = 'div',
  className: class_name,
  children
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const mounted = useMounted();
  const content_width = useSettingsStore((state) => state.contentWidth);
  const resolved_width = mounted ? content_width : 'wide';

  return <Component className={cn('mx-auto', kWidthClass[resolved_width], class_name)}>{children}</Component>;
}
