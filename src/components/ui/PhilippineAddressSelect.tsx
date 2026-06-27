'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { PROVINCES } from '@/data/provinces';
import type { ProvinceItem } from '@/data/provinces';

interface CityItem {
  id: string;
  name: string;
  isCity: boolean;
  provinceId: string;
}

interface BarangayItem {
  id: string;
  name: string;
  cityId: string;
}

interface PhilippineAddressSelectProps {
  province?: string;
  city?: string;
  barangay?: string;
  onChange: (data: { province: string; city: string; barangay: string }) => void;
  streetSlot?: React.ReactNode;
}

type FieldState = 'idle' | 'loading' | 'error' | 'open';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function PhilippineAddressSelect({
  province: initialProvince,
  city: initialCity,
  barangay: initialBarangay,
  onChange,
  streetSlot,
}: PhilippineAddressSelectProps) {
  const [selectedProvince, setSelectedProvince] = useState<ProvinceItem | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityItem | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<BarangayItem | null>(null);

  const [provinceInput, setProvinceInput] = useState(initialProvince || '');
  const [cityInput, setCityInput] = useState('');
  const [barangayInput, setBarangayInput] = useState('');

  const [provinceSuggestions, setProvinceSuggestions] = useState<ProvinceItem[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<CityItem[]>([]);
  const [barangaySuggestions, setBarangaySuggestions] = useState<BarangayItem[]>([]);

  const [provinceState, setProvinceState] = useState<FieldState>('idle');
  const [cityState, setCityState] = useState<FieldState>('idle');
  const [barangayState, setBarangayState] = useState<FieldState>('idle');

  const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showBarangaySuggestions, setShowBarangaySuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedProvince = useDebounce(provinceInput, 300);
  const debouncedCity = useDebounce(cityInput, 300);
  const debouncedBarangay = useDebounce(barangayInput, 300);

  // Initialize from props on mount only
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (initialProvince) {
      setProvinceInput(initialProvince);
      const found = PROVINCES.find((p) => p.name.toLowerCase() === initialProvince.toLowerCase());
      if (found) {
        setSelectedProvince(found);
      }
    }
    if (initialCity) setCityInput(initialCity);
    if (initialBarangay) setBarangayInput(initialBarangay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter provinces client-side on debounced input
  useEffect(() => {
    if (!debouncedProvince || selectedProvince || !provinceInput.trim()) return;
    const q = debouncedProvince.toLowerCase();
    const filtered = PROVINCES.filter((p) => p.name.toLowerCase().includes(q));
    setProvinceSuggestions(filtered);
    setShowProvinceSuggestions(true);
    setProvinceState(filtered.length > 0 ? 'open' : 'idle');
  }, [debouncedProvince, selectedProvince, provinceInput]);

  // Fetch cities on debounced input
  useEffect(() => {
    if (!debouncedCity || !selectedProvince || selectedCity || !cityInput.trim()) return;

    setCityState('loading');
    const params = new URLSearchParams({
      provinceId: selectedProvince.id,
      search: debouncedCity,
    });
    fetch(`/api/data/cities?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((json) => {
        setCitySuggestions(json.data);
        setShowCitySuggestions(true);
        setCityState(json.data.length > 0 ? 'open' : 'idle');
      })
      .catch(() => setCityState('error'));
  }, [debouncedCity, selectedProvince, selectedCity, cityInput]);

  // Fetch barangays on debounced input
  useEffect(() => {
    if (!debouncedBarangay || !selectedCity || selectedBarangay || !barangayInput.trim()) return;

    setBarangayState('loading');
    const params = new URLSearchParams({
      cityId: selectedCity.id,
      search: debouncedBarangay,
    });
    fetch(`/api/data/barangays?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((json) => {
        setBarangaySuggestions(json.data);
        setShowBarangaySuggestions(true);
        setBarangayState(json.data.length > 0 ? 'open' : 'idle');
      })
      .catch(() => setBarangayState('error'));
  }, [debouncedBarangay, selectedCity, selectedBarangay, barangayInput]);

  // Click outside to close all suggestion lists
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowProvinceSuggestions(false);
        setShowCitySuggestions(false);
        setShowBarangaySuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset city & barangay when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setSelectedCity(null);
      setSelectedBarangay(null);
      setCityInput('');
      setBarangayInput('');
      setCitySuggestions([]);
      setBarangaySuggestions([]);
    }
  }, [selectedProvince]);

  // Reset barangay when city changes
  useEffect(() => {
    if (!selectedCity) {
      setSelectedBarangay(null);
      setBarangayInput('');
      setBarangaySuggestions([]);
    }
  }, [selectedCity]);

  // --- Province handlers ---

  const selectProvince = (province: ProvinceItem) => {
    setSelectedProvince(province);
    setProvinceInput(province.name);
    setShowProvinceSuggestions(false);
    setProvinceState('idle');
    setSelectedCity(null);
    setSelectedBarangay(null);
    setCityInput('');
    setBarangayInput('');
    onChange({ province: province.name, city: '', barangay: '' });
  };

  const clearProvince = () => {
    setSelectedProvince(null);
    setProvinceInput('');
    setShowProvinceSuggestions(false);
    setProvinceState('idle');
    onChange({ province: '', city: '', barangay: '' });
  };

  // --- City handlers ---

  const selectCity = (city: CityItem) => {
    setSelectedCity(city);
    setCityInput(city.name);
    setShowCitySuggestions(false);
    setCityState('idle');
    setSelectedBarangay(null);
    setBarangayInput('');
    onChange({ province: selectedProvince!.name, city: city.name, barangay: '' });
  };

  const clearCity = () => {
    setSelectedCity(null);
    setCityInput('');
    setShowCitySuggestions(false);
    setCityState('idle');
    if (selectedProvince) {
      onChange({ province: selectedProvince.name, city: '', barangay: '' });
    }
  };

  // --- Barangay handlers ---

  const selectBarangay = (barangay: BarangayItem) => {
    setSelectedBarangay(barangay);
    setBarangayInput(barangay.name);
    setShowBarangaySuggestions(false);
    setBarangayState('idle');
    onChange({
      province: selectedProvince!.name,
      city: selectedCity!.name,
      barangay: barangay.name,
    });
  };

  const clearBarangay = () => {
    setSelectedBarangay(null);
    setBarangayInput('');
    setShowBarangaySuggestions(false);
    setBarangayState('idle');
    if (selectedProvince && selectedCity) {
      onChange({ province: selectedProvince.name, city: selectedCity.name, barangay: '' });
    }
  };

  // --- Retry handlers ---

  const retryCities = () => {
    if (!selectedProvince) return;
    setCityState('loading');
    const params = new URLSearchParams({
      provinceId: selectedProvince.id,
      search: cityInput,
    });
    fetch(`/api/data/cities?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((json) => {
        setCitySuggestions(json.data);
        setShowCitySuggestions(true);
        setCityState(json.data.length > 0 ? 'open' : 'idle');
      })
      .catch(() => setCityState('error'));
  };

  const retryBarangays = () => {
    if (!selectedCity) return;
    setBarangayState('loading');
    const params = new URLSearchParams({
      cityId: selectedCity.id,
      search: barangayInput,
    });
    fetch(`/api/data/barangays?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((json) => {
        setBarangaySuggestions(json.data);
        setShowBarangaySuggestions(true);
        setBarangayState(json.data.length > 0 ? 'open' : 'idle');
      })
      .catch(() => setBarangayState('error'));
  };

  const inputClass =
    'appearance-none block w-full pl-9 pr-9 py-1.5 border border-foreground-950/10 dark:border-white/10 rounded-lg bg-background-100 dark:bg-background-800 text-foreground-950 dark:text-white placeholder:text-foreground-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed';

  function renderSuggestions<T extends { id: string; name: string }>({
    items,
    state,
    onSelect,
    onRetry,
    loading,
  }: {
    items: T[];
    state: FieldState;
    onSelect: (item: T) => void;
    onRetry: () => void;
    loading: boolean;
  }) {
    if (state === 'error') {
      return (
        <div className="px-3 py-2 text-sm text-rose-500 dark:text-rose-400 flex items-center justify-between">
          <span>Failed to load</span>
          <button
            type="button"
            onClick={onRetry}
            className="text-accent-500 hover:underline ml-2 shrink-0"
          >
            Retry
          </button>
        </div>
      );
    }

    if (loading || state === 'loading') {
      return (
        <div className="px-3 py-2 text-sm text-foreground-400 dark:text-white/40 flex items-center gap-2">
          <Spinner className="w-3.5 h-3.5" color="text-accent-500" />
          <span>Loading...</span>
        </div>
      );
    }

    if (items.length === 0) {
      return <div className="px-3 py-2 text-sm text-foreground-400 dark:text-white/40">No results found</div>;
    }

    return items.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item)}
        className="w-full text-left px-3 py-2 text-sm text-foreground-950 dark:text-white hover:bg-foreground-950/5 dark:hover:bg-background-700 transition-colors"
      >
        {item.name}
      </button>
    ));
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Province + City row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-400 dark:text-white/40 pointer-events-none" />
            <input
              type="text"
              value={provinceInput}
              onChange={(e) => {
                setProvinceInput(e.target.value);
                setSelectedProvince(null);
              }}
              onFocus={() => {
                if (provinceInput && !selectedProvince) {
                  setShowProvinceSuggestions(true);
                }
              }}
              placeholder="Province"
              className={inputClass}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              {provinceState === 'loading' && (
                <Spinner className="w-3.5 h-3.5" color="text-accent-500" />
              )}
              {selectedProvince && provinceState !== 'loading' && (
                <button
                  type="button"
                  onClick={clearProvince}
                  className="text-foreground-400 dark:text-white/40 hover:text-foreground-800 dark:hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {showProvinceSuggestions && !selectedProvince && (
            <div className="absolute z-50 mt-1 w-full bg-background-50 dark:bg-background-800 border border-foreground-950/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {renderSuggestions({
                items: provinceSuggestions,
                state: provinceState,
                onSelect: selectProvince,
                onRetry: () => setProvinceState('idle'),
                loading: false,
              })}
            </div>
          )}
        </div>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-400 dark:text-white/40 pointer-events-none" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setSelectedCity(null);
              }}
              onFocus={() => {
                if (cityInput && !selectedCity && selectedProvince) {
                  setShowCitySuggestions(true);
                }
              }}
              placeholder="City / Municipality"
              disabled={!selectedProvince}
              className={inputClass}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              {cityState === 'loading' && (
                <Spinner className="w-3.5 h-3.5" color="text-accent-500" />
              )}
              {selectedCity && cityState !== 'loading' && (
                <button
                  type="button"
                  onClick={clearCity}
                  className="text-foreground-400 dark:text-white/40 hover:text-foreground-800 dark:hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {showCitySuggestions && !selectedCity && selectedProvince && (
            <div className="absolute z-50 mt-1 w-full bg-background-50 dark:bg-background-800 border border-foreground-950/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {renderSuggestions({
                items: citySuggestions,
                state: cityState,
                onSelect: selectCity,
                onRetry: retryCities,
                loading: false,
              })}
            </div>
          )}
        </div>
      </div>

      {/* Barangay + Street row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-400 dark:text-white/40 pointer-events-none" />
            <input
              type="text"
              value={barangayInput}
              onChange={(e) => {
                setBarangayInput(e.target.value);
                setSelectedBarangay(null);
              }}
              onFocus={() => {
                if (barangayInput && !selectedBarangay && selectedCity) {
                  setShowBarangaySuggestions(true);
                }
              }}
              placeholder="Barangay"
              disabled={!selectedCity}
              className={inputClass}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              {barangayState === 'loading' && (
                <Spinner className="w-3.5 h-3.5" color="text-accent-500" />
              )}
              {selectedBarangay && barangayState !== 'loading' && (
                <button
                  type="button"
                  onClick={clearBarangay}
                  className="text-foreground-400 dark:text-white/40 hover:text-foreground-800 dark:hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {showBarangaySuggestions && !selectedBarangay && selectedCity && (
            <div className="absolute z-50 mt-1 w-full bg-background-50 dark:bg-background-800 border border-foreground-950/10 dark:border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {renderSuggestions({
                items: barangaySuggestions,
                state: barangayState,
                onSelect: selectBarangay,
                onRetry: retryBarangays,
                loading: false,
              })}
            </div>
          )}
        </div>
        {streetSlot}
      </div>
    </div>
  );
}
