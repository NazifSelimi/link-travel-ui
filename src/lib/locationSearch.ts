import type { Coordinates, LocationDetails } from '@/types';

type NominatimAddress = {
  country?: string;
  country_code?: string;
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  city_district?: string;
  suburb?: string;
  neighbourhood?: string;
  hamlet?: string;
};

type NominatimResult = {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
};

export type LocationSearchOption = {
  value: string;
  label: string;
  location: LocationDetails;
};

function getCity(address?: NominatimAddress) {
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality
  );
}

function getDistrict(address?: NominatimAddress) {
  return address?.suburb || address?.neighbourhood || address?.hamlet;
}

function buildMapUrl(coordinates?: Coordinates) {
  if (coordinates?.lat == null || coordinates?.lng == null) {
    return undefined;
  }

  return `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=14/${coordinates.lat}/${coordinates.lng}`;
}

function mapNominatimResult(result: NominatimResult): LocationDetails {
  const coordinates: Coordinates = {
    lat: Number.isFinite(Number(result.lat)) ? Number(result.lat) : null,
    lng: Number.isFinite(Number(result.lon)) ? Number(result.lon) : null,
  };

  return {
    country: result.address?.country,
    countryCode: result.address?.country_code?.toUpperCase(),
    region: result.address?.state,
    city: getCity(result.address),
    district: getDistrict(result.address),
    formattedAddress: result.display_name,
    placeId: String(result.place_id),
    mapUrl: buildMapUrl(coordinates),
    coordinates,
  };
}

async function searchNominatim(
  query: string,
  {
    countryCode,
    limit = 8,
  }: {
    countryCode?: string;
    limit?: number;
  } = {},
): Promise<LocationSearchOption[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: countryCode ? `${trimmedQuery} ${countryCode}` : trimmedQuery,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(limit),
  });

  if (countryCode) {
    params.set('countrycodes', countryCode.toLowerCase());
  }

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Location lookup failed');
  }

  const results = (await response.json()) as NominatimResult[];

  return results.map((result) => {
    const location = mapNominatimResult(result);

    return {
      value: location.formattedAddress || result.display_name,
      label: location.formattedAddress || result.display_name,
      location,
    };
  });
}

export async function searchCities(query: string, countryCode?: string) {
  const results = await searchNominatim(query, { countryCode, limit: 20 });
  const seen = new Set<string>();

  return results
    .reduce<LocationSearchOption[]>((cityOptions, result) => {
      const location = result.location;
      const cityName = location.city?.trim();
      const region = location.region?.trim();
      const country = location.country?.trim();

      if (!cityName) {
        return cityOptions;
      }

      const formattedAddress = [cityName, region, country]
        .filter(Boolean)
        .join(', ');
      const label = formattedAddress || result.label;

      if (!label) {
        return cityOptions;
      }

      cityOptions.push({
        ...result,
        value: label,
        label,
        location: {
          ...location,
          city: cityName,
          district: undefined,
          formattedAddress: label,
        },
      });

      return cityOptions;
    }, [])
    .filter((result) => {
      const location = result.location;
      const cityName = location.city?.trim();
      const formattedAddress = location.formattedAddress?.trim();

      const matchesCountry = !countryCode || location.countryCode === countryCode.toUpperCase();

      if (!matchesCountry || !cityName || !formattedAddress) {
        return false;
      }

      const dedupeKey = `${location.countryCode}:${cityName.toLowerCase()}:${formattedAddress.toLowerCase()}`;
      if (seen.has(dedupeKey)) {
        return false;
      }

      seen.add(dedupeKey);

      return true;
    });
}

export async function searchLocations(query: string, countryCode?: string) {
  return searchNominatim(query, { countryCode, limit: 8 });
}
