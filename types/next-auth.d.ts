import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      gamificationPoints: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    gamificationPoints: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    gamificationPoints: number;
  }
}
