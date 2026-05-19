import { useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircle2, Calendar, MapPin, Users, Mail, Download, Printer, Home, Phone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetBookingQuery } from '@/store/linktravelApi';
import { agencyContact, travelPolicyPdfPath } from '@/lib/policy';

export default function BookingConfirmationPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id') || '';
  const { data: reservation, isLoading: loading } = useGetBookingQuery(bookingId, {
    skip: !bookingId,
  });
  const handlePrint = () => {
    window.print();
  };

  if (loading && !reservation) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">{t('bookingConfirmation.notFound')}</h1>
            <p className="mt-3 text-muted-foreground">
              {t('bookingConfirmation.notFoundBody')}
            </p>
            {bookingId && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('bookingConfirmation.reference')} <span className="font-medium text-foreground">{bookingId}</span>
              </p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('bookingConfirmation.returnHome')}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t('bookingConfirmation.contactSupport')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const booking = {
    id: reservation.bookingReference || reservation.id || bookingId,
    hotel: reservation.hotel,
    package: reservation.package,
    room: reservation.roomType,
    checkIn: new Date(reservation.checkIn),
    checkOut: new Date(reservation.checkOut),
    guests: reservation.guests,
    nights: Math.max(1, Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24))),
    guestName: reservation.fullName,
    email: reservation.email,
    total: reservation.totalPrice,
    status: reservation.status,
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">{t('bookingConfirmation.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('bookingConfirmation.subtitleBefore')}{' '}
            <span className="font-medium text-foreground">{booking.email}</span>
            {' '}{t('bookingConfirmation.subtitleAfter')}
          </p>
        </div>

        {/* Booking Reference */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('bookingConfirmation.bookingReferenceLabel')}</p>
          <p className="text-2xl font-bold text-primary tracking-wider">{booking.id}</p>
        </div>

        {/* Booking Details */}
        <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
          {/* Hotel Info */}
          <div className="flex gap-4 p-6">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
              {(booking.package?.image || booking.hotel?.image) && (
                <img
                  src={booking.package?.image || booking.hotel?.image}
                  alt={booking.package?.name || booking.hotel?.name || t('bookingConfirmation.travelBooking')}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">{booking.package?.name || booking.hotel?.name || t('bookingConfirmation.travelBooking')}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {booking.package?.destinationName
                  || booking.package?.destination?.name
                  || (booking.hotel?.destination?.name
                  ? `${booking.hotel.destination.name}, ${booking.hotel.destination.country}`
                  : booking.hotel?.address || t('bookingConfirmation.destinationUnavailable'))}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{booking.room?.name || (booking.package ? t('bookingConfirmation.packageBooking') : t('bookingConfirmation.roomUnavailable'))}</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Dates & Guests */}
          <div className="grid grid-cols-3 gap-4 p-6">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{t('bookingConfirmation.checkInLabel')}</p>
              <p className="font-medium text-foreground">{format(booking.checkIn, 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">{t('bookingConfirmation.checkInTime')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{t('bookingConfirmation.checkOutLabel')}</p>
              <p className="font-medium text-foreground">{format(booking.checkOut, 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">{t('bookingConfirmation.checkOutTime')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{t('bookingConfirmation.guestsLabel')}</p>
              <p className="font-medium text-foreground">{booking.guests} {t('bookingConfirmation.adultsSuffix')}</p>
              <p className="text-xs text-muted-foreground">{booking.nights} {t('bookingConfirmation.nightsSuffix')}</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Reservation Summary */}
          <div className="p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('bookingConfirmation.reservationSummary')}</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('bookingConfirmation.quotedTotal')}</span>
              <span className="text-2xl font-bold text-foreground">€{booking.total.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('bookingConfirmation.quotedTotalNote')}
            </p>
          </div>

          <hr className="border-border" />

          {/* Hotel Contact */}
          <div className="p-6 bg-muted/50">
            <h3 className="font-semibold text-foreground mb-2">{t('bookingConfirmation.agencyFollowUp')}</h3>
            <p className="text-sm text-muted-foreground">{booking.hotel?.address || booking.package?.meetingPoint || t('bookingConfirmation.agencyFollowUpFallback')}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
              <Phone className="h-4 w-4" />
              {agencyContact.phone}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            {t('bookingConfirmation.printConfirmation')}
          </button>
          <a
            href={`mailto:${agencyContact.email}?subject=Reservation%20${booking.id}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Mail className="h-4 w-4 mr-2" />
            {t('bookingConfirmation.emailAgency')}
          </a>
          <a
            href={travelPolicyPdfPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('bookingConfirmation.travelConditions')}
          </a>
        </div>

        {/* Important Info */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">{t('bookingConfirmation.importantInfo')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(['p1', 'p2', 'p3', 'p4'] as const).map((key) => (
              <li key={key} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {t(`bookingConfirmation.important.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Return Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            {t('bookingConfirmation.returnToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
