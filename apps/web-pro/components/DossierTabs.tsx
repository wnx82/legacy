'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function DossierTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const tabs = [
    { label: 'Aperçu', href: `/dossiers/${id}` },
    { label: 'Checklist', href: `/dossiers/${id}/checklist` },
    { label: 'Documents', href: `/dossiers/${id}/documents` },
    { label: 'Famille', href: `/dossiers/${id}/famille` },
    { label: 'Notes internes', href: `/dossiers/${id}/notes` },
  ];

  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={clsx(
            'border-b-2 px-4 py-3 text-sm font-medium',
            pathname === tab.href ? 'border-sage text-midnight' : 'border-transparent text-gray-500 hover:text-midnight',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
