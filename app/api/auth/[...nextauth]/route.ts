import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For demo purposes, we'll allow any email/password.
        // In production, validate against your database.
        if (credentials?.email) {
          return {
            id: "1",
            email: credentials.email,
            // If the email is the designated GM email, assign the gm role.
            role: credentials.email === "gm@example.com" ? "gm" : "player"
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user?: any }) {
      // When first logging in, user will be available.
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      // Make the role available in the session
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
