import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Destination,
  Hotel,
  Reservation,
  Review,
  RoomType,
  TravelPackage,
  User,
} from '@/types';
import type { RootState } from '@/store';
import { getApiBaseUrl } from '@/api/baseUrl';
import { resolveMediaUrl, resolveMediaUrls } from '@/lib/media';
import {
  serializeDestinationPayload,
  serializeHotelPayload,
  serializePackagePayload,
} from '@/api/serializers';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type ListResult<T> = {
  items: T[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
};

type AuthPayload = {
  user: User;
  token: string;
};

type SearchParams = {
  search?: string;
  country?: string;
  destination_id?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  amenities?: string[];
  star_rating?: number;
  sort_by?: string;
  page?: number;
  per_page?: number;
  featured?: boolean;
};

type SearchResponse = {
  destinations: Destination[];
  hotels: Hotel[];
  packages: TravelPackage[];
};

type BookingPayload = {
  hotelId?: string | null;
  roomTypeId?: string | null;
  packageId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  notes?: string;
};

export type AdminListParams = {
  search?: string;
  page?: number;
  per_page?: number;
  status?: string;
  role?: string;
  hotel_id?: string;
};

const defaultImage = '/placeholder.svg';
const adminEmails = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS || 'admin@linktravel.com,admin@linktravel.mk,info@linktravel.mk')
    .split(',')
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean),
);

function normalizeImage(image?: string | null, images?: string[]) {
  const normalizedImage = resolveMediaUrl(image);
  if (normalizedImage) {
    return normalizedImage;
  }

  const normalizedImages = resolveMediaUrls(images);
  if (normalizedImages.length > 0) {
    return normalizedImages[0];
  }

  return defaultImage;
}

function mapRole(role: User['role'], email: string): User['role'] {
  if (role === 'admin' || role === 'user') {
    return role;
  }

  return adminEmails.has(email.toLowerCase()) ? 'admin' : 'user';
}

function mapUser(user?: User | null): User | undefined {
  if (!user) {
    return undefined;
  }

  return {
    ...user,
    id: String(user.id),
    firstName: user.firstName || 'Traveler',
    lastName: user.lastName || '',
    role: mapRole(user.role, user.email),
  };
}

function mapReview(review: Review): Review {
  return {
    ...review,
    id: String(review.id),
    userId: String(review.userId),
    user: mapUser(review.user),
  };
}

function mapRoomType(roomType: RoomType): RoomType {
  const images = resolveMediaUrls(roomType.images);

  return {
    ...roomType,
    id: String(roomType.id),
    hotelId: roomType.hotelId ? String(roomType.hotelId) : undefined,
    images: images.length ? images : [defaultImage],
  };
}

function mapDestination(destination: Destination): Destination {
  const image = normalizeImage(destination.image, destination.images);
  const images = resolveMediaUrls(destination.images);
  const normalizedImages = images.length ? images : [image];
  const description = destination.description ?? '';
  const shortDescription = destination.shortDescription || (description ? description.slice(0, 140) : 'Discover this destination with LinkTravel.');

  return {
    ...destination,
    id: String(destination.id),
    image,
    images: normalizedImages,
    description,
    shortDescription,
    priceFrom: destination.priceFrom ?? 0,
    tags: destination.tags ?? [],
    highlights: destination.highlights ?? [],
    coordinates: destination.coordinates ?? { lat: null, lng: null },
    location: destination.location ?? {
      country: destination.country,
      countryCode: destination.countryCode,
      region: destination.region,
      city: destination.city,
      district: destination.district,
      formattedAddress: destination.formattedAddress,
      placeId: destination.placeId,
      mapUrl: destination.mapUrl,
      coordinates: destination.coordinates ?? { lat: null, lng: null },
    },
    climate: destination.climate || 'Seasonal',
    bestTimeToVisit: destination.bestTimeToVisit || 'Year round',
    language: destination.language || 'English',
    timezone: destination.timezone || 'Local time',
    hotels: destination.hotels?.map(mapHotel),
    packages: destination.packages?.map(mapPackage),
    reviews: destination.reviews?.map(mapReview),
  };
}

function mapHotel(hotel: Hotel): Hotel {
  const image = normalizeImage(hotel.image, hotel.images);
  const images = resolveMediaUrls(hotel.images);
  const normalizedImages = images.length ? images : [image];
  const description = hotel.description ?? '';
  const shortDescription = hotel.shortDescription || (description ? description.slice(0, 140) : 'Comfortable stay curated by LinkTravel.');

  return {
    ...hotel,
    id: String(hotel.id),
    destinationId: String(hotel.destinationId),
    image,
    images: normalizedImages,
    description,
    shortDescription,
    amenities: hotel.amenities ?? [],
    coordinates: hotel.coordinates ?? { lat: null, lng: null },
    roomTypes: hotel.roomTypes?.map(mapRoomType) ?? [],
    policies: hotel.policies ?? {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Contact the property for cancellation terms.',
      children: 'Children are welcome.',
      pets: 'Please contact the hotel for pet policy.',
    },
    destination: hotel.destination ? mapDestination(hotel.destination) : undefined,
    reviews: hotel.reviews?.map(mapReview),
  };
}

function mapPackage(pkg: TravelPackage): TravelPackage {
  const image = normalizeImage(pkg.image, pkg.images);
  const images = resolveMediaUrls(pkg.images);
  const normalizedImages = images.length ? images : [image];
  const description = pkg.description ?? '';
  const category = pkg.category || (pkg.originalPrice ? 'Special Offer' : 'Featured');

  return {
    ...pkg,
    id: String(pkg.id),
    destinationId: String(pkg.destinationId),
    hotelId: pkg.hotelId ? String(pkg.hotelId) : null,
    image,
    images: normalizedImages,
    description,
    includes: pkg.includes ?? [],
    itineraryHighlights: pkg.itineraryHighlights ?? [],
    category,
    destination: pkg.destination ? mapDestination(pkg.destination) : undefined,
    hotel: pkg.hotel ? mapHotel(pkg.hotel) : undefined,
    reviews: pkg.reviews?.map(mapReview),
  };
}

// Admin mappers: minimal normalization (stringify id, resolve media URLs).
// Unlike the public mappers, these do NOT inject UI defaults — the admin must
// see the real stored state, including missing/empty fields.
function mapAdminDestination(destination: Destination): Destination {
  return {
    ...destination,
    id: String(destination.id),
    image: resolveMediaUrl(destination.image) ?? destination.image,
    images: resolveMediaUrls(destination.images),
  };
}

function mapAdminHotel(hotel: Hotel): Hotel {
  return {
    ...hotel,
    id: String(hotel.id),
    destinationId: hotel.destinationId ? String(hotel.destinationId) : hotel.destinationId,
    image: resolveMediaUrl(hotel.image) ?? hotel.image,
    images: resolveMediaUrls(hotel.images),
    destination: hotel.destination ? mapAdminDestination(hotel.destination) : undefined,
  };
}

function mapAdminRoomType(roomType: RoomType): RoomType {
  return {
    ...roomType,
    id: String(roomType.id),
    hotelId: roomType.hotelId ? String(roomType.hotelId) : roomType.hotelId,
    images: resolveMediaUrls(roomType.images),
  };
}

function serializeRoomTypePayload(input: Partial<RoomType>) {
  return {
    hotel_id: input.hotelId,
    name: input.name,
    description: input.description,
    max_guests: input.maxGuests,
    bed_type: input.bedType,
    size: input.size,
    price_per_night: input.pricePerNight,
    amenities: input.amenities,
    images: input.images,
    available: input.available,
  };
}

function mapAdminPackage(pkg: TravelPackage): TravelPackage {
  return {
    ...pkg,
    id: String(pkg.id),
    destinationId: pkg.destinationId ? String(pkg.destinationId) : pkg.destinationId,
    hotelId: pkg.hotelId ? String(pkg.hotelId) : pkg.hotelId,
    image: resolveMediaUrl(pkg.image) ?? pkg.image,
    images: pkg.images ? resolveMediaUrls(pkg.images) : pkg.images,
    destination: pkg.destination ? mapAdminDestination(pkg.destination) : undefined,
    hotel: pkg.hotel ? mapAdminHotel(pkg.hotel) : undefined,
  };
}

function mapReservation(reservation: Reservation): Reservation {
  return {
    ...reservation,
    id: reservation.id ? String(reservation.id) : undefined,
    hotelId: reservation.hotelId ? String(reservation.hotelId) : null,
    roomTypeId: reservation.roomTypeId ? String(reservation.roomTypeId) : null,
    packageId: reservation.packageId ? String(reservation.packageId) : null,
    hotel: reservation.hotel ? mapHotel(reservation.hotel) : undefined,
    roomType: reservation.roomType ? mapRoomType(reservation.roomType) : undefined,
    package: reservation.package ? mapPackage(reservation.package) : undefined,
  };
}

function mapCollection<TInput, TOutput>(
  response: ApiEnvelope<TInput[]>,
  mapper: (item: TInput) => TOutput,
): ListResult<TOutput> {
  const items = (response.data ?? []).map(mapper);
  const meta = response.meta;

  return {
    items,
    total: meta?.total ?? items.length,
    currentPage: meta?.page ?? 1,
    lastPage: meta?.totalPages ?? 1,
    perPage: meta?.pageSize ?? items.length,
  };
}

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token || localStorage.getItem('auth_token');

    headers.set('Accept', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const linktravelApi = createApi({
  reducerPath: 'linktravelApi',
  baseQuery,
  tagTypes: [
    'User',
    'Destinations',
    'Hotels',
    'Packages',
    'Reservations',
    'Reviews',
    'Admin.Destinations',
    'Admin.Hotels',
    'Admin.Packages',
    'Admin.RoomTypes',
  ],
  endpoints: (builder) => ({
    getDestinations: builder.query<ListResult<Destination>, SearchParams | void>({
      query: (params) => ({ url: '/destinations', params: params ?? {} }),
      transformResponse: (response: ApiEnvelope<Destination[]>) => mapCollection(response, mapDestination),
      providesTags: ['Destinations'],
    }),
    getFeaturedDestinations: builder.query<Destination[], void>({
      query: () => '/destinations/featured',
      transformResponse: (response: ApiEnvelope<Destination[]>) => response.data.map(mapDestination),
      providesTags: ['Destinations'],
    }),
    getDestination: builder.query<Destination, string>({
      query: (id) => `/destinations/${id}`,
      transformResponse: (response: ApiEnvelope<Destination>) => mapDestination(response.data),
      providesTags: (_result, _error, id) => [{ type: 'Destinations', id }],
    }),
    searchDestinations: builder.query<Destination[], string>({
      query: (query) => ({ url: '/search', params: { q: query } }),
      transformResponse: (response: ApiEnvelope<SearchResponse>) =>
        (response.data.destinations ?? []).map(mapDestination),
    }),
    getHotels: builder.query<ListResult<Hotel>, SearchParams | void>({
      query: (params) => ({ url: '/hotels', params: params ?? {} }),
      transformResponse: (response: ApiEnvelope<Hotel[]>) => mapCollection(response, mapHotel),
      providesTags: ['Hotels'],
    }),
    getFeaturedHotels: builder.query<Hotel[], void>({
      query: () => '/hotels/featured',
      transformResponse: (response: ApiEnvelope<Hotel[]>) => response.data.map(mapHotel),
      providesTags: ['Hotels'],
    }),
    getHotel: builder.query<Hotel, string>({
      query: (id) => `/hotels/${id}`,
      transformResponse: (response: ApiEnvelope<Hotel>) => mapHotel(response.data),
      providesTags: (_result, _error, id) => [{ type: 'Hotels', id }],
    }),
    getHotelsByDestination: builder.query<Hotel[], string>({
      query: (destinationId) => `/destinations/${destinationId}/hotels`,
      transformResponse: (response: ApiEnvelope<Hotel[]>) => response.data.map(mapHotel),
      providesTags: ['Hotels'],
    }),
    getPackages: builder.query<ListResult<TravelPackage>, SearchParams | void>({
      query: (params) => ({ url: '/packages', params: params ?? {} }),
      transformResponse: (response: ApiEnvelope<TravelPackage[]>) => mapCollection(response, mapPackage),
      providesTags: ['Packages'],
    }),
    getFeaturedPackages: builder.query<TravelPackage[], void>({
      query: () => '/packages/featured',
      transformResponse: (response: ApiEnvelope<TravelPackage[]>) => response.data.map(mapPackage),
      providesTags: ['Packages'],
    }),
    getDiscountedPackages: builder.query<TravelPackage[], void>({
      query: () => '/packages/featured',
      transformResponse: (response: ApiEnvelope<TravelPackage[]>) =>
        response.data
          .map(mapPackage)
          .filter((pkg) => pkg.originalPrice !== null || pkg.category.toLowerCase().includes('offer')),
      providesTags: ['Packages'],
    }),
    getPackage: builder.query<TravelPackage, string>({
      query: (id) => `/packages/${id}`,
      transformResponse: (response: ApiEnvelope<TravelPackage>) => mapPackage(response.data),
      providesTags: (_result, _error, id) => [{ type: 'Packages', id }],
    }),
    getFeaturedReviews: builder.query<Review[], void>({
      query: () => '/reviews/featured',
      transformResponse: (response: ApiEnvelope<Review[]>) => response.data.map(mapReview),
      providesTags: ['Reviews'],
    }),
    login: builder.mutation<{ user: User; token: string }, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: ApiEnvelope<AuthPayload>) => ({
        user: mapUser(response.data.user)!,
        token: response.data.token,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<
      { user: User; token: string },
      { firstName: string; lastName: string; email: string; password: string; confirmPassword: string; phone?: string }
    >({
      query: ({ firstName, lastName, confirmPassword, ...rest }) => ({
        url: '/auth/register',
        method: 'POST',
        body: {
          ...rest,
          firstName,
          lastName,
          confirmPassword,
        },
      }),
      transformResponse: (response: ApiEnvelope<AuthPayload>) => ({
        user: mapUser(response.data.user)!,
        token: response.data.token,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User', 'Reservations'],
    }),
    getUser: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiEnvelope<User>) => mapUser(response.data)!,
      providesTags: ['User'],
    }),
    createBooking: builder.mutation<Reservation, BookingPayload>({
      query: (body) => ({
        url: '/reservations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<Reservation>) => mapReservation(response.data),
      invalidatesTags: ['Reservations'],
    }),
    getBooking: builder.query<Reservation, string>({
      query: (id) => `/reservations/${id}`,
      transformResponse: (response: ApiEnvelope<Reservation>) => mapReservation(response.data),
      providesTags: (_result, _error, id) => [{ type: 'Reservations', id }],
    }),
    sendContact: builder.mutation<void, { name: string; email: string; subject: string; message: string; phone?: string }>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
    }),
    subscribeNewsletter: builder.mutation<void, string>({
      query: (email) => ({
        url: '/newsletter',
        method: 'POST',
        body: { email },
      }),
    }),

    // ── Admin · Destinations ───────────────────────────────────────────
    getAdminDestinations: builder.query<ListResult<Destination>, AdminListParams | void>({
      query: (params) => ({ url: '/admin/destinations', params: params ?? {} }),
      transformResponse: (response: ApiEnvelope<Destination[]>) =>
        mapCollection(response, mapAdminDestination),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Admin.Destinations' as const, id })),
              { type: 'Admin.Destinations' as const, id: 'LIST' },
            ]
          : [{ type: 'Admin.Destinations' as const, id: 'LIST' }],
    }),
    createAdminDestination: builder.mutation<Destination, Partial<Destination>>({
      query: (data) => ({
        url: '/admin/destinations',
        method: 'POST',
        body: serializeDestinationPayload(data),
      }),
      transformResponse: (response: ApiEnvelope<Destination>) => mapAdminDestination(response.data),
      invalidatesTags: [
        { type: 'Admin.Destinations', id: 'LIST' },
        'Destinations',
      ],
    }),
    updateAdminDestination: builder.mutation<Destination, { id: string; data: Partial<Destination> }>({
      query: ({ id, data }) => ({
        url: `/admin/destinations/${id}`,
        method: 'PUT',
        body: serializeDestinationPayload(data),
      }),
      transformResponse: (response: ApiEnvelope<Destination>) => mapAdminDestination(response.data),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admin.Destinations', id },
        { type: 'Admin.Destinations', id: 'LIST' },
        { type: 'Destinations', id },
        'Destinations',
      ],
    }),
    deleteAdminDestination: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/destinations/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Admin.Destinations', id },
        { type: 'Admin.Destinations', id: 'LIST' },
        { type: 'Destinations', id },
        'Destinations',
      ],
    }),

    // ── Admin · Hotels ─────────────────────────────────────────────────
    getAdminHotels: builder.query<ListResult<Hotel>, AdminListParams | void>({
      query: (params) => ({ url: '/admin/hotels', params: params ?? {} }),
      transformResponse: (response: ApiEnvelope<Hotel[]>) =>
        mapCollection(response, mapAdminHotel),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Admin.Hotels' as const, id })),
              { type: 'Admin.Hotels' as const, id: 'LIST' },
            ]
          : [{ type: 'Admin.Hotels' as const, id: 'LIST' }],
    }),
    createAdminHotel: builder.mutation<Hotel, Partial<Hotel>>({
      query: (data) => ({
        url: '/admin/hotels',
        method: 'POST',
        body: serializeHotelPayload(data),
      }),
      transformResponse: (response: ApiEnvelope<Hotel>) => mapAdminHotel(response.data),
      invalidatesTags: [
        { type: 'Admin.Hotels', id: 'LIST' },
        'Hotels',
      ],
    }),
    updateAdminHotel: builder.mutation<Hotel, { id: string; data: Partial<Hotel> }>({
      query: ({ id, data }) => ({
        url: `/admin/hotels/${id}`,
        method: 'PUT',
        body: serializeHotelPayload(data),
      }),
      transformResponse: (response: ApiEnvelope<Hotel>) => mapAdminHotel(response.data),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admin.Hotels', id },
        { type: 'Admin.Hotels', id: 'LIST' },
        { type: 'Hotels', id },
        'Hotels',
      ],
    }),
    deleteAdminHotel: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/hotels/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Admin.Hotels', id },
        { type: 'Admin.Hotels', id: 'LIST' },
        { type: 'Hotels', id },
        'Hotels',
      ],
    }),

    // ── Admin · Packages ───────────────────────────────────────────────
    getAdminPackages: builder.query<ListResult<TravelPackage>, AdminListParams | void>({
      query: (params) => ({ url: '/admin/packages', params: params ?? {} }),
      transformResponse: (response: ApiEnvelope<TravelPackage[]>) =>
        mapCollection(response, mapAdminPackage),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Admin.Packages' as const, id })),
              { type: 'Admin.Packages' as const, id: 'LIST' },
            ]
          : [{ type: 'Admin.Packages' as const, id: 'LIST' }],
    }),
    createAdminPackage: builder.mutation<TravelPackage, Partial<TravelPackage>>({
      query: (data) => ({
        url: '/admin/packages',
        method: 'POST',
        body: serializePackagePayload(data),
      }),
      transformResponse: (response: ApiEnvelope<TravelPackage>) => mapAdminPackage(response.data),
      invalidatesTags: [
        { type: 'Admin.Packages', id: 'LIST' },
        'Packages',
      ],
    }),
    updateAdminPackage: builder.mutation<TravelPackage, { id: string; data: Partial<TravelPackage> }>({
      query: ({ id, data }) => ({
        url: `/admin/packages/${id}`,
        method: 'PUT',
        body: serializePackagePayload(data),
      }),
      transformResponse: (response: ApiEnvelope<TravelPackage>) => mapAdminPackage(response.data),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admin.Packages', id },
        { type: 'Admin.Packages', id: 'LIST' },
        { type: 'Packages', id },
        'Packages',
      ],
    }),
    deleteAdminPackage: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/packages/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Admin.Packages', id },
        { type: 'Admin.Packages', id: 'LIST' },
        { type: 'Packages', id },
        'Packages',
      ],
    }),

    // ── Admin · Room Types ─────────────────────────────────────────────
    getAdminRoomTypes: builder.query<ListResult<RoomType>, AdminListParams | void>({
      query: (params) => ({ url: '/admin/room-types', params: params ?? {} }),
      transformResponse: (response: ApiEnvelope<RoomType[]>) =>
        mapCollection(response, mapAdminRoomType),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Admin.RoomTypes' as const, id })),
              { type: 'Admin.RoomTypes' as const, id: 'LIST' },
            ]
          : [{ type: 'Admin.RoomTypes' as const, id: 'LIST' }],
    }),
    createAdminRoomType: builder.mutation<RoomType, Partial<RoomType>>({
      query: (data) => ({
        url: '/admin/room-types',
        method: 'POST',
        body: serializeRoomTypePayload(data),
      }),
      transformResponse: (response: ApiEnvelope<RoomType>) => mapAdminRoomType(response.data),
      invalidatesTags: [
        { type: 'Admin.RoomTypes', id: 'LIST' },
        // A new room type can affect Hotel detail pages.
        'Hotels',
      ],
    }),
    updateAdminRoomType: builder.mutation<RoomType, { id: string; data: Partial<RoomType> }>({
      query: ({ id, data }) => ({
        url: `/admin/room-types/${id}`,
        method: 'PUT',
        body: serializeRoomTypePayload(data),
      }),
      transformResponse: (response: ApiEnvelope<RoomType>) => mapAdminRoomType(response.data),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admin.RoomTypes', id },
        { type: 'Admin.RoomTypes', id: 'LIST' },
        'Hotels',
      ],
    }),
    deleteAdminRoomType: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/room-types/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Admin.RoomTypes', id },
        { type: 'Admin.RoomTypes', id: 'LIST' },
        'Hotels',
      ],
    }),
  }),
});

export const {
  useGetDestinationsQuery,
  useGetFeaturedDestinationsQuery,
  useGetDestinationQuery,
  useSearchDestinationsQuery,
  useGetHotelsQuery,
  useGetFeaturedHotelsQuery,
  useGetHotelQuery,
  useGetHotelsByDestinationQuery,
  useGetPackagesQuery,
  useGetFeaturedPackagesQuery,
  useGetDiscountedPackagesQuery,
  useGetPackageQuery,
  useGetFeaturedReviewsQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetUserQuery,
  useCreateBookingMutation,
  useGetBookingQuery,
  useSendContactMutation,
  useSubscribeNewsletterMutation,
  // Admin · Destinations
  useGetAdminDestinationsQuery,
  useCreateAdminDestinationMutation,
  useUpdateAdminDestinationMutation,
  useDeleteAdminDestinationMutation,
  // Admin · Hotels
  useGetAdminHotelsQuery,
  useCreateAdminHotelMutation,
  useUpdateAdminHotelMutation,
  useDeleteAdminHotelMutation,
  // Admin · Packages
  useGetAdminPackagesQuery,
  useCreateAdminPackageMutation,
  useUpdateAdminPackageMutation,
  useDeleteAdminPackageMutation,
  // Admin · Room Types
  useGetAdminRoomTypesQuery,
  useCreateAdminRoomTypeMutation,
  useUpdateAdminRoomTypeMutation,
  useDeleteAdminRoomTypeMutation,
} = linktravelApi;
