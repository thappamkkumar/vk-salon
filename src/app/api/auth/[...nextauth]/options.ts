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
    if (user && "id" in user && "role" in user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },

  async session({ session, token }) {
    if (
      session.user &&
      typeof token.id === "number" &&
      typeof token.role === "string"
    ) {
      session.user.id = token.id;
      session.user.role = token.role;
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
