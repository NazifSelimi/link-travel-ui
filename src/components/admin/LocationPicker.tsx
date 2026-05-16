import { useEffect, useId, useState } from 'react';
import { Alert, AutoComplete, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { searchLocations } from '@/lib/locationSearch';
import type { LocationDetails } from '@/types';

const { Text } = Typography;

type LocationOption = {
  value: string;
  label: React.ReactNode;
  plainLabel: string;
  location: LocationDetails;
};

interface LocationPickerProps {
  label?: string;
  placeholder?: string;
  initialQuery?: string;
  onSelect: (location: LocationDetails) => void;
  placeTypes?: string[];
  countryRestriction?: string;
}

export function LocationPicker({
  label = 'Search location',
  placeholder = 'Search a place, city, or address',
  initialQuery,
  onSelect,
  countryRestriction,
}: LocationPickerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(initialQuery ?? '');
  const [options, setOptions] = useState<LocationOption[]>([]);
  const helperId = useId();

  useEffect(() => {
    setValue(initialQuery ?? '');
  }, [initialQuery]);

  useEffect(() => {
    if (!value.trim()) {
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
        const results = await searchLocations(value, countryRestriction);
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
        setError((searchError as Error).message || 'Unable to search locations right now.');
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [countryRestriction, value]);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <AutoComplete
        value={value || undefined}
        placeholder={placeholder}
        options={options}
        onSearch={setValue}
        onChange={setValue}
        onSelect={(_selectedValue, option) => {
          const selectedOption = option as LocationOption;
          const location = selectedOption.location;
          setValue(location.formattedAddress || selectedOption.plainLabel);
          setOptions([]);
          onSelect(location);
        }}
        popupMatchSelectWidth={false}
        styles={{
          popup: {
            root: {
              minWidth: 360,
              maxWidth: 560,
            },
          },
        }}
        notFoundContent="No matching places found"
        prefix={<EnvironmentOutlined />}
        aria-describedby={helperId}
      />
      <div id={helperId} className="mt-2">
        {(status === 'idle' || status === 'ready' || status === 'loading') && (
          <Text type="secondary">
            {status === 'loading'
              ? 'Searching locations...'
              : 'Select a suggestion to auto-fill address, city, map link, and coordinates from OpenStreetMap.'}
          </Text>
        )}
        {status === 'error' && (
          <Alert
            title="Location search is temporarily unavailable"
            description={error ?? 'You can still enter the address and map link manually.'}
            type="warning"
            showIcon
          />
        )}
      </div>
    </div>
  );
}
