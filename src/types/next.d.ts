import { JWT } from 'next-auth/jwt';

declare module 'next/server' {
  interface NextRequest {
    user?: JWT & { isGuest?: boolean };
  }
}
