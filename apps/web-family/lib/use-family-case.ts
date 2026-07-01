'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'legacy_family_case_id';

/**
 * Le lien d'invitation envoyé par la pompe funèbre contient l'identifiant du
 * dossier décès (`?dossier=<id>`). On le mémorise en local pour que le proche
 * n'ait pas à le retrouver à chaque connexion — simplification assumée pour
 * le MVP (voir docs/roadmap.md pour un mécanisme de sélection multi-dossiers).
 */
export function useFamilyCaseId(): string | null {
  const searchParams = useSearchParams();
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get('dossier');
    if (fromUrl) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      setCaseId(fromUrl);
      return;
    }
    setCaseId(localStorage.getItem(STORAGE_KEY));
  }, [searchParams]);

  return caseId;
}
