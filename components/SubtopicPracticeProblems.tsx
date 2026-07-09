'use client';

import { useState } from 'react';
import { DifficultyBadge, SourceBadge, TierBadge } from '@/components/Badges';
import { ProblemNotesModal } from '@/components/ProblemNotesModal';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { ProblemStatusControl } from '@/components/ProblemStatusControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeProblem } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { effectiveProblemStatus } from '@/lib/problemStatus';
import { practiceProblemId } from '@/lib/practiceProgress';
import { problemDisplayTitle } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

function SubtopicPracticeProblemCard({ problem }: { problem: PracticeProblem }) {
  const [show_notes, set_show_notes] = useState(false);
  const mounted = useMounted();
  const problem_id = practiceProblemId(problem);
  const note = useProgressStore((state) => state.problemNotes[problem_id]);
  const explicit_status = useProgressStore((state) => state.problemStatuses[problem_id]);
  const completed_practice_problem_ids = useProgressStore((state) => state.completedPracticeProblemIds);
  const set_problem_status = useProgressStore((state) => state.setProblemStatus);
  const legacy_completed = completed_practice_problem_ids.includes(problem_id);
  const status = mounted ? effectiveProblemStatus(explicit_status, { completed: legacy_completed }) : 'none';
  const passed = status === 'passed';

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/80 bg-card/90 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <SourceBadge source={problem.source} />
            {problem.rating ? <DifficultyBadge rating={problem.rating} /> : null}
            {problem.tier ? <TierBadge tier={problem.tier} /> : null}
          </div>
          <ProblemStatusControl problemId={problem_id} legacySignals={{ completed: legacy_completed }} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-base leading-6">{problemDisplayTitle(problem)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {problem.tags && problem.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {problem.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-accent/70 px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border/70 pt-4">
          <ProblemSourceLink
            problem={problem}
            className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            打開原題
          </ProblemSourceLink>
          <Button type="button" variant="outline" size="sm" onClick={() => set_show_notes(true)}>
            {note ? '查看記錄' : '記錄解答'}
          </Button>
          <Button
            type="button"
            variant={passed ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => set_problem_status(problem_id, passed ? 'none' : 'passed')}
          >
            {passed ? '取消通過' : '標記通過'}
          </Button>
        </div>

        <ProblemNotesModal
          problemId={problem_id}
          title={problemDisplayTitle(problem)}
          open={show_notes}
          onClose={() => set_show_notes(false)}
        />
      </CardContent>
    </Card>
  );
}

export function SubtopicPracticeProblems({ problems }: { problems: PracticeProblem[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {problems.map((problem) => (
        <SubtopicPracticeProblemCard key={`${problem.source}-${problem.source_id}`} problem={problem} />
      ))}
    </div>
  );
}
