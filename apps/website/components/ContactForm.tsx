'use client';

import { useState } from 'react';
import { Button, Alert } from '@legacy/design-system';
import { postJson } from '../lib/api';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const inputClassName = 'w-full rounded-md border border-gray-300 p-3';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    const form = new FormData(event.currentTarget);
    try {
      await postJson('/contact', {
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        email: form.get('email'),
        subject: form.get('subject'),
        message: form.get('message'),
        website: form.get('website'),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <Alert tone="success" title="Message envoyé">
        Merci, nous revenons vers vous rapidement.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="contact-form-help">
      {/* Pot de miel anti-spam : masqué et non focusable, ne doit jamais être rempli. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p id="contact-form-help" className="text-sm text-gray-500">
        Tous les champs sont obligatoires, sauf mention contraire.
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
        <span className="text-sm font-medium text-midnight">E-mail</span>
        <input name="email" type="email" required autoComplete="email" placeholder="E-mail" className={inputClassName} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-midnight">Sujet</span>
        <input name="subject" required placeholder="Sujet" className={inputClassName} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-midnight">Votre message</span>
        <textarea name="message" required rows={5} placeholder="Votre message" className={inputClassName} />
      </label>
      {status === 'error' && (
        <Alert tone="danger" title="Une erreur est survenue" role="alert">
          Merci de réessayer dans quelques instants.
        </Alert>
      )}
      <Button type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
        {status === 'submitting' ? 'Envoi…' : 'Envoyer'}
      </Button>
    </form>
  );
}
