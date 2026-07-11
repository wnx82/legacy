/**
 * Gabarits d'e-mails transactionnels. Volontairement en HTML inline simple
 * (compatibilité maximale des clients mail), sans dépendance de templating.
 */

const BRAND = '#0B1E3D';
const SAGE = '#7C9885';

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:${BRAND};padding:20px 28px">
          <span style="color:#fff;font-size:20px;font-weight:bold;letter-spacing:0.5px">Legacy</span>
        </td></tr>
        <tr><td style="padding:28px">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px">
          Legacy — Préparer l'après, accompagner ceux qu'on aime.<br>
          Cet e-mail vous est envoyé dans le cadre d'un dossier ouvert par un professionnel funéraire.
          Si vous n'êtes pas concerné·e, ignorez ce message.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(url: string, label: string): string {
  return `<a href="${escapeAttr(url)}" style="display:inline-block;background:${SAGE};color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold">${escapeHtml(label)}</a>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '%22').replace(/</g, '%3C').replace(/>/g, '%3E');
}

export interface FamilyInviteEmailInput {
  recipientName?: string | null;
  deceasedName: string;
  organizationName?: string | null;
  acceptUrl: string;
}

export function familyInviteEmail(input: FamilyInviteEmailInput): { subject: string; html: string } {
  const greeting = input.recipientName ? `Bonjour ${escapeHtml(input.recipientName)},` : 'Bonjour,';
  const orgLine = input.organizationName
    ? `${escapeHtml(input.organizationName)} vous accompagne`
    : 'Une pompe funèbre vous accompagne';
  const html = layout(
    'Vous avez accès au dossier',
    `<p style="font-size:15px;line-height:1.6">${greeting}</p>
     <p style="font-size:15px;line-height:1.6">
       ${orgLine} pour les démarches suivant le décès de
       <strong>${escapeHtml(input.deceasedName)}</strong>.
     </p>
     <p style="font-size:15px;line-height:1.6">
       Vous pouvez suivre les formalités, échanger des messages et transmettre les
       documents demandés depuis votre espace famille sécurisé.
     </p>
     <p style="margin:26px 0">${button(input.acceptUrl, 'Accéder au dossier')}</p>
     <p style="font-size:13px;color:#6b7280;line-height:1.6">
       Ce lien d'invitation est personnel et expire dans 14 jours. À la première
       ouverture, il vous sera demandé de créer un compte ou de vous connecter.
     </p>`,
  );
  return { subject: `Accès au dossier de ${input.deceasedName} — Legacy`, html };
}
