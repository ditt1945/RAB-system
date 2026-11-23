'use client';

// Cadangan terakhir kalau layout utama ikut gagal. Harus punya <html> dan <body> sendiri.
export default function GlobalError({ reset }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020617', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ textAlign: 'center', padding: 16 }}>
          <h1 style={{ fontSize: 24 }}>Aplikasi mengalami kesalahan</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Muat ulang halaman. Jika masih terjadi, periksa server dan database.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: 0, background: '#06b6d4', color: '#020617', fontWeight: 600, cursor: 'pointer' }}>
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
