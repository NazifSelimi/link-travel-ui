import type {
  Destination,
  Hotel,
  Reservation,
  TravelPackage,
  User,
} from '@/types';

type DestinationInput = Partial<Destination> & {
  priceFrom?: number;
  shortDescription?: string;
  bestTimeToVisit?: string;
};

type HotelInput = Partial<Hotel> & {
  destinationId?: string;
  pricePerNight?: number;
  shortDescription?: string;
  checkIn?: string;
  checkOut?: string;
  cancellation?: string;
  children?: string;
  pets?: string;
};

type PackageInput = Partial<TravelPackage> & {
  destinationId?: string;
  groupSize?: string;
  originalPrice?: number | null;
};

type UserInput = Partial<User>;

export function serializeDestinationPayload(input: DestinationInput) {
  return {
    name: input.name,
    country: input.country,
    country_code: input.countryCode ?? input.location?.countryCode,
    region: input.region ?? input.location?.region,
    city: input.city ?? input.location?.city,
    district: input.district ?? input.location?.district,
    formatted_address: input.formattedAddress ?? input.location?.formattedAddress,
    place_id: input.placeId ?? input.location?.placeId,
    map_url: input.mapUrl ?? input.location?.mapUrl,
    description: input.description,
    short_description: input.shortDescription,
    image: input.image,
    images: input.images,
    rating: input.rating,
    price_from: input.priceFrom,
    currency: input.currency,
    featured: input.featured,
    publish_status: input.publishStatus,
    tags: input.tags,
    highlights: input.highlights,
    latitude: input.coordinates?.lat,
    longitude: input.coordinates?.lng,
    climate: input.climate,
    best_time_to_visit: input.bestTimeToVisit,
    language: input.language,
    timezone: input.timezone,
    translations: {
      mk: {
        name: input.translations?.mk?.name,
        short_description: input.translations?.mk?.shortDescription,
        description: input.translations?.mk?.description,
        tags: input.translations?.mk?.tags,
        highlights: input.translations?.mk?.highlights,
      },
      shq: {
        name: input.translations?.shq?.name,
        short_description: input.translations?.shq?.shortDescription,
        description: input.translations?.shq?.description,
        tags: input.translations?.shq?.tags,
        highlights: input.translations?.shq?.highlights,
      },
      en: {
        name: input.translations?.en?.name,
        short_description: input.translations?.en?.shortDescription,
        description: input.translations?.en?.description,
        tags: input.translations?.en?.tags,
        highlights: input.translations?.en?.highlights,
      },
    },
  };
}

export function serializeHotelPayload(input: HotelInput) {
  return {
    destination_id: input.destinationId,
    name: input.name,
    description: input.description,
    short_description: input.shortDescription,
    image: input.image,
    images: input.images,
    stars: input.stars,
    price_per_night: input.pricePerNight,
    currency: input.currency,
    amenities: input.amenities,
    address: input.address,
    country_code: input.countryCode ?? input.location?.countryCode,
    region: input.region ?? input.location?.region,
    city: input.city ?? input.location?.city,
    district: input.district ?? input.location?.district,
    formatted_address: input.formattedAddress ?? input.location?.formattedAddress,
    place_id: input.placeId ?? input.location?.placeId,
    map_url: input.mapUrl ?? input.location?.mapUrl,
    latitude: input.coordinates?.lat,
    longitude: input.coordinates?.lng,
    featured: input.featured,
    publish_status: input.publishStatus,
    check_in: input.checkIn ?? input.policies?.checkIn,
    check_out: input.checkOut ?? input.policies?.checkOut,
    cancellation_policy: input.cancellation ?? input.policies?.cancellation,
    children_policy: input.children ?? input.policies?.children,
    pets_policy: input.pets ?? input.policies?.pets,
    translations: {
      mk: {
        name: input.translations?.mk?.name,
        short_description: input.translations?.mk?.shortDescription,
        description: input.translations?.mk?.description,
        cancellation_policy: input.translations?.mk?.cancellation,
        children_policy: input.translations?.mk?.children,
        pets_policy: input.translations?.mk?.pets,
      },
      shq: {
        name: input.translations?.shq?.name,
        short_description: input.translations?.shq?.shortDescription,
        description: input.translations?.shq?.description,
        cancellation_policy: input.translations?.shq?.cancellation,
        children_policy: input.translations?.shq?.children,
        pets_policy: input.translations?.shq?.pets,
      },
      en: {
        name: input.translations?.en?.name,
        short_description: input.translations?.en?.shortDescription,
        description: input.translations?.en?.description,
        cancellation_policy: input.translations?.en?.cancellation,
        children_policy: input.translations?.en?.children,
        pets_policy: input.translations?.en?.pets,
      },
    },
  };
}

export function serializePackagePayload(input: PackageInput) {
  return {
    destination_id: input.destinationId,
    hotel_id: input.hotelId,
    name: input.name,
    description: input.description,
    duration: input.duration,
    group_size: input.groupSize,
    price: input.price,
    original_price: input.originalPrice,
    image: input.image,
    images: input.images,
    includes: input.includes,
    itinerary_highlights: input.itineraryHighlights,
    category: input.category,
    meeting_point: input.meetingPoint,
    meeting_latitude: input.meetingCoordinates?.lat,
    meeting_longitude: input.meetingCoordinates?.lng,
    meeting_map_url: input.meetingMapUrl,
    featured: input.featured,
    publish_status: input.publishStatus,
    translations: {
      mk: {
        name: input.translations?.mk?.name,
        description: input.translations?.mk?.description,
        includes: input.translations?.mk?.includes,
        itinerary_highlights: input.translations?.mk?.itineraryHighlights,
      },
      shq: {
        name: input.translations?.shq?.name,
        description: input.translations?.shq?.description,
        includes: input.translations?.shq?.includes,
        itinerary_highlights: input.translations?.shq?.itineraryHighlights,
      },
      en: {
        name: input.translations?.en?.name,
        description: input.translations?.en?.description,
        includes: input.translations?.en?.includes,
        itinerary_highlights: input.translations?.en?.itineraryHighlights,
      },
    },
  };
}

export function serializeUserPayload(input: UserInput) {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    role: input.role === 'admin' ? 1 : input.role === 'user' ? 0 : undefined,
  };
}

export function serializeReservationPayload(input: Omit<Reservation, 'id' | 'createdAt' | 'status'>) {
  return {
    hotel_id: input.hotelId,
    room_type_id: input.roomTypeId,
    package_id: input.packageId,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    check_in: input.checkIn,
    check_out: input.checkOut,
    guests: input.guests,
    notes: input.notes,
    total_price: input.totalPrice,
  };
}
