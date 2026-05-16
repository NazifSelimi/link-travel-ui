import { useEffect, useMemo, useState } from 'react';
import { Alert, AutoComplete, Typography } from 'antd';
import { searchCities } from '@/lib/locationSearch';
import type { LocationDetails } from '@/types';

const { Text } = Typography;

interface CityOption {
  value: string;
  label: React.ReactNode;
  plainLabel: string;
  location: LocationDetails;
}

interface CitySelectProps {
  countryCode?: string;
  value?: string;
  onSelect: (location: LocationDetails) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CitySelect({
  countryCode,
  value,
  onSelect,
  placeholder = 'Search city',
  disabled = false,
}: CitySelectProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<CityOption[]>([]);
  const [searchValue, setSearchValue] = useState(value ?? '');

  useEffect(() => {
    setSearchValue(value ?? '');
  }, [value]);

  useEffect(() => {
    setOptions([]);
    setSearchValue(value ?? '');
  }, [countryCode, value]);

  const helperText = useMemo(() => {
    if (!countryCode) {
      return 'Choose a country first, then search for a city in that country.';
    }

    return 'Type to search cities using free OpenStreetMap data.';
  }, [countryCode]);

  useEffect(() => {
    if (!countryCode || !searchValue.trim()) {
      setOptions([]);
      setStatus('idle');
      setError(null);
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      setStatus('loading');
      setError(null);

      try {
        const results = await searchCities(searchValue, countryCode);
        if (cancelled) {
          return;
        }

        setOptions(
          results.map((result) => ({
            ...result,
            plainLabel: result.label,
            label: (
              <div
                style={{
                  whiteSpace: 'normal',
                  lineHeight: 1.4,
                  paddingRight: 8,
                }}
                title={result.label}
              >
                {result.label}
              </div>
            ),
          })),
        );
        setStatus('ready');
      } catch (searchError) {
        if (cancelled) {
          return;
        }

        setOptions([]);
        setStatus('error');
        setError((searchError as Error).message || 'Unable to search cities right now.');
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [countryCode, searchValue]);

  const handleSelect = (_value: string, option: CityOption) => {
    const location = option.location;
    setSearchValue(location.city || option.plainLabel);
    setOptions([]);
    onSelect(location);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">City</label>
      <AutoComplete
        value={searchValue || undefined}
        placeholder={placeholder}
        disabled={disabled || !countryCode}
        onSearch={setSearchValue}
        onChange={setSearchValue}
        onSelect={handleSelect}
        options={options}
        popupMatchSelectWidth={false}
        styles={{
          popup: {
            root: {
              minWidth: 360,
              maxWidth: 560,
            },
          },
        }}
        notFoundContent={countryCode ? 'No matching cities' : 'Select a country first'}
      />
      <div className="mt-2">
        {(status === 'idle' || status === 'ready' || status === 'loading') && (
          <Text type="secondary">{status === 'loading' ? 'Searching cities...' : helperText}</Text>
        )}
        {status === 'error' && (
          <Alert
            title="City search is temporarily unavailable"
            description={error ?? 'You can still type the city manually below.'}
            type="warning"
            showIcon
          />
        )}
      </div>
    </div>
  );
}
