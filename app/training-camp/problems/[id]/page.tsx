import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Lightbulb } from 'lucide-react';
import { CodeReveal } from '@/components/CodeReveal';
import { InlineMarkdown } from '@/components/MarkdownBlock';
import { PageTransition } from '@/components/PageTransition';
import { kTrainingCampProblemById, kTrainingCampProblems } from '@/lib/trainingCampProblems';

export function generateStaticParams() {
  return kTrainingCampProblems.map((problem) => ({ id: problem.id }));
}

export default async function TrainingCampProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = kTrainingCampProblemById.get(id);

  if (!problem) {
    notFound();
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <Link
          href={`/training-camp#${problem.moduleId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回對應章節
        </Link>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {problem.origin}
            </span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              {problem.section}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold">{problem.title}</h1>
          <a
            href={problem.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-primary transition hover:bg-accent"
          >
            前往 VJudge 原題
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-card">
          <h2 className="text-lg font-semibold">題目概要</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            <InlineMarkdown>{problem.summary}</InlineMarkdown>
          </p>
        </section>

        <section className="rounded-2xl border border-amber-400/30 bg-amber-500/[0.06] p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-300" aria-hidden />
            <h2 className="text-lg font-semibold">題目線索</h2>
          </div>
          <ol className="mt-3 space-y-3">
            {problem.hints.map((hint, index) => (
              <li key={hint} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                <span className="font-semibold text-amber-700 dark:text-amber-300">{index + 1}.</span>
                <span>
                  <InlineMarkdown>{hint}</InlineMarkdown>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-card">
          <h2 className="text-lg font-semibold">思路分析</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            <InlineMarkdown>{problem.analysis}</InlineMarkdown>
          </p>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-card">
            <h2 className="text-lg font-semibold">C++ Skeleton</h2>
            <p className="mt-1 text-sm text-muted-foreground">保留輸入輸出與主要結構，請完成 TODO。</p>
            <CodeReveal code={problem.skeleton} title={`${problem.title} Skeleton`} />
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-card">
            <h2 className="text-lg font-semibold">C++ 解答</h2>
            <p className="mt-1 text-sm text-muted-foreground">GNU++17 可提交版本。</p>
            <CodeReveal code={problem.solution} title={`${problem.title} 解答`} />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
