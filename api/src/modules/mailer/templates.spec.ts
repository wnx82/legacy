import { familyInviteEmail, escapeHtml } from './templates';

describe('mailer templates', () => {
  it('escapeHtml neutralise les balises', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('familyInviteEmail intègre le nom du défunt et le lien', () => {
    const { subject, html } = familyInviteEmail({
      recipientName: 'Marie Curie',
      deceasedName: 'Pierre Curie',
      organizationName: 'PF Exemple',
      acceptUrl: 'https://famille.example/invitation?token=abc123',
    });
    expect(subject).toContain('Pierre Curie');
    expect(html).toContain('Pierre Curie');
    expect(html).toContain('Marie Curie');
    expect(html).toContain('PF Exemple');
    expect(html).toContain('https://famille.example/invitation?token=abc123');
    expect(html).toContain('Accéder au dossier');
  });

  it("échappe le nom du défunt (anti-injection HTML)", () => {
    const { html } = familyInviteEmail({
      recipientName: null,
      deceasedName: '<b>Hack</b>',
      organizationName: null,
      acceptUrl: 'https://famille.example/invitation?token=x',
    });
    expect(html).toContain('&lt;b&gt;Hack&lt;/b&gt;');
    expect(html).not.toContain('<b>Hack</b>');
  });
});
