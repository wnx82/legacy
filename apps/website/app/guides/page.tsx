import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '../../lib/content/guides';

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Des guides pratiques pour préparer ses informations et accompagner ses proches.',
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">Guides pratiques</h1>
      <p className="mt-4 text-gray-600">
        Des ressources claires pour préparer ses informations et accompagner ses proches, avant et après un décès.
      </p>

      <div className="mt-10 space-y-6">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block rounded-lg border border-gray-200 p-5 hover:border-sage/60"
          >
            <p className="font-medium text-midnight">{guide.title}</p>
            <p className="mt-2 text-sm text-gray-600">{guide.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
