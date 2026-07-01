import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Alert } from '@legacy/design-system';
import { GUIDES } from '../../../lib/content/guides';

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.excerpt };
}

export default function GuideArticlePage({ params }: { params: { slug: string } }) {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-midnight">{guide.title}</h1>
      <p className="mt-4 text-lg text-gray-600">{guide.excerpt}</p>

      {guide.requiresOfficialVerification && (
        <div className="mt-6">
          <Alert tone="warning" title="Formalités administratives">
            Les démarches et délais peuvent varier selon votre commune. Vérifiez toujours les informations
            officielles les plus récentes (SPF Intérieur, votre commune, ou un notaire).
          </Alert>
        </div>
      )}

      <div className="prose prose-neutral mt-8 max-w-none text-gray-700">
        {guide.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
