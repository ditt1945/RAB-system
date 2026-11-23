import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hit, reset } from '@/lib/rate-limit';

// Dicek saat server production berjalan (bukan saat `next build`), supaya sesi tidak ditandatangani tanpa kunci
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build' && !process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET wajib diisi di .env untuk mode production');
}

// Hash palsu: dibandingkan saat email tidak terdaftar, supaya waktu respons sama
// dan orang tidak bisa menebak email mana yang terdaftar dari lamanya respons.
const DUMMY_HASH = '$2b$12$HrLbXngFI4pJgMspw4mVu.35JIOOn7NuLfyURNVZ2rkqygY3cRXV2';
const LOGIN_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export const authOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Kata sandi', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan kata sandi wajib diisi');
        }
        const email = credentials.email.trim().toLowerCase();
        const limitKey = `login:${email}`;
        if (!hit(limitKey, LOGIN_LIMIT)) {
          throw new Error('Terlalu banyak percobaan masuk. Coba lagi 15 menit lagi.');
        }

        const user = await prisma.user.findUnique({ where: { email }, include: { profileSettings: true } });
        const valid = await bcrypt.compare(credentials.password, user?.password ?? DUMMY_HASH);
        if (!user || !valid) throw new Error('Email atau kata sandi salah');
        reset(limitKey);

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
