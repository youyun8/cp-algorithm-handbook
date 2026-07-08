'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PanelLeft, PanelLeftClose, X } from 'lucide-react';
import { TopicGlyph } from '@/components/icons';
import type { Subtopic, Topic } from '@/lib/types';
import { cn } from '@/lib/utils';

const kSidebarWidthKey = 'sidebar-width';
const kMinWidth = 180;
const kMaxWidth = 480;
const kDefaultWidth = 256;

interface HandbookSidebarProps {
  topics: Topic[];
  subtopics: Subtopic[];
  activeTopicSlug: string;
  activeSubtopicSlug?: string;
  anchors?: { id: string; label: string }[];
}

export function HandbookSidebar({
  topics,
  subtopics,
  activeTopicSlug: active_topic_slug,
  activeSubtopicSlug: active_subtopic_slug,
  anchors = []
}: HandbookSidebarProps) {
  const [collapsed, set_collapsed] = useState(false);
  const [mobile_open, set_mobile_open] = useState(false);
  const [width, set_width] = useState<number>(() => {
    if (typeof window === 'undefined') return kDefaultWidth;
    const saved = localStorage.getItem(kSidebarWidthKey);
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return !isNaN(parsed) && parsed >= kMinWidth && parsed <= kMaxWidth ? parsed : kDefaultWidth;
  });

  const dragging = useRef(false);
  const start_x = useRef(0);
  const start_width = useRef(0);

  const on_mouse_move = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - start_x.current;
    const next = Math.min(kMaxWidth, Math.max(kMinWidth, start_width.current + delta));
    set_width(next);
  }, []);

  const on_mouse_up = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    // Persist final width
    set_width((w) => {
      localStorage.setItem(kSidebarWidthKey, String(w));
      return w;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', on_mouse_move);
    window.addEventListener('mouseup', on_mouse_up);
    return () => {
      window.removeEventListener('mousemove', on_mouse_move);
      window.removeEventListener('mouseup', on_mouse_up);
    };
  }, [on_mouse_move, on_mouse_up]);

  const on_resize_mouse_down = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    start_x.current = e.clientX;
    start_width.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!mobile_open) return;
    function on_key(event: KeyboardEvent) {
      if (event.key === 'Escape') set_mobile_open(false);
    }
    document.addEventListener('keydown', on_key);
    const previous_overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', on_key);
      document.body.style.overflow = previous_overflow;
    };
  }, [mobile_open]);

  const render_nav = (on_navigate?: () => void) => (
    <>
      {/* Topics list */}
      <nav className="space-y-0.5">
        {topics.map((topic) => {
          const is_active_topic = active_topic_slug === topic.slug;
          const children = subtopics.filter((s) => s.parent_id === topic.id);

          return (
            <div key={topic.id}>
              <Link
                href={`/handbook/${topic.slug}`}
                onClick={on_navigate}
                aria-current={is_active_topic && !active_subtopic_slug ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-l-2 px-3 py-2 text-sm transition',
                  is_active_topic
                    ? 'border-blue-500 bg-primary/15 font-semibold text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground'
                )}
              >
                <TopicGlyph topicId={topic.id} className="h-4 w-4 shrink-0" />
                <span className="truncate">{topic.title}</span>
              </Link>

              {/* Subtopics (shown when parent is active) */}
              {is_active_topic && children.length > 0 && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                  {children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/handbook/${topic.slug}/${sub.slug}`}
                      onClick={on_navigate}
                      aria-current={active_subtopic_slug === sub.slug ? 'page' : undefined}
                      className={cn(
                        'block truncate rounded-lg px-2 py-1.5 text-xs transition',
                        active_subtopic_slug === sub.slug
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* On This Page anchors */}
      {anchors.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            本頁內容
          </p>
          <nav className="space-y-0.5">
            {anchors.map((anchor) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                onClick={on_navigate}
                className="block truncate rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground"
              >
                {anchor.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile trigger — the sidebar itself is hidden on small screens to avoid squeezing content */}
      <button
        onClick={() => set_mobile_open(true)}
        className="mb-4 flex w-full items-center gap-2 rounded-xl border border-border bg-card/75 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
        aria-label="展開側欄"
      >
        <PanelLeft className="h-4 w-4" aria-hidden />
        <span>主題導覽</span>
      </button>

      <aside
        className={cn(
          'relative hidden shrink-0 transition-[width] duration-100 md:block',
          collapsed ? 'w-10' : ''
        )}
        style={collapsed ? undefined : { width }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => set_collapsed(!collapsed)}
          className="mb-2 flex w-full items-center justify-between rounded-xl border border-border bg-card/75 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label={collapsed ? '展開側欄' : '收合側欄'}
        >
          {!collapsed && <span>主題導覽</span>}
          {collapsed ? (
            <PanelLeft className="h-4 w-4" aria-hidden />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          )}
        </button>

        {!collapsed && (
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-border bg-card/75 p-3 scrollbar-thin">
            {render_nav()}
          </div>
        )}

        {/* Drag-to-resize handle — visible on hover */}
        {!collapsed && (
          <div
            onMouseDown={on_resize_mouse_down}
            title="拖曳調整側欄寬度"
            className="absolute inset-y-0 right-0 z-10 flex w-2 cursor-col-resize items-center justify-center opacity-0 transition-opacity hover:opacity-100"
          >
            <div className="h-12 w-0.5 rounded-full bg-border" />
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {mobile_open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="主題導覽">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => set_mobile_open(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[82vw] max-w-xs flex-col border-r border-border bg-card p-4 shadow-2xl">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <span className="text-sm font-semibold text-foreground">主題導覽</span>
              <button
                onClick={() => set_mobile_open(false)}
                aria-label="關閉側欄"
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">{render_nav(() => set_mobile_open(false))}</div>
          </div>
        </div>
      )}
    </>
  );
}
