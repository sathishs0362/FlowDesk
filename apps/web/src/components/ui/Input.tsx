import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, id, className = '', ...props }: InputProps) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <input id={inputId} className={`input ${className}`.trim()} {...props} />
    </label>
  );
};
