// ============================================
// LinkTravel Type Definitions
// ============================================

export interface Coordinates {
  lat: number | null;
  lng: number | null;
}

export interface LocationDetails {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  district?: string;
  formattedAddress?: string;
  placeId?: string;
  mapUrl?: string;
  timezone?: string;
  coordinates?: Coordinates;
}

export type SupportedLocale = 'mk' | 'shq' | 'en';

export type CatalogTranslations<TFields extends object> = Partial<Record<SupportedLocale, TFields>>;

export interface DestinationTranslationFields {
  name?: string;
  shortDescription?: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
}

export interface HotelTranslationFields {
  name?: string;
  shortDescription?: string;
  description?: string;
  cancellation?: string;
  children?: string;
  pets?: string;
}

export interface PackageTranslationFields {
  name?: string;
  description?: string;
  includes?: string[];
  itineraryHighlights?: string[];
}

// Destination Types
export interface Destination {
  id: string;
  name: string;
  country: string;
  countryCode?: string;
  region?: string;
  city?: string;
  district?: string;
  formattedAddress?: string;
  placeId?: string;
  mapUrl?: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  featured: boolean;
  publishStatus?: 'draft' | 'published';
  tags: string[];
  highlights?: string[];
  translations?: CatalogTranslations<DestinationTranslationFields>;
  coordinates: Coordinates;
  location?: LocationDetails;
  climate: string;
  bestTimeToVisit: string;
  language: string;
  timezone: string;
  hotels?: Hotel[];
  packages?: TravelPackage[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

// Hotel Types
export interface Hotel {
  id: string;
  name: string;
  destinationId: string;
  destination?: Destination;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stars: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  address: string;
  countryCode?: string;
  region?: string;
  city?: string;
  district?: string;
  formattedAddress?: string;
  placeId?: string;
  mapUrl?: string;
  coordinates: Coordinates;
  location?: LocationDetails;
  roomTypes: RoomType[];
  featured: boolean;
  publishStatus?: 'draft' | 'published';
  policies: HotelPolicies;
  translations?: CatalogTranslations<HotelTranslationFields>;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  hotelId?: string;
  hotelName?: string;
  name: string;
  description: string;
  maxGuests: number;
  bedType: string;
  size: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface HotelPolicies {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  children: string;
  pets: string;
}

// Package Types
export interface TravelPackage {
  id: string;
  destinationId: string;
  hotelId?: string | null;
  name: string;
  description: string;
  duration: string;
  groupSize: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images?: string[];
  includes: string[];
  itineraryHighlights?: string[];
  translations?: CatalogTranslations<PackageTranslationFields>;
  category: string;
  meetingPoint?: string;
  meetingCoordinates?: Coordinates;
  meetingMapUrl?: string;
  featured: boolean;
  publishStatus?: 'draft' | 'published';
  rating: number;
  reviewCount: number;
  maxGuests?: number;
  destinationName?: string;
  destination?: Destination;
  hotel?: Hotel;
  reviews?: Review[];
  createdAt?: string;
}

// Booking Types
export interface Reservation {
  id?: string;
  bookingReference?: string;
  hotelId?: string | null;
  roomTypeId?: string | null;
  packageId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  hotel?: Hotel;
  roomType?: RoomType;
  package?: TravelPackage;
  createdAt?: string;
}

export interface ReservationFormData {
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
}

// User Types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  role?: UserRole;
  createdAt: string;
}

// Admin Dashboard Types
export interface DashboardStats {
  stats: {
    total_users: number;
    total_destinations: number;
    total_hotels: number;
    total_packages: number;
    total_reservations: number;
    pending_reservations: number;
    total_revenue: number;
    pending_reviews: number;
    unread_contacts: number;
  };
  recentReservations: AdminReservation[];
  revenueByMonth: { year: number; month: number; revenue: number; count: number }[];
  popularDestinations: Destination[];
}

export interface AdminReservation {
  id: string;
  userId: string;
  hotelId?: string | null;
  roomTypeId?: string | null;
  packageId?: string | null;
  fullName: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  user?: User;
  hotel?: Hotel;
  roomType?: RoomType;
  package?: TravelPackage;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  approved: boolean;
  reviewableType?: string;
  reviewableId?: string;
  reviewableName?: string;
  user?: User;
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string | null;
  message: string;
  read: boolean;
  createdAt?: string;
}

export interface AdminListParams {
  search?: string;
  page?: number;
  per_page?: number;
  status?: string;
  role?: string;
  hotel_id?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface SearchFilters {
  destination: string;
  destinationId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  amenities?: string[];
}

export interface SearchResults {
  destinations: Destination[];
  hotels: Hotel[];
  packages: TravelPackage[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface DestinationFilters {
  search?: string;
  country?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  tags?: string[];
  sortBy?: 'name' | 'price' | 'rating' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export interface HotelFilters {
  destinationId?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  stars?: number;
  amenities?: string[];
  sortBy?: 'name' | 'price' | 'rating' | 'stars';
  sortOrder?: 'asc' | 'desc';
}
