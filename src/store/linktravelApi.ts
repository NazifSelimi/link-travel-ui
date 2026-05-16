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
  tagTypes: ['User', 'Destinations', 'Hotels', 'Packages', 'Reservations', 'Reviews'],
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
} = linktravelApi;
