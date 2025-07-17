import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions  = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) return null;

        try {
          // Query user from the database
          const result = await pool.query("SELECT id, email, password FROM users WHERE email = $1", [email]);
          const user = result.rows[0];

          if (!user) return null;

          // Compare provided password with hashed password
          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) return null;

          return { id: user.id, email: user.email };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
		error: "/admin/login",  
  },
  secret: process.env.NEXTAUTH_SECRET,
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
