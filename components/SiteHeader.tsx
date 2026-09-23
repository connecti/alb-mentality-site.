import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-alb-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-lg uppercase tracking-widest text-white">
          ALB <span className="text-alb-red">Mentality</span>
        </Link>
        <nav className="hidden gap-6 text-sm uppercase tracking-wide md:flex">
          <Link href="/produits" className="hover:text-alb-red">Boutique</Link>
          <Link href="/histoire" className="hover:text-alb-red">L'histoire</Link>
          <Link href="/faq" className="hover:text-alb-red">FAQ</Link>
        </nav>
        <Link href="/panier" className="btn-secondary !px-4 !py-2 text-xs">
          Panier
        </Link>
      </div>
    </header>
  );
}
