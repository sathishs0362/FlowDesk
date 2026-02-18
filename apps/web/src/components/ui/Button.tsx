import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClassMap: Record<Variant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger: 'btn btn-danger',
};

export const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      {...props}
      className={`${variantClassMap[variant]} ${fullWidth ? 'btn-block' : ''} ${className}`.trim()}
    >
      {children}
    </button>
  );
};
