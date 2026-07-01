import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fonctionnalités',
  description: 'Coffre-fort de documents, volontés, contacts, formalités guidées, espace famille et portail professionnel.',
};

const FEATURES = [
  { title: 'Coffre-fort de documents', description: 'Stockage chiffré, catégorisé, avec accès contrôlés et journalisés.' },
  { title: 'Volontés personnelles', description: 'Cérémonie, musiques, textes, messages aux proches — non légal, mais précieux.' },
  { title: 'Contacts importants', description: 'Médecin, notaire, banque, assureur, personnes à prévenir en priorité.' },
  { title: 'Formalités guidées', description: 'Une checklist claire et configurable pour la famille et le professionnel.' },
  { title: 'Espace famille', description: 'Suivi des démarches, envoi de documents, messages du professionnel.' },
  { title: 'Portail professionnel', description: 'Gestion des dossiers, collaborateurs, modèles de checklist et de messages.' },
  { title: 'Notifications', description: 'Rappels de documents manquants, de tâches, invitations, changements de statut.' },
  { title: 'Export PDF', description: 'Export du dossier vivant ou du dossier décès en un clic.' },
  { title: 'Personnes de confiance', description: "Désignez qui pourra accéder à vos informations, et dans quelles conditions." },
];

export default function FonctionnalitesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Fonctionnalités</h1>
      <p className="mt-4 max-w-2xl text-lg text-gray-600">
        Tout ce dont vous avez besoin pour préparer, transmettre et accompagner — sans complexité inutile.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-lg border border-gray-200 p-5">
            <p className="font-medium text-midnight">{f.title}</p>
            <p className="mt-2 text-sm text-gray-600">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
