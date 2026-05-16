import { useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircle2, Calendar, MapPin, Users, Mail, Download, Printer, Home, Phone,
} from 'lucide-react';
import { useGetBookingQuery } from '@/store/linktravelApi';
import { agencyContact, travelPolicyPdfPath } from '@/lib/policy';

export default function BookingConfirmationPage() {
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
            <h1 className="font-serif text-3xl font-bold text-foreground">Reservation confirmation</h1>
            <p className="mt-3 text-muted-foreground">
              We could not load a reservation from local session state.
            </p>
            {bookingId && (
              <p className="mt-2 text-sm text-muted-foreground">
                Reference: <span className="font-medium text-foreground">{bookingId}</span>
              </p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Return Home
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Contact Support
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
          <h1 className="font-serif text-3xl font-bold text-foreground">Reservation Received!</h1>
          <p className="mt-2 text-muted-foreground">
            Your reservation request has been saved successfully. Our team will contact{' '}
            <span className="font-medium text-foreground">{booking.email}</span>
            {' '}to confirm availability, final price, and payment steps.
          </p>
        </div>

        {/* Booking Reference */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Booking Reference</p>
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
                  alt={booking.package?.name || booking.hotel?.name || 'Travel booking'}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">{booking.package?.name || booking.hotel?.name || 'Travel booking'}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {booking.package?.destinationName
                  || booking.package?.destination?.name
                  || (booking.hotel?.destination?.name
                  ? `${booking.hotel.destination.name}, ${booking.hotel.destination.country}`
                  : booking.hotel?.address || 'Destination unavailable')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{booking.room?.name || (booking.package ? 'Package booking' : 'Room details unavailable')}</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Dates & Guests */}
          <div className="grid grid-cols-3 gap-4 p-6">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="font-medium text-foreground">{format(booking.checkIn, 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">From 3:00 PM</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p className="font-medium text-foreground">{format(booking.checkOut, 'MMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">Until 11:00 AM</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Guests</p>
              <p className="font-medium text-foreground">{booking.guests} Adults</p>
              <p className="text-xs text-muted-foreground">{booking.nights} Nights</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Reservation Summary */}
          <div className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Reservation Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Quoted Total</span>
              <span className="text-2xl font-bold text-foreground">€{booking.total.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This is an estimated quote for the request. No online payment has been collected.
            </p>
          </div>

          <hr className="border-border" />

          {/* Hotel Contact */}
          <div className="p-6 bg-muted/50">
            <h3 className="font-semibold text-foreground mb-2">Agency Follow-Up</h3>
            <p className="text-sm text-muted-foreground">{booking.hotel?.address || booking.package?.meetingPoint || 'Agency will confirm meeting details'}</p>
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
            Print Confirmation
          </button>
          <a
            href={`mailto:${agencyContact.email}?subject=Reservation%20${booking.id}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Agency
          </a>
          <a
            href={travelPolicyPdfPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Travel Conditions
          </a>
        </div>

        {/* Important Info */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Important Information</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Link Travel will contact you before the reservation is treated as confirmed
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              A valid ID or passport is required for all guests
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Payment is not collected online and must be arranged directly with the agency
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Changes, cancellation rules, and deadlines follow the official travel conditions and the selected offer
            </li>
          </ul>
        </div>

        {/* Return Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
