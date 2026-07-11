import PDFDocument from 'pdfkit';

const MIDNIGHT = '#0B1E3D';
const SAGE = '#7C9885';
const GRAY = '#4B5563';

export interface PdfSection {
  heading: string;
  /** Chaque entrée est une ligne "clé: valeur" ou un simple paragraphe. */
  lines: string[];
}

export interface PdfDocumentInput {
  title: string;
  subtitle?: string;
  /** Avertissement légal affiché en pied de première page. */
  disclaimer: string;
  generatedAt: Date;
  sections: PdfSection[];
}

/**
 * Rendu HTML->PDF volontairement remplacé par un rendu vectoriel direct
 * (pdfkit) : pas de navigateur headless à embarquer dans l'image Docker, un
 * rendu déterministe et testable en mémoire. Renvoie un Buffer complet.
 */
export function renderPdf(input: PdfDocumentInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: input.title } });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // En-tête
    doc.fillColor(MIDNIGHT).fontSize(22).text('Legacy', { continued: false });
    doc.moveDown(0.2);
    doc.fillColor(MIDNIGHT).fontSize(18).text(input.title);
    if (input.subtitle) {
      doc.moveDown(0.1);
      doc.fillColor(GRAY).fontSize(12).text(input.subtitle);
    }
    doc.moveDown(0.3);
    doc
      .fillColor(GRAY)
      .fontSize(9)
      .text(`Généré le ${input.generatedAt.toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' })}`);

    // Filet de séparation
    doc.moveDown(0.5);
    doc.strokeColor(SAGE).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    // Sections
    for (const section of input.sections) {
      if (doc.y > 720) doc.addPage();
      doc.fillColor(MIDNIGHT).fontSize(14).text(section.heading);
      doc.moveDown(0.3);
      if (section.lines.length === 0) {
        doc.fillColor(GRAY).fontSize(10).text('— Aucune information renseignée.');
      } else {
        for (const line of section.lines) {
          if (doc.y > 760) doc.addPage();
          doc.fillColor(GRAY).fontSize(10).text(line, { indent: 8 });
        }
      }
      doc.moveDown(0.8);
    }

    // Avertissement légal
    if (doc.y > 700) doc.addPage();
    doc.moveDown(0.5);
    doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.4);
    doc.fillColor('#9CA3AF').fontSize(8).text(input.disclaimer, { align: 'left' });

    doc.end();
  });
}
