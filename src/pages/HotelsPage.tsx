import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HotelCard, HotelFilters } from '@/components/hotels';
import type { HotelFilters as FiltersType } from '@/types';
import { useGetHotelsQuery } from '@/store/linktravelApi';

export default function HotelsPage() {
  const [searchParams] = useSearchParams();
  const destinationFilter = searchParams.get('destination');

  const [filters, setFilters] = useState<FiltersType>({
    destinationId: destinationFilter || undefined,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      destinationId: destinationFilter || undefined,
    }));
  }, [destinationFilter]);

  const { data, isLoading } = useGetHotelsQuery({
    destination_id: filters.destinationId,
    search: filters.search || undefined,
    min_price: filters.priceMin,
    max_price: filters.priceMax,
    rating: filters.rating,
    star_rating: filters.stars,
    amenities: filters.amenities,
    sort_by:
      filters.sortBy === 'price'
        ? filters.sortOrder === 'asc'
          ? 'price_asc'
          : 'price_desc'
        : 'rating',
  });

  const hotels = data?.items ?? [];

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
              Find Your Perfect Stay
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From boutique retreats to luxury resorts, discover handpicked accommodations 
              that promise comfort, style, and unforgettable experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HotelFilters
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={hotels.length}
          />
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="py-8 pb-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-muted h-96" />
              ))}
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                No hotels found matching your criteria.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
