
// export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import connectMongoose from "@/app/lib/mongoose";
import User, { IUser } from "@/models/User";

// Type for a plain user object from Mongoose's .lean() method
type LeanUser = Omit<IUser, keyof Document | '_v'> & {
  _id: Types.ObjectId;
};

// Helper function to get a full user object with the correct type
async function getFullUser(email: string): Promise<LeanUser | null> {
    await connectMongoose();
    return User.findOne({ email }).lean<LeanUser>();
}

// Check if the environment is production
const isProduction = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthConfig = {
  // Use JWT for session management
  session: { strategy: "jwt" },

  // These settings are crucial for Vercel's serverless environment
  trustHost: true,
  useSecureCookies: isProduction,

  // Cookies configuration to handle domain mismatch (www vs non-www)
  cookies: {
    sessionToken: {
      name: isProduction ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        // Production me root domain use karein, Localhost me undefined rakhein
        domain: isProduction ? '.pocketvalue.pk' : undefined, 
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

   Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
            const userDoc = await getFullUser(email as string);
            
            // 1. Check: Kya user exist karta hai?
            if (!userDoc) return null;
            
            // 2. Check: Kya user ka password hai?
            if (!userDoc.password) return null;
            
            // 3. Check: Kya Email Verified hai?
            if (!userDoc.emailVerified) throw new Error("EmailNotVerified");
            
            // 4. Check: Password match kar raha hai?
            const passwordsMatch = await bcrypt.compare(password as string, userDoc.password);
            if (passwordsMatch) {
              // UPDATED: Return phone and verification status
              return { 
                id: userDoc._id.toString(), 
                name: userDoc.name, 
                email: userDoc.email, 
                image: userDoc.image, 
                role: userDoc.role,
                phone: userDoc.phone,
                phoneVerified: userDoc.phoneVerified 
              };
            }
        } catch (error) { 
            if (error instanceof Error) throw error;
            return null; 
        }
        return null;
      },
    }),
  ],
  
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login", error: '/login' },

  callbacks: {
    async signIn({ user, account }) {
        // Social Login Logic
        if (account?.provider === 'google' || account?.provider === 'facebook') {
            const { name, email, image } = user;
            if (!email) return false;
            
            try {
                await connectMongoose();
                const existingUser = await User.findOne({ email });

                if (existingUser) {
                    // Update image if changed
                    if (image && existingUser.image !== image) {
                       existingUser.image = image;
                       await existingUser.save();
                    }
                    // Pass DB data to the user object
                    user.id = existingUser._id.toString();
                    user.role = existingUser.role;
                    // UPDATED: Pass phone data for social users
                    user.phone = existingUser.phone;
                    user.phoneVerified = existingUser.phoneVerified;
                } else {
                    // Create new user
                    const newUser = new User({ 
                        name, 
                        email, 
                        image, 
                        emailVerified: new Date(), 
                        role: 'customer',
                        phone: null,
                        phoneVerified: null
                    });
                    const savedUser = await newUser.save();
                    user.id = savedUser._id.toString();
                    user.role = savedUser.role;
                    // UPDATED: Pass nulls for new users
                    user.phone = null;
                    user.phoneVerified = null;
                }
                return true; 
            } catch (error) {
                console.error("Social Sign In DB Error:", error);
                return false;
            }
        }
        return true;
    },
    
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role as 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
        // UPDATED: Add phone data to token
        token.phone = user.phone;
        token.phoneVerified = user.phoneVerified;
      }

      // Support for updating session data client-side (e.g. after phone verification)
      if (trigger === "update" && session) {
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.phoneVerified !== undefined) token.phoneVerified = session.phoneVerified;
      }

      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
        // UPDATED: Pass data from token to session
        session.user.phone = token.phone as string | null;
        session.user.phoneVerified = token.phoneVerified as Date | boolean | null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);