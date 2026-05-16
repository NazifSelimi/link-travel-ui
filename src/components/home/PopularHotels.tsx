import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HotelCard } from '@/components/hotels/HotelCard';
import { useGetFeaturedHotelsQuery } from '@/store/linktravelApi';

export function PopularHotels() {
  const { data: featuredHotels = [], isLoading } = useGetFeaturedHotelsQuery();

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Where to Stay
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Popular Hotels
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Handpicked accommodations offering exceptional comfort and service.
            </p>
          </div>
          <Link
            to="/hotels"
            className="self-start sm:self-auto inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
          >
            View All Hotels <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-muted h-96" />
              ))
            : featuredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
        </div>
      </div>
    </section>
  );
}
