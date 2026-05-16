import type { Coordinates } from '@/types';

type TimezoneApiResponse = {
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
};

type TimezoneDetails = {
  display: string;
  timezoneId?: string;
  abbreviation?: string;
};

function formatGmtOffset(offsetSeconds: number) {
  const totalMinutes = Math.round(offsetSeconds / 60);
  const sign = totalMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }

  return `GMT${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}

export async function fetchTimezoneForCoordinates(coordinates?: Coordinates): Promise<TimezoneDetails | null> {
  if (coordinates?.lat == null || coordinates?.lng == null) {
    return null;
  }

  const params = new URLSearchParams({
    latitude: String(coordinates.lat),
    longitude: String(coordinates.lng),
    current: 'temperature_2m',
    timezone: 'auto',
    forecast_days: '1',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Unable to resolve timezone');
  }

  const data = (await response.json()) as TimezoneApiResponse;
  if (typeof data.utc_offset_seconds !== 'number') {
    return null;
  }

  return {
    display: formatGmtOffset(data.utc_offset_seconds),
    timezoneId: data.timezone,
    abbreviation: data.timezone_abbreviation,
  };
}
