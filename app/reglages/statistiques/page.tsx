'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LigneStat {
  code: string;
  visites: number;
  ventes: number;
  montant: number;
  tauxConversion: number | null;
}

export default function StatistiquesPage() {
  const [connecte, setConnecte] = useState(false);
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [stats, setStats] = useState<{ parCode: LigneStat[]; visitesTotales: number; ventesTotales: number } | null>(null);
  const [supabaseConnecte, setSupabaseConnecte] = useState(true);

  async function charger() {
    const res = await fetch('/api/statistiques');
    if (res.ok) {
      const data = await res.json();
      setStats(data);
      setSupabaseConnecte(data.connecte);
      setConnecte(true);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motDePasse }),
    });
    if (res.ok) {
      await charger();
    } else {
      const data = await res.json();
      setErreur(data.error ?? 'Erreur de connexion');
    }
  }

  if (!connecte) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-display text-xl uppercase tracking-wide">Statistiques</h1>
        <p className="mt-2 text-sm text-white/60">Espace réservé aux fondateurs.</p>
        <form onSubmit={seConnecter} className="mt-6 space-y-3">
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="Mot de passe"
            className="w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-alb-red"
            required
          />
          {erreur && <p className="text-sm text-alb-red">{erreur}</p>}
          <button type="submit" className="btn-primary w-full">Entrer</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-wide">Statistiques</h1>
        <div className="flex gap-4 text-xs text-white/50">
          <Link href="/reglages" className="hover:text-white">Réglages</Link>
          <Link href="/reglages/commandes" className="hover:text-white">Commandes</Link>
        </div>
      </div>
      <p className="mt-2 text-sm text-white/60">
        Quelle vidéo amène du monde sur le site, et laquelle transforme vraiment en vente — sans outil externe à
        configurer. Ajoute <code className="text-white/80">?code=NOMDUCODE</code> au lien posté sous chaque vidéo
        (ex. <code className="text-white/80">tonsite.com?code=DROP1</code>) pour qu'il apparaisse ici.
      </p>

      {!supabaseConnecte && (
        <p className="mt-4 rounded-lg border border-alb-red/40 bg-alb-red/10 p-4 text-sm">
          Supabase n'est pas encore connecté — rien n'est encore enregistré.
        </p>
      )}

      {stats && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-xs uppercase text-white/50">Visites totales</p>
              <p className="mt-1 font-display text-2xl">{stats.visitesTotales}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-xs uppercase text-white/50">Ventes totales</p>
              <p className="mt-1 font-display text-2xl">{stats.ventesTotales}</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-white/50">
                  <th className="pb-2">Code vidéo</th>
                  <th className="pb-2">Visites</th>
                  <th className="pb-2">Ventes</th>
                  <th className="pb-2">Conversion</th>
                  <th className="pb-2">Montant</th>
                </tr>
              </thead>
              <tbody>
                {stats.parCode.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-white/40">Pas encore de données.</td></tr>
                )}
                {stats.parCode.map((l) => (
                  <tr key={l.code} className="border-b border-white/5">
                    <td className="py-2 font-semibold">{l.code}</td>
                    <td className="py-2">{l.visites}</td>
                    <td className="py-2">{l.ventes}</td>
                    <td className="py-2">{l.tauxConversion !== null ? `${l.tauxConversion}%` : '—'}</td>
                    <td className="py-2">{l.montant} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
