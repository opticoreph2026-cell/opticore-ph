'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  showToggle?: boolean;
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  placeholder,
  required = false,
  showToggle = true,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="appearance-none block w-full px-3 py-2.5 pr-10 border border-foreground-950/10 rounded-lg bg-background-100/40 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-foreground-500"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground-500 hover:text-foreground-950 transition-colors"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
