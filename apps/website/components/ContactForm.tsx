'use client';

import { useState } from 'react';
import { Button, Alert } from '@legacy/design-system';
import { postJson } from '../lib/api';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Pot de miel anti-spam : masqué et non focusable, ne doit jamais être rempli. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="firstName" required placeholder="Prénom" className="rounded-md border border-gray-300 p-3" />
        <input name="lastName" required placeholder="Nom" className="rounded-md border border-gray-300 p-3" />
      </div>
      <input name="email" type="email" required placeholder="E-mail" className="w-full rounded-md border border-gray-300 p-3" />
      <input name="subject" required placeholder="Sujet" className="w-full rounded-md border border-gray-300 p-3" />
      <textarea name="message" required rows={5} placeholder="Votre message" className="w-full rounded-md border border-gray-300 p-3" />
      {status === 'error' && (
        <Alert tone="danger" title="Une erreur est survenue">
          Merci de réessayer dans quelques instants.
        </Alert>
      )}
      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Envoi…' : 'Envoyer'}
      </Button>
    </form>
  );
}
