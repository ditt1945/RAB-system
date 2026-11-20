import { withAuth } from 'next-auth/middleware';

// Halaman yang wajib login. API dicek sendiri di setiap route (balas 401).
export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/ahsp/:path*',
    '/profile/:path*',
    '/company-settings/:path*',
  ],
};
