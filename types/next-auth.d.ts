import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * 擴展默認的Session類型
   */
  interface Session {
    user: {
      id: string;
      role: string;
      provider?: string;
    } & DefaultSession['user'];
  }

  /**
   * 擴展默認的User類型
   */
  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * 擴展默認的JWT類型
   */
  interface JWT {
    id: string;
    role: string;
    provider?: string;
  }
}