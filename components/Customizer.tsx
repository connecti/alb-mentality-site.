'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Produit } from '@/lib/config';
import { DESIGNS_PREDEFINIS, SUPPLEMENT_PERSONNALISATION_EUROS } from '@/lib/config';
import { ajouterAuPanier } from '@/lib/panier-client';

type ModeElement = 'design' | 'texte';

const COULEURS_HEX: Record<string, string> = {
  Noir: '#141414',
  Blanc: '#f2f2f0',
  'Gris chiné': '#8b8983',
  Bordeaux: '#5c1a1e',
};

export default function Customizer({ produit }: { produit: Produit }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [taille, setTaille] = useState(produit.tailles?.[0] ?? '');
  const [couleur, setCouleur] = useState(produit.couleursDisponibles?.[0] ?? 'Noir');
  const [mode, setMode] = useState<ModeElement>('design');
  const [designId, setDesignId] = useState(DESIGNS_PREDEFINIS[0]?.id ?? '');
  const [texte, setTexte] = useState('');
  const [couleurTexte, setCouleurTexte] = useState('#f2f2f0');

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoUrlValidee, setPhotoUrlValidee] = useState<string | null>(null);
  const [verification, setVerification] = useState<'inactive' | 'en_cours' | 'ok' | 'refuse'>('inactive');
  const [messageVerification, setMessageVerification] = useState('');

  const [enCoursAjout, setEnCoursAjout] = useState(false);
  const router = useRouter();

  // Dessine l'aperçu en direct : le vêtement (couleur choisie) + le design/texte
  // + la photo si elle a été validée.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COULEURS_HEX[couleur] ?? '#141414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Silhouette simplifiée du vêtement pour situer la zone d'impression
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    if (mode === 'design' && designId) {
      const design = DESIGNS_PREDEFINIS.find((d) => d.id === designId);
      ctx.fillStyle = couleur === 'Blanc' ? '#161513' : '#f2f2f0';
      ctx.font = "bold 30px Arial";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(design?.nom.toUpperCase() ?? '', canvas.width / 2, canvas.height / 2 - 20);
    }

    if (mode === 'texte' && texte) {
      ctx.fillStyle = couleurTexte;
      ctx.font = "bold 32px Arial";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      wrapText(ctx, texte, canvas.width / 2, canvas.height / 2 - 20, canvas.width - 100, 36);
    }

    if (photoDataUrl) {
      const img = new Image();
      img.onload = () => {
        const taille = 140;
        ctx.drawImage(img, canvas.width / 2 - taille / 2, canvas.height / 2 + 30, taille, taille);
      };
      img.src = photoDataUrl;
    }
  }, [couleur, mode, designId, texte, couleurTexte, photoDataUrl]);

  function surFichierChoisi(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    if (fichier.size > 12 * 1024 * 1024) {
      setVerification('refuse');
      setMessageVerification('Fichier trop lourd (12 Mo max).');
      return;
    }

    const lecteur = new FileReader();
    lecteur.onload = async () => {
      const dataUrl = lecteur.result as string;
      setPhotoDataUrl(dataUrl);
      setPhotoUrlValidee(null);
      setVerification('en_cours');
      setMessageVerification('Vérification de la photo en cours (contenu et droits d\'auteur)…');

      const res = await fetch('/api/upload-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();

      if (data.ok) {
        setPhotoUrlValidee(data.url);
        setVerification('ok');
        setMessageVerification('Photo validée.');
      } else {
        setPhotoUrlValidee(null);
        setVerification('refuse');
        setMessageVerification(data.error ?? "Cette photo n'a pas pu être validée.");
      }
    };
    lecteur.readAsDataURL(fichier);
  }

  const peutAjouter =
    (mode === 'design' ? Boolean(designId) : Boolean(texte.trim())) &&
    (!photoDataUrl || verification === 'ok') &&
    (!produit.tailles || Boolean(taille));

  function ajouter() {
    if (!peutAjouter) return;
    setEnCoursAjout(true);

    const apercuDataUrl = canvasRef.current?.toDataURL('image/png');

    ajouterAuPanier({
      slug: produit.slug,
      nom: `${produit.nom} — personnalisé`,
      prix: produit.prixVenteEuros + SUPPLEMENT_PERSONNALISATION_EUROS,
      taille: taille || undefined,
      quantite: 1,
      personnalisation: {
        designId: mode === 'design' ? designId : undefined,
        texte: mode === 'texte' ? texte : undefined,
        couleurTexte: mode === 'texte' ? couleurTexte : undefined,
        photoUrl: photoUrlValidee ?? undefined,
        couleurVetement: couleur,
        apercuDataUrl,
      },
    });

    router.push('/panier');
  }

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <div>
        <canvas
          ref={canvasRef}
          width={400}
          height={480}
          className="w-full rounded-lg border border-white/10"
        />
        <p className="mt-2 text-center text-xs text-white/40">Aperçu — le rendu final peut varier légèrement à l'impression.</p>
      </div>

      <div className="space-y-6">
        {produit.couleursDisponibles && (
          <div>
            <p className="mb-2 text-sm text-white/70">Couleur du vêtement</p>
            <div className="flex gap-2">
              {produit.couleursDisponibles.map((c) => (
                <button
                  key={c}
                  onClick={() => setCouleur(c)}
                  className={`h-9 w-9 rounded-full border-2 ${couleur === c ? 'border-alb-red' : 'border-white/20'}`}
                  style={{ backgroundColor: COULEURS_HEX[c] }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        {produit.tailles && (
          <div>
            <p className="mb-2 text-sm text-white/70">Taille</p>
            <div className="flex gap-2">
              {produit.tailles.map((t) => (
                <button
                  key={t}
                  onClick={() => setTaille(t)}
                  className={`rounded-md border px-3 py-2 text-sm ${taille === t ? 'border-alb-red bg-alb-red/10' : 'border-white/20'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm text-white/70">Ce qui s'imprime devant</p>
          <div className="mb-3 flex gap-2 text-sm">
            <button
              onClick={() => setMode('design')}
              className={`rounded-md border px-3 py-2 ${mode === 'design' ? 'border-alb-red bg-alb-red/10' : 'border-white/20'}`}
            >
              Un design ALB
            </button>
            <button
              onClick={() => setMode('texte')}
              className={`rounded-md border px-3 py-2 ${mode === 'texte' ? 'border-alb-red bg-alb-red/10' : 'border-white/20'}`}
            >
              Mon propre texte
            </button>
          </div>

          {mode === 'design' && (
            <div className="grid grid-cols-3 gap-2">
              {DESIGNS_PREDEFINIS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDesignId(d.id)}
                  className={`rounded-md border p-3 text-xs ${designId === d.id ? 'border-alb-red bg-alb-red/10' : 'border-white/20'}`}
                >
                  {d.nom}
                </button>
              ))}
            </div>
          )}

          {mode === 'texte' && (
            <div className="space-y-2">
              <input
                value={texte}
                onChange={(e) => setTexte(e.target.value.slice(0, 40))}
                placeholder="Ton texte (40 caractères max)"
                className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Couleur du texte</span>
                <input type="color" value={couleurTexte} onChange={(e) => setCouleurTexte(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm text-white/70">Ajouter une photo (facultatif)</p>
          <input type="file" accept="image/*" onChange={surFichierChoisi} className="text-sm" />
          {verification !== 'inactive' && (
            <p className={`mt-2 text-xs ${verification === 'refuse' ? 'text-alb-red' : 'text-white/60'}`}>
              {messageVerification}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-alb-gray p-4 text-sm">
          <div className="flex justify-between">
            <span>Prix de base</span>
            <span>{produit.prixVenteEuros} €</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Personnalisation</span>
            <span>+{SUPPLEMENT_PERSONNALISATION_EUROS} €</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-semibold">
            <span>Total</span>
            <span>{produit.prixVenteEuros + SUPPLEMENT_PERSONNALISATION_EUROS} €</span>
          </div>
        </div>

        <button onClick={ajouter} disabled={!peutAjouter || enCoursAjout} className="btn-primary w-full disabled:opacity-40">
          Ajouter mon design au panier
        </button>

        <p className="text-xs text-white/40">
          Article personnalisé : non soumis au droit de rétractation de 14 jours (article L221-28 du Code de la
          consommation). Vérifié automatiquement avant impression.
        </p>
      </div>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, largeurMax: number, hauteurLigne: number) {
  const mots = texte.split(' ');
  let ligne = '';
  const lignes: string[] = [];

  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeurMax && ligne) {
      lignes.push(ligne);
      ligne = mot;
    } else {
      ligne = essai;
    }
  }
  lignes.push(ligne);

  const depart = y - ((lignes.length - 1) * hauteurLigne) / 2;
  lignes.forEach((l, i) => ctx.fillText(l, x, depart + i * hauteurLigne));
}
