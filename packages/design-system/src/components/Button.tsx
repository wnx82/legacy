import * as React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-midnight text-white hover:bg-midnight/90 focus-visible:ring-midnight',
  secondary: 'bg-sage text-white hover:bg-sage/90 focus-visible:ring-sage',
  ghost: 'bg-transparent text-midnight border border-midnight/20 hover:bg-midnight/5',
  danger: 'bg-alert text-white hover:bg-alert/90 focus-visible:ring-alert',
};

/** Gros boutons, contrastés, jamais agressifs — voir docs/product.md (ton non anxiogène). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'lg' ? 'px-6 py-3.5 text-lg' : 'px-4 py-2.5 text-base',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
