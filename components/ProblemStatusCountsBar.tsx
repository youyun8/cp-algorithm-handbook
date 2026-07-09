import { kProblemStatusMeta, kProblemStatusOrder, type ProblemStatusCounts } from '@/lib/problemStatus';
import { cn } from '@/lib/utils';

// A compact row of three chips showing how many problems sit in each status.
// Used under progress bars and in overviews so the per-status breakdown is
// consistent everywhere.
export function ProblemStatusCountsBar({
  counts,
  className
}: {
  counts: ProblemStatusCounts;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2 text-xs', className)}>
      {kProblemStatusOrder.map((status) => {
        const meta = kProblemStatusMeta[status];
        return (
          <span key={status} className={cn('rounded-full border px-2.5 py-1 font-semibold', meta.className)}>
            {meta.label} {counts[status]}
          </span>
        );
      })}
    </div>
  );
}
