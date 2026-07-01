import * as React from 'react';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
}

/** Historique d'un dossier décès — présenté de façon factuelle et chronologique. */
export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative ml-3 border-l border-gray-200">
      {events.map((event) => (
        <li key={event.id} className="mb-6 ml-6">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-sage" aria-hidden="true" />
          <p className="text-sm font-medium text-midnight">{event.title}</p>
          <time className="text-xs text-gray-400">{event.date}</time>
          {event.description && <p className="mt-1 text-sm text-gray-500">{event.description}</p>}
        </li>
      ))}
    </ol>
  );
}
