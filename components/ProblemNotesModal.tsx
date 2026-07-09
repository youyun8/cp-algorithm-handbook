'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eraser, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { kCodeLanguages, CodeEditor, kDefaultCodeLanguage } from '@/components/CodeEditor';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/utils';

const kNotePanels = [
  { id: 'solution', label: '解答（程式碼）' },
  { id: 'thought', label: '思路（支援 Markdown）' }
] as const;
type NotePanelId = (typeof kNotePanels)[number]['id'];

export function ProblemNotesModal({
  problemId: problem_id,
  title,
  open,
  onClose: on_close
}: {
  problemId: string;
  title?: string;
  open: boolean;
  onClose: () => void;
}) {
  const mounted = useMounted();

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') on_close();
    }
    document.addEventListener('keydown', onKey);
    const previous_overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous_overflow;
    };
  }, [open, on_close]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="記錄解答"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Blurred, dimmed backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={on_close} aria-hidden />
      {/* The dialog body remounts each time it opens, so its form state is
          initialized from the latest saved note without a re-hydration effect. */}
      <NotesDialogBody problemId={problem_id} title={title} onClose={on_close} />
    </div>,
    document.body
  );
}

function NotesDialogBody({
  problemId: problem_id,
  title,
  onClose: on_close
}: {
  problemId: string;
  title?: string;
  onClose: () => void;
}) {
  const note = useProgressStore((state) => state.problemNotes[problem_id]);
  const save_problem_note = useProgressStore((state) => state.saveProblemNote);
  const clear_problem_note = useProgressStore((state) => state.clearProblemNote);

  const [solution, set_solution] = useState(note?.solution ?? '');
  const [thought, set_thought] = useState(note?.thought ?? '');
  const [language, set_language] = useState(note?.language ?? kDefaultCodeLanguage);
  const [thought_view, set_thought_view] = useState<'edit' | 'preview'>('preview');
  const [active_panel, set_active_panel] = useState<NotePanelId>('solution');
  const [saved, set_saved] = useState(false);

  function handleSave() {
    save_problem_note(problem_id, { solution, thought, language });
    set_saved(true);
  }

  function handleClearField(field: NotePanelId) {
    const next_solution = field === 'solution' ? '' : solution;
    const next_thought = field === 'thought' ? '' : thought;

    set_solution(next_solution);
    set_thought(next_thought);
    save_problem_note(problem_id, { solution: next_solution, thought: next_thought, language });
    set_saved(true);
  }

  function handleClearAll() {
    if (!solution.trim() && !thought.trim() && !note) return;
    if (!window.confirm('確定要清空這題的解答與思路嗎？')) return;

    set_solution('');
    set_thought('');
    clear_problem_note(problem_id, 'all');
    set_saved(true);
  }

  const updated_at = note?.updatedAt
    ? new Intl.DateTimeFormat('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(note.updatedAt))
    : null;

  return (
    <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-2xl">
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">記錄解答與思路</p>
          {title ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{title}</p> : null}
          {updated_at ? <p className="mt-0.5 text-xs text-muted-foreground">上次更新：{updated_at}</p> : null}
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

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {kNotePanels.map((panel) => (
              <button
                key={panel.id}
                type="button"
                onClick={() => set_active_panel(panel.id)}
                aria-pressed={active_panel === panel.id}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                  active_panel === panel.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:text-foreground'
                )}
              >
                {panel.label}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleClearField(active_panel)}
            disabled={active_panel === 'solution' ? !solution.trim() : !thought.trim()}
            title={active_panel === 'solution' ? '清空解答' : '清空思路'}
          >
            <Eraser className="h-4 w-4" aria-hidden />
            {active_panel === 'solution' ? '清空解答' : '清空思路'}
          </Button>
        </div>

        {active_panel === 'solution' ? (
          <div className="rounded-2xl border border-border bg-background/45 p-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  語言
                  <select
                    value={language}
                    onChange={(event) => {
                      set_language(event.target.value);
                      set_saved(false);
                    }}
                    className="rounded-lg border border-border bg-background/70 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {kCodeLanguages.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <CodeEditor
                value={solution}
                language={language}
                onValueChange={(value) => {
                  set_solution(value);
                  set_saved(false);
                }}
                placeholder={
                  '// Paste or write your solution code here\n// Highlighting follows the selected language'
                }
                minHeight="14rem"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-background/45 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-end gap-1 rounded-xl border border-border p-0.5">
                {(
                  [
                    { id: 'edit', label: '編輯' },
                    { id: 'preview', label: '預覽' }
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => set_thought_view(option.id)}
                    className={
                      thought_view === option.id
                        ? 'rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground'
                        : 'rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground'
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {thought_view === 'edit' ? (
                <textarea
                  value={thought}
                  onChange={(event) => {
                    set_thought(event.target.value);
                    set_saved(false);
                  }}
                  rows={12}
                  className="min-h-[14rem] w-full resize-y rounded-2xl border border-border bg-card/70 px-3 py-2 font-mono text-sm leading-6 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
                  placeholder={
                    '記錄如何建模、判斷單調性、邊界處理與下次複習提醒。\n\n支援 **粗體**、清單、引言（>）、行內 `code` 與 ``` 程式碼區塊。'
                  }
                />
              ) : thought.trim() ? (
                <div className="min-h-[14rem] rounded-2xl border border-border bg-card/70 px-4 py-3">
                  <MarkdownBlock>{thought}</MarkdownBlock>
                </div>
              ) : (
                <div className="flex min-h-[14rem] items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-4 py-3 text-sm text-muted-foreground">
                  尚無內容可預覽
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
        <p className="text-xs leading-5 text-muted-foreground">
          內容會先儲存在此瀏覽器；使用雲端同步時會一併上傳。
        </p>
        <div className="flex items-center gap-2">
          {saved ? (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">已儲存</span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={!solution.trim() && !thought.trim() && !note}
            className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            清空全部
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={on_close}>
            關閉
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            儲存記錄
          </Button>
        </div>
      </footer>
    </div>
  );
}
