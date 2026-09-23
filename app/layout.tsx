import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CookieBanner from '@/components/CookieBanner';
import TraqueurVisite from '@/components/TraqueurVisite';

export const metadata: Metadata = {
  title: 'ALB Mentality — Rejoins le défi',
  description:
    "La boutique officielle ALB Mentality. Vêtements et outils pour ceux qui avancent, jour après jour.",
  openGraph: {
    title: 'ALB Mentality',
    description: "Rejoins le défi. Jour après jour.",
    images: ['/images/og/accueil.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-body">
        <Suspense fallback={null}>
          <TraqueurVisite />
        </Suspense>
        <SiteHeader />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
