import { renderPdf } from './pdf-renderer';

describe('renderPdf', () => {
  it('produit un Buffer PDF valide (signature %PDF)', async () => {
    const buffer = await renderPdf({
      title: 'Dossier vivant',
      subtitle: 'Jean Dupont',
      disclaimer: 'Legacy ne remplace pas un notaire.',
      generatedAt: new Date('2026-07-11T10:00:00Z'),
      sections: [
        { heading: 'Identité', lines: ['Titulaire : Jean Dupont'] },
        { heading: 'Volontés (0)', lines: [] },
      ],
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(500);
    // Signature d'en-tête d'un fichier PDF.
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    // Marqueur de fin de fichier PDF.
    expect(buffer.subarray(-6).toString('latin1')).toContain('EOF');
  });

  it('gère de nombreuses sections sans erreur (pagination)', async () => {
    const sections = Array.from({ length: 40 }, (_, i) => ({
      heading: `Section ${i}`,
      lines: Array.from({ length: 10 }, (_, j) => `Ligne ${i}.${j}`),
    }));
    const buffer = await renderPdf({
      title: 'Gros dossier',
      disclaimer: 'Avertissement.',
      generatedAt: new Date('2026-07-11T10:00:00Z'),
      sections,
    });
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
