import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, MapPin, Wifi, Car, Utensils, Waves, Dumbbell, Wine, Coffee, Tv, AirVent, Bath,
  ChevronLeft, ChevronRight, Users, BedDouble, Check, Heart, Share2, Calendar,
} from 'lucide-react';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import type { RoomType } from '@/types';
import { MapEmbed } from '@/components/MapEmbed';
import { formatCurrency } from '@/lib/money';
import { useGetHotelQuery } from '@/store/linktravelApi';

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi, parking: Car, restaurant: Utensils, pool: Waves, gym: Dumbbell,
  bar: Wine, breakfast: Coffee, tv: Tv, ac: AirVent, spa: Bath,
};

export default function HotelDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: hotel, isLoading, isError } = useGetHotelQuery(id ?? '', {
    skip: !id,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom] = useState<RoomType | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const galleryImages = hotel?.images?.length ? hotel.images : hotel?.image ? [hotel.image] : [];
  const roomTypes = hotel?.roomTypes ?? [];
  const hotelAmenities = hotel?.amenities ?? [];
  const coordinates = hotel?.coordinates ?? { lat: null, lng: null };
  const policies = hotel?.policies ?? {
    checkIn: t('detail.contactProperty'),
    checkOut: t('detail.contactProperty'),
    cancellation: t('detail.contactPropertyTerms'),
    children: t('detail.askProperty'),
    pets: t('detail.askProperty'),
  };
  const hotelLocation = hotel?.destination?.name
    ? `${hotel.destination.name}${hotel.destination.country ? `, ${hotel.destination.country}` : ''}`
    : hotel?.address || t('hotels.card.locationUnavailable');

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

  if (isError || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t('detail.hotelNotFound')}</h1>
          <p className="mt-2 text-muted-foreground">{t('detail.hotelNotFoundBody')}</p>
          <button onClick={() => navigate('/hotels')} className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">
            {t('detail.browseHotels')}
          </button>
        </div>
      </div>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  const handleBookRoom = (room: RoomType) => {
    navigate(`/booking?hotel=${hotel.id}&room=${room.id}`);
  };

  const tabItems = [
    {
      key: 'overview',
      label: t('detail.tabs.overview'),
      children: (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t('detail.aboutThisHotel')}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{hotel.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('detail.location')}</h3>
            <p className="mt-2 text-muted-foreground">{hotel.address || t('detail.addressUnavailable')}</p>
            <MapEmbed
              className="mt-4"
              title={hotelLocation}
              subtitle={hotel.formattedAddress || hotel.address}
              coordinates={coordinates}
              mapUrl={hotel.mapUrl}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'rooms',
      label: t('detail.tabs.rooms'),
      children: (
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">{t('detail.availableRooms')}</h2>
          <div className="space-y-4">
            {roomTypes.length > 0 ? roomTypes.map((room) => (
              <div
                key={room.id}
                className={`overflow-hidden rounded-xl border transition-all ${
                  selectedRoom?.id === room.id ? 'ring-2 ring-primary' : 'border-border'
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                    <img src={room.images?.[0] || '/placeholder.svg'} alt={room.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{room.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(room.pricePerNight, hotel.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">{t('detail.perNightShort')}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{t('detail.upToGuests', { count: room.maxGuests })}</span>
                      <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{room.bedType}</span>
                      <span>{room.size} m²</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(room.amenities ?? []).slice(0, 4).map((amenity) => (
                        <span key={amenity} className="inline-block px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">{amenity}</span>
                      ))}
                      {(room.amenities ?? []).length > 4 && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">{t('detail.moreCountSuffix', { count: (room.amenities ?? []).length - 4 })}</span>
                      )}
                    </div>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      {room.available ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium">{t('detail.available')}</span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{t('detail.soldOut')}</span>
                      )}
                      <button
                        onClick={() => handleBookRoom(room)}
                        disabled={!room.available}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {t('detail.bookNow')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                {t('detail.roomDetailsUnavailable')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'amenities',
      label: t('detail.tabs.amenities'),
      children: (
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">{t('detail.hotelAmenities')}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {hotelAmenities.length > 0 ? hotelAmenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || Check;
              return (
                <div key={amenity} className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <div className="rounded-full bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                  <span className="font-medium capitalize text-foreground">{amenity}</span>
                </div>
              );
            }) : (
              <div className="col-span-full rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                {t('detail.amenitiesUnavailable')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'policies',
      label: t('detail.tabs.policies'),
      children: (
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">{t('detail.hotelPolicies')}</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2"><Calendar className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-medium text-foreground">{t('detail.checkInOutTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('detail.checkInOutValue', { in: policies.checkIn, out: policies.checkOut })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2"><Check className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-medium text-foreground">{t('detail.cancellationPolicy')}</h3>
                <p className="text-sm text-muted-foreground">{policies.cancellation}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className={policies.pets ? 'text-emerald-600' : 'text-destructive'}>
                  {policies.pets ? '✓' : '✗'}
                </span>
                {t('detail.petsPolicy')}: {policies.pets}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={policies.children ? 'text-emerald-600' : 'text-muted-foreground'}>
                  {policies.children ? '✓' : '•'}
                </span>
                {t('detail.childrenPolicy')}: {policies.children || t('detail.askProperty')}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] bg-muted">
        <img
          src={galleryImages[currentImageIndex] || '/placeholder.svg'}
          alt={hotel.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Gallery Navigation */}
        {galleryImages.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background" aria-label={t('detail.previousImage')}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background" aria-label={t('detail.nextImage')}>
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {galleryImages.map((_, index) => (
            <button key={index} onClick={() => setCurrentImageIndex(index)} className={`h-2 w-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-primary' : 'bg-background/50'}`} aria-label={t('detail.goToImage', { index: index + 1 })} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setIsFavorite(!isFavorite)} className="rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors">
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
          </button>
          <button className="rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Back Button */}
        <Link to="/hotels" className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-background">
          <ChevronLeft className="h-4 w-4" />
          {t('detail.backToHotels')}
        </Link>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">{hotel.name}</h1>
              <div className="mt-2 flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {hotelLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {t('detail.reviewsLabel', { rating: hotel.rating, count: hotel.reviewCount })}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('detail.startingFrom')}</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(hotel.pricePerNight, hotel.currency)}
                  <span className="text-base font-normal text-muted-foreground">{t('hotels.card.perNight')}</span>
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium text-foreground">{hotel.rating}</span>
                  <span>({hotel.reviewCount} {t('common.review', { count: hotel.reviewCount })})</span>
                </div>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  {t('detail.viewRoomsPrices')}
                </button>
                <p className="text-center text-xs text-muted-foreground">{t('detail.finalTermsConfirmed')}</p>
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <h4 className="font-medium text-foreground mb-3">{t('detail.quickFacts')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{t('detail.facts.roomTypes', { count: roomTypes.length })}</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{t('detail.facts.amenitiesCount', { count: hotelAmenities.length })}</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{t('detail.facts.support')}</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{t('detail.facts.bestPrice')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
