'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CircleHelp, Cloud, RefreshCw, X } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { kIsStaticExport } from '@/lib/runtime';
import { useProgressStore } from '@/store/useProgressStore';

type AutoSyncStatus = 'idle' | 'pending' | 'syncing' | 'error';
type ManualResult = { kind: 'idle' | 'ok' | 'error'; message?: string };

const kAutoSyncDebounceMs = 3000;

function computeDataHash(state: ReturnType<typeof useProgressStore.getState>): string {
  return JSON.stringify([
    state.currentRating,
    state.reviewedProblemIds,
    state.coveredTopicIds,
    state.submissions.map((s) => s.id),
    state.reviewEvents.length,
    state.practiceCompletionEvents.length,
    state.contestSessions.map((s) => s.id),
    Object.entries(state.problemNotes)
      .map(([id, n]) => `${id}:${n.updatedAt}`)
      .sort(),
    state.completedPracticeProblemIds
  ]);
}

function formatSyncTime(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function formatSyncTimeCompact(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const is_today =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (is_today) {
    return new Intl.DateTimeFormat('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function DiagSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </p>
      <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function DiagRow({ label, value, mono = true }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-3 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={`break-all text-right text-xs ${mono ? 'font-mono' : 'font-medium'}`}>
        {String(value)}
      </span>
    </div>
  );
}

export function FloatingCloudSync() {
  const [open, set_open] = useState(false);

  if (kIsStaticExport) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="w-[min(calc(100vw-2.5rem),22rem)] rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">進度儲存</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  靜態部署版本只能使用本機儲存；雲端同步需伺服器部署。
                </p>
              </div>
              <button
                type="button"
                onClick={() => set_open(false)}
                aria-label="關閉同步面板"
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => set_open((v) => !v)}
          aria-label="開啟進度同步"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Cloud className="h-6 w-6" aria-hidden />
        </button>
      </div>
    );
  }

  return <FloatingCloudSyncAuthed open={open} setOpen={set_open} />;
}

function FloatingCloudSyncAuthed({
  open,
  setOpen: set_open
}: {
  open: boolean;
  setOpen: (open: boolean | ((v: boolean) => boolean)) => void;
}) {
  const { data: session, status } = useSession();
  const last_cloud_sync_at = useProgressStore((s) => s.lastCloudSyncAt);

  // Diagnostic data from store
  const current_rating = useProgressStore((s) => s.currentRating);
  const reviewed_count = useProgressStore((s) => s.reviewedProblemIds.length);
  const submission_count = useProgressStore((s) => s.submissions.length);
  const notes_count = useProgressStore((s) => Object.keys(s.problemNotes).length);
  const completed_count = useProgressStore((s) => s.completedPracticeProblemIds.length);
  const contest_count = useProgressStore((s) => s.contestSessions.length);

  const [auto_sync_status, set_auto_sync_status] = useState<AutoSyncStatus>('idle');
  const [manual_result, set_manual_result] = useState<ManualResult>({ kind: 'idle' });
  const [busy_manual, set_busy_manual] = useState<null | 'save'>(null);
  const [show_diag, set_show_diag] = useState(false);

  const last_synced_hash_ref = useRef<string | null>(null);
  const is_syncing_ref = useRef(false);
  const sync_timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prev_logged_in_ref = useRef<boolean | undefined>(undefined);

  const is_logged_in = !!session?.user;
  const last_cloud_sync_text = formatSyncTime(last_cloud_sync_at);
  const session_key = session?.user?.email ?? session?.user?.name ?? null;

  useEffect(() => {
    if (status === 'loading') return;

    const logged_in = !!session?.user;
    const just_logged_in = logged_in && !prev_logged_in_ref.current;
    prev_logged_in_ref.current = logged_in;

    if (!logged_in) {
      if (sync_timer_ref.current) {
        clearTimeout(sync_timer_ref.current);
        sync_timer_ref.current = null;
      }
      const reset_timer = setTimeout(() => set_auto_sync_status('idle'), 0);
      return () => clearTimeout(reset_timer);
    }

    if (just_logged_in) {
      is_syncing_ref.current = true;
      set_auto_sync_status('syncing');
      useProgressStore
        .getState()
        .loadFromCloud()
        .then(() => {
          last_synced_hash_ref.current = computeDataHash(useProgressStore.getState());
          set_auto_sync_status('idle');
        })
        .catch(() => {
          set_auto_sync_status('error');
        })
        .finally(() => {
          is_syncing_ref.current = false;
        });
    }

    const unsub = useProgressStore.subscribe((state) => {
      if (is_syncing_ref.current) return;
      const hash = computeDataHash(state);
      if (hash === last_synced_hash_ref.current) return;
      set_auto_sync_status('pending');
      if (sync_timer_ref.current) clearTimeout(sync_timer_ref.current);
      sync_timer_ref.current = setTimeout(async () => {
        if (is_syncing_ref.current) return;
        is_syncing_ref.current = true;
        set_auto_sync_status('syncing');
        try {
          const res = await useProgressStore.getState().syncToCloud();
          last_synced_hash_ref.current = computeDataHash(useProgressStore.getState());
          set_auto_sync_status(res.ok ? 'idle' : 'error');
        } catch {
          set_auto_sync_status('error');
        } finally {
          is_syncing_ref.current = false;
        }
      }, kAutoSyncDebounceMs);
    });

    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session_key]);

  async function runManualSync() {
    set_busy_manual('save');
    set_manual_result({ kind: 'idle' });
    if (sync_timer_ref.current) {
      clearTimeout(sync_timer_ref.current);
      sync_timer_ref.current = null;
    }
    is_syncing_ref.current = true;
    set_auto_sync_status('syncing');
    try {
      const res = await useProgressStore.getState().syncToCloud();
      last_synced_hash_ref.current = computeDataHash(useProgressStore.getState());
      set_auto_sync_status(res.ok ? 'idle' : 'error');
      set_manual_result(
        res.ok
          ? { kind: 'ok', message: '已同步至雲端。' }
          : { kind: 'error', message: res.error ?? '操作失敗。' }
      );
    } catch {
      set_auto_sync_status('error');
      set_manual_result({ kind: 'error', message: '操作失敗。' });
    } finally {
      set_busy_manual(null);
      is_syncing_ref.current = false;
    }
  }

  // ── derived values ──────────────────────────────────────────────────────────

  const dot_class = !is_logged_in
    ? null
    : auto_sync_status === 'syncing'
      ? 'bg-sky-400 animate-pulse'
      : auto_sync_status === 'pending'
        ? 'bg-amber-400 animate-pulse'
        : auto_sync_status === 'error'
          ? 'bg-red-500'
          : 'bg-emerald-500';

  const status_color =
    auto_sync_status === 'error'
      ? 'text-red-500'
      : auto_sync_status === 'pending'
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-muted-foreground';

  const status_label =
    auto_sync_status === 'syncing'
      ? '同步中…'
      : auto_sync_status === 'pending'
        ? '有待同步的變更'
        : auto_sync_status === 'error'
          ? '上次同步失敗'
          : last_cloud_sync_text
            ? `已同步 · ${last_cloud_sync_text}`
            : '尚未同步至雲端';

  const diag_status_label =
    auto_sync_status === 'idle'
      ? last_cloud_sync_at
        ? '已同步'
        : '閒置（從未同步）'
      : auto_sync_status === 'syncing'
        ? '同步中'
        : auto_sync_status === 'pending'
          ? '待同步'
          : '同步失敗';

  const is_busy = busy_manual !== null || auto_sync_status === 'syncing';

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Diagnostic overlay ── */}
      {show_diag && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/30 backdrop-blur-md"
          onClick={() => set_show_diag(false)}
        >
          <div
            className="w-[min(calc(100vw-2.5rem),22rem)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <CircleHelp className="h-4 w-4 text-muted-foreground" aria-hidden />
                <p className="text-sm font-semibold">同步診斷</p>
              </div>
              <button
                type="button"
                onClick={() => set_show_diag(false)}
                aria-label="關閉診斷面板"
                className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-4 p-4">
              <DiagSection title="登入資訊">
                <DiagRow label="使用者" value={session?.user?.name ?? '—'} mono={false} />
                <DiagRow label="Email" value={session?.user?.email ?? '—'} />
                <DiagRow label="狀態" value={is_logged_in ? '已登入' : '未登入'} mono={false} />
              </DiagSection>

              <DiagSection title="同步狀態">
                <DiagRow label="目前狀態" value={diag_status_label} mono={false} />
                <DiagRow label="最後同步" value={last_cloud_sync_at ?? '從未同步'} />
              </DiagSection>

              <DiagSection title="本機資料">
                <DiagRow label="目前評分" value={current_rating} />
                <DiagRow label="已複習題目" value={`${reviewed_count} 題`} />
                <DiagRow label="提交記錄" value={`${submission_count} 筆`} />
                <DiagRow label="解題筆記" value={`${notes_count} 則`} />
                <DiagRow label="已完成練習" value={`${completed_count} 題`} />
                <DiagRow label="比賽場次" value={`${contest_count} 場`} />
              </DiagSection>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB area ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {/* Panel */}
        {open && (
          <div className="w-[min(calc(100vw-2.5rem),22rem)] overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur">
            {is_logged_in ? (
              <>
                {/* Header: avatar + name + status + close */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={40}
                      height={40}
                      className="shrink-0 rounded-full border border-border"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Cloud className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {session.user?.name ?? session.user?.email ?? 'GitHub 使用者'}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {dot_class && (
                        <span
                          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dot_class}`}
                          aria-hidden
                        />
                      )}
                      <p className={`truncate text-xs ${status_color}`}>{status_label}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set_open(false)}
                    aria-label="關閉同步面板"
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-border/50" />

                {/* Actions */}
                <div className="px-4 pt-3 pb-4 space-y-3">
                  <button
                    type="button"
                    onClick={runManualSync}
                    disabled={is_busy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {auto_sync_status === 'syncing' ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                        同步中…
                      </>
                    ) : (
                      '立即同步'
                    )}
                  </button>

                  {manual_result.kind !== 'idle' && (
                    <p
                      className={`text-center text-xs font-medium ${
                        manual_result.kind === 'ok'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500'
                      }`}
                    >
                      {manual_result.message}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      set_open(false);
                      set_show_diag(true);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1 text-xs text-muted-foreground/60 transition hover:text-muted-foreground"
                  >
                    <CircleHelp className="h-3.5 w-3.5" aria-hidden />
                    診斷資訊
                  </button>
                </div>
              </>
            ) : (
              /* Not logged in */
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">雲端同步</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      登入後可自動同步進度、解答與練習狀態。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set_open(false)}
                    aria-label="關閉同步面板"
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {status !== 'loading' && (
                  <button
                    type="button"
                    onClick={() => signIn('github')}
                    className="mt-4 w-full rounded-xl bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    使用 GitHub 登入
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* FAB + compact time label */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => set_open((v) => !v)}
            aria-label="開啟雲端同步"
            className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Cloud className="h-6 w-6" aria-hidden />
            {dot_class && (
              <span
                className={`absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary ${dot_class}`}
                aria-hidden
              />
            )}
          </button>
          {is_logged_in && (
            <span className="select-none text-[10px] leading-none text-muted-foreground/60">
              {auto_sync_status === 'syncing'
                ? '同步中…'
                : (formatSyncTimeCompact(last_cloud_sync_at) ?? '未同步')}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
