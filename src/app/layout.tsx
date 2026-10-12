import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Virtual Learning Lab — Platform Website Laboratorium Virtual Interaktif',
  description:
    'Jelajahi ilmu pengetahuan melalui laboratorium virtual interaktif, eksperimen 2D & 3D, dan simulasi sains, matematika, astronomi, serta informatika.',
  keywords: [
    'laboratorium virtual',
    'virtual lab',
    'simulasi 3D',
    'tata surya',
    'subnetting',
    'matematika interaktif',
    'edtech',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
