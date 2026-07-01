import type { Metadata } from 'next';
import { ContactForm } from '../../components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question ? Contactez l’équipe Legacy.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Contactez-nous</h1>
      <p className="mt-4 text-gray-600">
        Une question sur Legacy, votre dossier, ou un partenariat avec une pompe funèbre ? Écrivez-nous.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
