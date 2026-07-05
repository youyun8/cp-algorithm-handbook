'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import type { PracticeProblem, Problem } from '@/lib/types';
import { cn, sourceLabel, sourceUrl } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface ProblemSourceLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  problem: Pick<Problem, 'source' | 'source_id'> | PracticeProblem;
  children?: ReactNode;
}

export function ProblemSourceLink({
  problem,
  children,
  className: class_name,
  ...props
}: ProblemSourceLinkProps) {
  const leet_code_site = useSettingsStore((state) => state.leetCodeSite);

  return (
    <a
      href={sourceUrl(problem, leet_code_site)}
      target="_blank"
      rel="noreferrer"
      className={cn(class_name)}
      {...props}
    >
      {children ?? `${sourceLabel(problem.source)} 原題`}
    </a>
  );
}
