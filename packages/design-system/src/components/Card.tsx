import * as React from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-lg border border-gray-200 bg-white p-6 shadow-sm', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx('text-lg font-semibold text-midnight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx('mt-1 text-sm text-gray-500', className)} {...props} />;
}
