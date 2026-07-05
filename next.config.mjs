const kRepoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const kInferredBasePath = process.env.GITHUB_ACTIONS === 'true' && kRepoName ? `/${kRepoName}` : '';
const kBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? kInferredBasePath;

// Static export (GitHub Pages) is opt-in via STATIC_EXPORT=true.
// The default build runs in server mode so GitHub OAuth / API routes work.
const kStaticExport = process.env.STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const kNextConfig = {
  ...(kStaticExport ? { output: 'export' } : {}),
  trailingSlash: true,
  basePath: kBasePath,
  assetPrefix: kBasePath || undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  }
};

export default kNextConfig;
