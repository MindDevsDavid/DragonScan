// app/layout.tsx - Ejemplo básico
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mi Sitio de Manhwa',
  description: 'Un sitio para leer mis manhwas personales',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Barra de navegación común */}
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <Link href="/" style={{ marginRight: '1rem' }}>Inicio</Link>
          <Link href="/about" style={{ marginRight: '1rem' }}>Acerca de</Link>
          <Link href="/admin" style={{ marginRight: '1rem' }}>Admin</Link>
          <span style={{ float: 'right' }}>
            {/* Esto se convertirá en el botón de login/logout */}
            <Link href="/login">Iniciar Sesión</Link>
          </span>
        </nav>
        {/* Aquí se inyecta el contenido de cada página (page.tsx) */}
        <main style={{ padding: '2rem' }}>{children}</main>
      </body>
    </html>
  );
}