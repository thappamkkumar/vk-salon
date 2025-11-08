import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const result = await pool.query(
            "SELECT id, email, role, password_hash FROM users WHERE email = $1",
            [credentials.email]
          );

          const user = result.rows[0];
          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );
          if (!isValid) return null;

          return { id: user.id, email: user.email, role: user.role };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Server error during login");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
       const customUser = user as unknown as { id: number; role: string };
			token.id = customUser.id;
			token.role = customUser.role;
      }
      return token;
    },

    async session({ session, token }) {
			const sessionUser = session?.user as { id?: number; role?: string } | undefined;
			const customToken = token as { id?: number; role?: string };

      if (sessionUser && customToken.id) {
        sessionUser.id = customToken.id;
        sessionUser.role = customToken.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
