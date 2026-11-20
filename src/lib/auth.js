import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
          include: { profileSettings: true },
        });
        const valid = user && (await bcrypt.compare(credentials.password, user.password));
        if (!valid) throw new Error('Email atau password salah');

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.profileSettings?.role ?? 'estimator',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role ?? 'estimator';
      }
      return session;
    },
  },
};

/**
 * Pengguna yang sedang login, atau null.
 * Role dibaca ulang dari database supaya perubahan role langsung berlaku.
 * @returns {Promise<{ id: bigint, name: string, email: string, role: 'admin'|'estimator', isAdmin: boolean } | null>}
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: BigInt(session.user.id) },
    select: { id: true, name: true, email: true, profileSettings: { select: { role: true } } },
  });
  if (!user) return null;

  const role = user.profileSettings?.role ?? 'estimator';
  return { id: user.id, name: user.name, email: user.email, role, isAdmin: role === 'admin' };
}

/** Untuk server component halaman: wajib login, kalau tidak → /login. */
export async function requirePageUser({ admin = false } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (admin && !user.isAdmin) notFound();
  return user;
}
