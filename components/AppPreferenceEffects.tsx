'use client';

import { useEffect } from 'react';
import { useMounted } from '@/lib/useMounted';
import { useSettingsStore } from '@/store/useSettingsStore';

export function AppPreferenceEffects() {
  const mounted = useMounted();
  const text_size = useSettingsStore((state) => state.textSize);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.textSize = text_size;
    return () => {
      delete document.documentElement.dataset.textSize;
    };
  }, [mounted, text_size]);

  return null;
}
