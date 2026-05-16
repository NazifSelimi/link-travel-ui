import type {
  DestinationFilters,
  HotelFilters,
} from '@/types';

type Primitive = string | number | boolean;
type QueryValue = Primitive | Primitive[] | undefined | null;
type QueryParams = Record<string, QueryValue>;

export interface PackageQueryFilters {
  category?: string;
  destinationId?: string;
  search?: string;
  featured?: boolean;
  rating?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

function compactParams(params: QueryParams): QueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== null && value !== '';
    }),
  );
}

export function buildDestinationQueryParams(filters: DestinationFilters): QueryParams {
  return compactParams({
    search: filters.search,
    country: filters.country,
    min_price: filters.priceMin,
    max_price: filters.priceMax,
    rating: filters.rating,
    tags: filters.tags,
    sort_by: filters.sortBy === 'popular' ? 'rating' : filters.sortBy === 'price' ? 'price_from' : filters.sortBy,
    sort_dir: filters.sortOrder,
  });
}

export function buildHotelQueryParams(filters: HotelFilters): QueryParams {
  return compactParams({
    destination_id: filters.destinationId,
    search: filters.search,
    min_price: filters.priceMin,
    max_price: filters.priceMax,
    rating: filters.rating,
    stars: filters.stars,
    amenities: filters.amenities,
    sort_by: filters.sortBy === 'price' ? 'price_per_night' : filters.sortBy,
    sort_dir: filters.sortOrder,
  });
}

export function buildPackageQueryParams(filters?: string | PackageQueryFilters): QueryParams {
  const normalizedFilters = typeof filters === 'string'
    ? { category: filters }
    : filters;

  return compactParams({
    category: normalizedFilters?.category && normalizedFilters.category !== 'all'
      ? normalizedFilters.category
      : undefined,
    destination_id: normalizedFilters?.destinationId,
    search: normalizedFilters?.search,
    featured: normalizedFilters?.featured,
    rating: normalizedFilters?.rating,
    sort_by: normalizedFilters?.sortBy,
    sort_dir: normalizedFilters?.sortOrder,
  });
}
