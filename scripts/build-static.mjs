// Static export build for GitHub Pages.
//
// The GitHub OAuth backend (API route handlers under app/api) cannot be
// statically exported, so we temporarily move it out of the build, run the
// static export, then always restore it. Auth-related UI is disabled at
// runtime via lib/runtime.ts (STATIC_EXPORT=true).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const kRoot = process.cwd();
const kApiDir = join(kRoot, 'app', 'api');
const kStash = join(kRoot, '.static-export-stash', 'api');

function moveIfExists(from, to) {
  if (!existsSync(from)) return false;
  mkdirSync(dirname(to), { recursive: true });
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  renameSync(from, to);
  return true;
}

let moved = false;
try {
  moved = moveIfExists(kApiDir, kStash);

  const env = {
    ...process.env,
    STATIC_EXPORT: 'true',
    NEXT_PUBLIC_STATIC_EXPORT: 'true'
  };

  // For local/manual deploys default the base path to /cp-handbook. In GitHub
  // Actions leave it unset so next.config.mjs can infer it from
  // GITHUB_REPOSITORY (rename-safe).
  if (env.NEXT_PUBLIC_BASE_PATH === undefined && env.GITHUB_ACTIONS !== 'true') {
    env.NEXT_PUBLIC_BASE_PATH = '/cp-handbook';
  }

  const result = spawnSync('next', ['build'], {
    stdio: 'inherit',
    env
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  if (moved) {
    moveIfExists(kStash, kApiDir);
    rmSync(join(kRoot, '.static-export-stash'), { recursive: true, force: true });
  }
}
