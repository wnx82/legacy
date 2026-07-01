import type { Metadata } from 'next';
import { DemoRequestForm } from '../../components/DemoRequestForm';

export const metadata: Metadata = {
  title: 'Demander une démo',
  description: 'Découvrez le portail professionnel Legacy pour les pompes funèbres.',
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Demander une démo professionnelle</h1>
      <p className="mt-4 text-gray-600">
        Nous vous présentons le portail Legacy Pro : gestion des dossiers décès, invitation des familles,
        checklist de formalités, personnalisation à votre image.
      </p>
      <div className="mt-8">
        <DemoRequestForm />
      </div>
    </div>
  );
}
