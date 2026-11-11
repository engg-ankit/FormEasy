import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    /** Bumped on password reset; the JWT is dropped when it no longer matches. */
    sessionVersion?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** Cleared when the session has been revoked. */
    id?: string;
    sv?: number;
  }
}
