import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Star, Calendar, Globe, Clock, CloudSun,
  ChevronLeft, ChevronRight, Heart, Share2, ArrowLeft,
} from 'lucide-react';
import { HotelCard } from '@/components/hotels/HotelCard';
import { MapEmbed } from '@/components/MapEmbed';
import { formatCurrency } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useGetDestinationQuery, useGetHotelsByDestinationQuery } from '@/store/linktravelApi';

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: destination, isLoading, isError } = useGetDestinationQuery(id ?? '', {
    skip: !id,
  });
  const { data: hotels = [], isLoading: hotelsLoading } = useGetHotelsByDestinationQuery(id ?? '', {
    skip: !id,
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-[60vh] bg-muted animate-pulse" />
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-8 w-1/3 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !destination) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">Destination not found</h1>
            <p className="mt-3 text-muted-foreground">
              The destination you requested could not be found.
            </p>
            <Link
              to="/destinations"
              className="mt-6 inline-flex items-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Destinations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = destination.images?.length > 0 ? destination.images : destination.image ? [destination.image] : ['/placeholder.svg'];
  const destinationTags = destination.tags ?? [];
  const destinationPackages = destination.packages ?? [];
  const coordinates = destination.coordinates ?? { lat: null, lng: null };
  const hasCoordinates = coordinates.lat !== null && coordinates.lng !== null;

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div>
      {/* Hero Image Gallery */}
      <section className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        <img
          src={galleryImages[activeImageIndex] || destination.image}
          alt={destination.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20" />

        {/* Navigation */}
        <div className="absolute top-24 left-4 sm:left-8">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/80 text-sm backdrop-blur-sm hover:bg-background transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Destinations
          </Link>
        </div>

        {/* Image Navigation */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    index === activeImageIndex ? 'w-8 bg-background' : 'w-2 bg-background/50',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="absolute top-24 right-4 sm:right-8 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart className={cn('h-5 w-5', isFavorite && 'fill-destructive text-destructive')} />
          </button>
          <button className="rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 text-background/80 mb-2">
              <MapPin className="h-4 w-4" />
              {destination.country}
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-background">
              {destination.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="text-background font-bold">{destination.rating}</span>
                <span className="text-background/70">({destination.reviewCount} reviews)</span>
              </div>
              <div className="flex gap-2">
                {destinationTags.map((tag) => (
                  <span key={tag} className="inline-block px-2.5 py-0.5 rounded-full bg-background/20 text-background text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                About {destination.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{destination.description}</p>

              {/* Quick Info */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Best Time to Visit</p>
                  <p className="text-sm font-medium text-foreground">{destination.bestTimeToVisit}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <CloudSun className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Climate</p>
                  <p className="text-sm font-medium text-foreground">{destination.climate}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <Globe className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="text-sm font-medium text-foreground">{destination.language}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <Clock className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Timezone</p>
                  <p className="text-sm font-medium text-foreground">{destination.timezone}</p>
                </div>
              </div>

              {/* Location */}
              <div className="mt-8">
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">Location</h3>
                <MapEmbed
                  title={`${destination.name}, ${destination.country}`}
                  subtitle={destination.formattedAddress || destination.shortDescription}
                  coordinates={coordinates}
                  mapUrl={destination.mapUrl}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="sticky top-24 space-y-6">
                {/* Price Card */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <p className="text-sm text-muted-foreground">Packages from</p>
                  <p className="text-4xl font-bold text-foreground">
                    {formatCurrency(destination.priceFrom, destination.currency)}
                    <span className="text-lg font-normal text-muted-foreground">/person</span>
                  </p>
                  <Link
                    to={`/packages?destination=${destination.id}`}
                    className="block w-full mt-4 px-4 py-3 rounded-md bg-primary text-center text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    View Packages
                  </Link>
                  <Link
                    to="/contact"
                    className="block w-full mt-2 px-4 py-3 rounded-md border border-border text-center text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.slice(0, 4).map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        'aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                        index === activeImageIndex ? 'border-primary' : 'border-transparent',
                      )}
                    >
                      <img src={img || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Where to Stay in {destination.name}
              </h2>
              <p className="mt-2 text-muted-foreground">
                Handpicked accommodations for your perfect getaway.
              </p>
            </div>
            <Link
              to={`/hotels?destination=${destination.id}`}
              className="inline-flex items-center px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              View All Hotels
            </Link>
          </div>
          {hotelsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} variant="horizontal" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Packages for {destination.name}
              </h2>
              <p className="mt-2 text-muted-foreground">
                Curated trips and bundled experiences available for this destination.
              </p>
            </div>
            <Link
              to={`/packages?destination=${destination.id}`}
              className="inline-flex items-center px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              View All Packages
            </Link>
          </div>

          {destinationPackages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {destinationPackages.slice(0, 3).map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/packages/${pkg.id}`}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={pkg.image || pkg.images?.[0] || '/placeholder.svg'}
                      alt={pkg.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{pkg.rating}</span>
                      <span>({pkg.reviewCount} reviews)</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{pkg.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{pkg.duration}</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(pkg.price, pkg.destination?.currency || destination.currency)}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">View package</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No packages are currently available for this destination.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
