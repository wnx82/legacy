'use client';

import { useState } from 'react';
import { Button, Alert } from '@legacy/design-system';
import { postJson } from '../lib/api';

export function DemoRequestForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const inputClassName = 'w-full rounded-md border border-gray-300 p-3';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    const form = new FormData(event.currentTarget);
    try {
      await postJson('/demo-request', {
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        email: form.get('email'),
        phone: form.get('phone') || undefined,
        organizationName: form.get('organizationName') || undefined,
        message: form.get('message') || undefined,
        website: form.get('website'),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <Alert tone="success" title="Demande envoyée">
        Merci ! Notre équipe vous contactera très prochainement pour organiser votre démo.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="demo-form-help">
      {/* Pot de miel anti-spam : masqué et non focusable, ne doit jamais être rempli. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p id="demo-form-help" className="text-sm text-gray-500">
        Les informations de contact sont utilisées uniquement pour organiser votre démonstration.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-midnight">Prénom</span>
          <input name="firstName" required autoComplete="given-name" placeholder="Prénom" className={inputClassName} />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-midnight">Nom</span>
          <input name="lastName" required autoComplete="family-name" placeholder="Nom" className={inputClassName} />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-midnight">E-mail professionnel</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="E-mail professionnel"
          className={inputClassName}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-midnight">Téléphone (optionnel)</span>
        <input name="phone" autoComplete="tel" placeholder="Téléphone (optionnel)" className={inputClassName} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-midnight">Nom de votre entreprise</span>
        <input name="organizationName" placeholder="Nom de votre entreprise" className={inputClassName} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-midnight">Votre besoin (optionnel)</span>
        <textarea name="message" rows={4} placeholder="Votre besoin (optionnel)" className={inputClassName} />
      </label>
      {status === 'error' && (
        <Alert tone="danger" title="Une erreur est survenue" role="alert">
          Merci de réessayer dans quelques instants.
        </Alert>
      )}
      <Button type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
        {status === 'submitting' ? 'Envoi…' : 'Demander une démo'}
      </Button>
    </form>
  );
}
