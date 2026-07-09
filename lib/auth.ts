import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          // `gist` lets the app store each user's progress in a gist under
          // their own GitHub account instead of a shared token account.
          scope: 'read:user user:email gist',
          // GitHub supports prompt=select_account to force an account picker on every OAuth login.
          prompt: 'select_account'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the user's GitHub access token on first sign-in so the progress
      // API can read/write gists in the user's own account. Kept in the JWT
      // only (never the client-facing session).
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach GitHub user id to session
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
});

// Extend next-auth JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
