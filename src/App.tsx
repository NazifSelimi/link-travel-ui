import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReduxProvider } from '@/store/provider';
import { MainLayout } from '@/components/layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearSession, setUser } from '@/store/slices/authSlice';
import { linktravelApi, useGetUserQuery } from '@/store/linktravelApi';

// Public pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DestinationsPage = lazy(() => import('@/pages/DestinationsPage'));
const DestinationDetailPage = lazy(() => import('@/pages/DestinationDetailPage'));
const HotelsPage = lazy(() => import('@/pages/HotelsPage'));
const HotelDetailPage = lazy(() => import('@/pages/HotelDetailPage'));
const PackagesPage = lazy(() => import('@/pages/PackagesPage'));
const PackageDetailPage = lazy(() => import('@/pages/PackageDetailPage'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const BookingConfirmationPage = lazy(() => import('@/pages/BookingConfirmationPage'));
const TravelPolicyPage = lazy(() => import('@/pages/TravelPolicyPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Admin pages
const AdminLayout = lazy(() => import('@/components/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminDestinationsPage = lazy(() => import('@/pages/admin/AdminDestinationsPage'));
const AdminHotelsPage = lazy(() => import('@/pages/admin/AdminHotelsPage'));
const AdminRoomTypesPage = lazy(() => import('@/pages/admin/AdminRoomTypesPage'));
const AdminPackagesPage = lazy(() => import('@/pages/admin/AdminPackagesPage'));
const AdminReservationsPage = lazy(() => import('@/pages/admin/AdminReservationsPage'));
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'));
const AdminContactsPage = lazy(() => import('@/pages/admin/AdminContactsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

// Guards
import ProtectedRoute from '@/components/ProtectedRoute';

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function AppRoutes() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const { token } = useAppSelector((state) => state.auth);
  const { data: currentUser, error } = useGetUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (currentUser) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (token && error) {
      dispatch(clearSession());
    }
  }, [dispatch, error, token]);

  // When the user switches language, the public catalog cache is stale —
  // the served `name`/`description` overlays change. Invalidate just the
  // customer-facing tags; the Admin.* tags are unaffected because admin
  // endpoints pin X-Locale to 'en' regardless of UI locale.
  useEffect(() => {
    const onLanguageChange = () => {
      dispatch(
        linktravelApi.util.invalidateTags(['Destinations', 'Hotels', 'Packages', 'Reviews']),
      );
    };
    i18n.on('languageChanged', onLanguageChange);
    return () => {
      i18n.off('languageChanged', onLanguageChange);
    };
  }, [dispatch, i18n]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth pages (no MainLayout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:id" element={<DestinationDetailPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/packages/:id" element={<PackageDetailPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/travel-policy" element={<TravelPolicyPage />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="destinations" element={<AdminDestinationsPage />} />
            <Route path="hotels" element={<AdminHotelsPage />} />
            <Route path="room-types" element={<AdminRoomTypesPage />} />
            <Route path="packages" element={<AdminPackagesPage />} />
            <Route path="reservations" element={<AdminReservationsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ReduxProvider>
      <AppRoutes />
    </ReduxProvider>
  );
}
