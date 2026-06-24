'use client';

import React, { useState } from 'react';

interface InlineToggleProps {
  id: string;
  field: string;
  currentValue: boolean;
  apiPath: string;
  labelTrue: string;
  labelFalse: string;
  colorTrue?: string;
  colorFalse?: string;
}

export function InlineToggle({
  id,
  field,
  currentValue,
  apiPath,
  labelTrue,
  labelFalse,
  colorTrue = 'text-accent-emerald',
  colorFalse = 'text-accent-rose',
}: InlineToggleProps) {
  const [value, setValue] = useState(currentValue);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !value }),
      });
      if (!res.ok) throw new Error('Failed');
      setValue(!value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-40 ${value ? colorTrue : colorFalse}`}
    >
      {loading ? '...' : value ? labelTrue : labelFalse}
    </button>
  );
}
