import  { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: string;
    } & DefaultSession["user"];
  }

  interface JWT extends DefaultJWT {
    id?: number;
    role?: string;
  }
}
