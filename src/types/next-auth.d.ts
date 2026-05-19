import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: Role;
    active?: boolean;
    sessionVersion?: number;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      impersonatedBy?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    uid?: string;
    role?: Role;
    active?: boolean;
    sessionVersion?: number;
    invalid?: 'inactive' | 'session-version' | 'missing-user';
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    uid?: string;
    role?: Role;
    active?: boolean;
    sessionVersion?: number;
    invalid?: 'inactive' | 'session-version' | 'missing-user';
  }
}
