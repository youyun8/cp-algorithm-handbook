import { auth } from '@/lib/auth';
import { kIsStaticExport } from '@/lib/runtime';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Read the user's own GitHub access token from the JWT (persisted in the auth
// jwt callback). Server-only — the token is never exposed to the client session.
async function getUserGitHubToken(req: Request): Promise<string | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  // On HTTPS the session cookie is `__Secure-`-prefixed; getToken must be told
  // so it looks up the right cookie name and salt, otherwise it returns null in
  // production (e.g. Vercel) while working in local dev over http.
  const secureCookie = new URL(req.url).protocol === 'https:';
  const token = await getToken({ req, secret, secureCookie });
  return typeof token?.accessToken === 'string' ? token.accessToken : null;
}

// Walk every page of the token account's gists and return the most recently
// updated one matching the progress description. Paginating is essential: the
// shared token account holds every user's progress gist, so the target quickly
// falls past GitHub's default 30-item first page.
async function findProgressGist(token: string, userId: string) {
  const description = `cp-handbook-progress-${userId}`;
  const matches: Array<{ id: string; updated_at: string }> = [];
  let page = 1;
  for (;;) {
    const res = await fetch(`https://api.github.com/gists?per_page=100&page=${page}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const g of batch) {
      if (g.description === description) matches.push(g);
    }
    if (batch.length < 100) break;
    page += 1;
  }
  // A prior unpaginated run may have created duplicate gists; prefer the newest.
  matches.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  return matches[0] ?? null;
}

// Fetch and parse the progress payload from a specific gist, or null if empty.
async function readProgressFromGist(token: string, gistId: string) {
  const gist_res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  });
  const gist = await gist_res.json();
  const content = (gist.files?.['progress.json'] as { content: string } | undefined)?.content;
  return content ? JSON.parse(content) : null;
}

// GET: load progress from GitHub Gist
export async function GET(req: Request) {
  if (kIsStaticExport) {
    return NextResponse.json({ data: null });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user_token = await getUserGitHubToken(req);
  const shared_token = process.env.GITHUB_GIST_TOKEN;
  if (!user_token && !shared_token) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    // Prefer the user's own account.
    if (user_token) {
      const target = await findProgressGist(user_token, session.user.id);
      if (target) {
        return NextResponse.json({ data: await readProgressFromGist(user_token, target.id) });
      }
    }

    // Migration fallback: read legacy progress from the shared token account so
    // users who synced before the per-account switch don't lose their notes.
    // The next syncToCloud writes it back into the user's own account.
    if (shared_token) {
      const legacy = await findProgressGist(shared_token, session.user.id);
      if (legacy) {
        return NextResponse.json({ data: await readProgressFromGist(shared_token, legacy.id) });
      }
    }

    return NextResponse.json({ data: null }); // No saved progress yet
  } catch {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

// POST: save progress to GitHub Gist
export async function POST(req: Request) {
  if (kIsStaticExport) {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 501 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Write to the user's own account when possible; fall back to the shared
  // token account only if the user token is unavailable (e.g. old session
  // issued before the `gist` scope was added).
  const token = (await getUserGitHubToken(req)) ?? process.env.GITHUB_GIST_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const body = await req.json();
  const updated_at = new Date().toISOString();
  const content = JSON.stringify({
    ...body,
    userId: session.user.id,
    updatedAt: updated_at
  });

  try {
    const existing = await findProgressGist(token, session.user.id);

    const method = existing ? 'PATCH' : 'POST';
    const url = existing ? `https://api.github.com/gists/${existing.id}` : 'https://api.github.com/gists';

    const save_res = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: `cp-handbook-progress-${session.user.id}`,
        public: false,
        files: { 'progress.json': { content: content } }
      })
    });

    if (!save_res.ok) throw new Error(`GitHub API error: ${save_res.status}`);
    return NextResponse.json({ ok: true, updatedAt: updated_at });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
