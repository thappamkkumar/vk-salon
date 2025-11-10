import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabaseServer";
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
          // Fetch user from Supabase
          const { data, error } = await supabase
            .from("users")
            .select("id, email, role, password_hash")
            .eq("email", credentials.email)
            .single();

          if (error || !data) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            data.password_hash
          );
          if (!isValid) return null;

          return { id: data.id, email: data.email, role: data.role };
        } catch (err) {
          console.error("Authorize error:", err);
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
        const customUser = user as { id: number; role: string };
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
