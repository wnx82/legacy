import * as React from 'react';
import clsx from 'clsx';

export function Header({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={clsx('flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6', className)}
      {...props}
    />
  );
}

export function Footer({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={clsx('border-t border-gray-200 bg-beige px-6 py-8 text-sm text-gray-500', className)}
      {...props}
    />
  );
}

export interface SidebarItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
  return (
    <nav className="flex h-full w-64 flex-col gap-1 border-r border-gray-200 bg-white p-4">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={clsx(
            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
            item.active ? 'bg-sage-light text-sage' : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
