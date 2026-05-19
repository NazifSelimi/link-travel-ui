import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { addDays, differenceInDays, format } from 'date-fns';
import { Check, ChevronLeft, Info, MapPin, Shield, Star } from 'lucide-react';
import { Checkbox, DatePicker, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import {
  useCreateBookingMutation,
  useGetHotelQuery,
  useGetPackageQuery,
} from '@/store/linktravelApi';
import { travelPolicyPdfPath } from '@/lib/policy';
import { cn } from '@/lib/utils';

export default function BookingPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const defaultGuestOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: `${index + 1} ${t('home.hero.guest', { count: index + 1 })}`,
  }));

  const hotelId = searchParams.get('hotel') || '';
  const roomId = searchParams.get('room') || '';
  const packageId = searchParams.get('package') || '';
  const isPackageBooking = Boolean(packageId);

  const { data: hotel, isLoading: hotelLoading } = useGetHotelQuery(hotelId, { skip: !hotelId });
  const { data: travelPackage, isLoading: packageLoading } = useGetPackageQuery(packageId, { skip: !packageId });
  const [createBooking] = useCreateBookingMutation();

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 7));
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 10));
  const [guests, setGuests] = useState('2');
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    specialRequests: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoom = hotel?.roomTypes?.find((room) => room.id === roomId) || hotel?.roomTypes?.[0];
  const guestCount = Number.parseInt(guests, 10) || 1;
  const nights = checkIn && checkOut ? Math.max(1, differenceInDays(checkOut, checkIn)) : 1;
  const subtotal = isPackageBooking
    ? (travelPackage?.price ?? 0) * guestCount
    : (selectedRoom?.pricePerNight ?? 0) * nights;
  const total = subtotal;
  const bookingTitle = travelPackage?.name || hotel?.name || 'Travel booking';
  const bookingSubtitle = isPackageBooking
    ? travelPackage?.destinationName || travelPackage?.destination?.name || 'Package'
    : selectedRoom?.name || hotel?.address || 'Hotel room';
  const bookingImage = travelPackage?.image || hotel?.image || '/placeholder.svg';
  const backPath = isPackageBooking ? `/packages/${packageId}` : `/hotels/${hotelId}`;
  const backLabel = isPackageBooking ? t('booking.backToPackage') : t('booking.backToHotel');
  const loading = (hotelId && hotelLoading) || (packageId && packageLoading);
  const isStep1Valid = Boolean(checkIn && checkOut && guests);
  const isStep2Valid = Boolean(guestDetails.firstName && guestDetails.lastName && guestDetails.email && guestDetails.phone);

  const handleGuestDetailChange = (field: string, value: string) => {
    setGuestDetails((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async () => {
    if ((!isPackageBooking && (!hotelId || !selectedRoom)) || (isPackageBooking && !travelPackage) || !checkIn || !checkOut) {
      message.error(t('booking.completeFirst'));
      return;
    }

    if (!isAuthenticated) {
      message.info(t('auth.pleaseSignIn'));
      navigate('/login', {
        replace: true,
        state: { from: isPackageBooking ? `/booking?package=${packageId}` : `/booking?hotel=${hotelId}&room=${selectedRoom?.id}` },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reservation = await createBooking({
        hotelId: isPackageBooking ? null : hotelId,
        roomTypeId: isPackageBooking ? null : selectedRoom?.id,
        packageId: isPackageBooking ? packageId : null,
        fullName: `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
        email: guestDetails.email,
        phone: guestDetails.phone,
        checkIn: format(checkIn, 'yyyy-MM-dd'),
        checkOut: format(checkOut, 'yyyy-MM-dd'),
        guests: guestCount,
        totalPrice: total,
        notes: guestDetails.specialRequests || '',
      }).unwrap();

      navigate(`/booking/confirmation?id=${reservation.id}`);
    } catch (error) {
      message.error((error as Error).message || t('booking.failedToCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!hotelId && !packageId) {
    return (
      <EmptyBookingState
        title={t('booking.emptyChooseTitle')}
        description={t('booking.emptyChooseBody')}
        primaryHref="/hotels"
        primaryLabel={t('booking.browseHotels')}
        secondaryHref="/packages"
        secondaryLabel={t('booking.browsePackages')}
      />
    );
  }

  if (hotelId && !hotel) {
    return (
      <EmptyBookingState
        title={t('booking.hotelNotFound')}
        description={t('booking.hotelNotFoundBody')}
        primaryHref="/hotels"
        primaryLabel={t('booking.browseHotels')}
      />
    );
  }

  if (packageId && !travelPackage) {
    return (
      <EmptyBookingState
        title={t('booking.packageNotFound')}
        description={t('booking.packageNotFoundBody')}
        primaryHref="/packages"
        primaryLabel={t('booking.browsePackages')}
      />
    );
  }

  if (hotel && !selectedRoom) {
    return (
      <EmptyBookingState
        title={t('booking.roomNotAvailable')}
        description={t('booking.roomNotAvailableBody')}
        primaryHref={`/hotels/${hotel.id}`}
        primaryLabel={t('booking.backToHotelButton')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to={backPath} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((currentStep) => (
              <div key={currentStep} className="flex items-center">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  currentStep === step ? 'bg-primary text-primary-foreground' : currentStep < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                )}>
                  {currentStep < step ? <Check className="h-5 w-5" /> : currentStep}
                </div>
                {currentStep < 3 ? <div className={cn('ml-4 h-0.5 w-16 sm:w-24', currentStep < step ? 'bg-primary' : 'bg-muted')} /> : null}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-8 text-sm">
            <span className={step >= 1 ? 'text-foreground' : 'text-muted-foreground'}>{t('booking.stepDates')}</span>
            <span className={step >= 2 ? 'text-foreground' : 'text-muted-foreground'}>{t('booking.stepDetails')}</span>
            <span className={step >= 3 ? 'text-foreground' : 'text-muted-foreground'}>{t('booking.stepReview')}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {step === 1 ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-6 text-lg font-semibold text-foreground">{t('booking.selectDatesAndGuests')}</h2>
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DateField
                      label={isPackageBooking ? t('booking.preferredStart') : t('booking.checkInDate')}
                      value={checkIn}
                      onChange={setCheckIn}
                    />
                    <DateField
                      label={isPackageBooking ? t('booking.preferredReturn') : t('booking.checkOutDate')}
                      value={checkOut}
                      onChange={setCheckOut}
                      minDate={checkIn}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('booking.numberOfGuests')}</label>
                    <Select
                      value={guests}
                      onChange={setGuests}
                      className="w-full"
                      size="large"
                      options={isPackageBooking ? defaultGuestOptions : defaultGuestOptions.slice(0, selectedRoom?.maxGuests ?? 2)}
                    />
                  </div>
                  <InfoNotice />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-6 text-lg font-semibold text-foreground">{t('booking.guestInformation')}</h2>
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label={t('booking.firstNameLabel')} value={guestDetails.firstName} onChange={(value) => handleGuestDetailChange('firstName', value)} placeholder="John" />
                    <InputField label={t('booking.lastNameLabel')} value={guestDetails.lastName} onChange={(value) => handleGuestDetailChange('lastName', value)} placeholder="Doe" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label={t('booking.emailLabel')} type="email" value={guestDetails.email} onChange={(value) => handleGuestDetailChange('email', value)} placeholder="john@example.com" />
                    <InputField label={t('booking.phoneLabel')} type="tel" value={guestDetails.phone} onChange={(value) => handleGuestDetailChange('phone', value)} placeholder="+389 71 726 726" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('booking.country')}</label>
                    <Select
                      value={guestDetails.country || undefined}
                      onChange={(value) => handleGuestDetailChange('country', value)}
                      placeholder={t('booking.selectCountry')}
                      className="w-full"
                      size="large"
                      options={[
                        { value: 'mk', label: t('destinations.filters.countries.northMacedonia') },
                        { value: 'al', label: t('destinations.filters.countries.albania') },
                        { value: 'xk', label: 'Kosovo' },
                        { value: 'de', label: 'Germany' },
                        { value: 'ch', label: 'Switzerland' },
                        { value: 'other', label: t('common.all') },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="specialRequests" className="text-sm font-medium">{t('booking.specialRequests')}</label>
                    <textarea
                      id="specialRequests"
                      value={guestDetails.specialRequests}
                      onChange={(event) => handleGuestDetailChange('specialRequests', event.target.value)}
                      placeholder={t('booking.specialRequestsPlaceholder')}
                      className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-6 text-lg font-semibold text-foreground">{t('booking.reviewAndConfirm')}</h2>
                <div className="space-y-6">
                  <div className="rounded-lg border border-border p-5">
                    <div className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{t('booking.bookingInProgress')}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t('booking.bookingInProgressBody')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-5">
                    <h3 className="font-medium text-foreground">{t('booking.whatYouAreBooking')}</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <SummaryItem label={isPackageBooking ? t('booking.package') : t('booking.hotel')} value={bookingTitle} />
                      <SummaryItem label={isPackageBooking ? t('booking.travelers') : t('booking.room')} value={isPackageBooking ? `${guestCount} ${t('home.hero.guest', { count: guestCount })}` : selectedRoom?.name} />
                      <SummaryItem label={t('booking.guest')} value={`${guestDetails.firstName} ${guestDetails.lastName}`.trim()} />
                      <SummaryItem
                        label={t('booking.dates')}
                        value={checkIn && checkOut ? `${format(checkIn, 'MMM d, yyyy')} - ${format(checkOut, 'MMM d, yyyy')}` : t('booking.selectDatesPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} />
                    <span className="text-sm text-muted-foreground">
                      {t('booking.termsAcknowledgement')}{' '}
                      <Link to="/travel-policy" className="text-primary hover:underline">{t('booking.generalConditions')}</Link>
                      {' '}{t('booking.and')}{' '}{t('booking.termsTail')}
                    </span>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    {t('booking.savedNotice')}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                disabled={step === 1}
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t('booking.back')}
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep((current) => current + 1)}
                  disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {t('booking.continue')}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!agreeTerms || isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? t('booking.submitting') : `${t('booking.saveBooking')} • €${total.toFixed(2)}`}
                </button>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={bookingImage} alt={bookingTitle} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{bookingTitle}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {bookingSubtitle}
                  </p>
                  {!isPackageBooking && hotel?.rating ? (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {hotel.rating}
                    </p>
                  ) : null}
                </div>
              </div>

              <hr className="my-4 border-border" />

              <div className="space-y-2 text-sm">
                <SummaryRow label={isPackageBooking ? t('booking.start') : t('booking.checkIn')} value={checkIn ? format(checkIn, 'MMM d, yyyy') : '-'} />
                <SummaryRow label={isPackageBooking ? t('booking.return') : t('booking.checkOut')} value={checkOut ? format(checkOut, 'MMM d, yyyy') : '-'} />
                <SummaryRow label={t('home.hero.guests')} value={guests} />
                {!isPackageBooking ? <SummaryRow label={t('booking.nights')} value={String(nights)} /> : null}
              </div>

              <hr className="my-4 border-border" />

              <div className="space-y-2 text-sm">
                <SummaryRow
                  label={isPackageBooking ? `€${travelPackage?.price ?? 0} x ${guestCount} ${t('home.hero.guest', { count: guestCount })}` : `€${selectedRoom?.pricePerNight ?? 0} x ${nights} ${t('booking.nights').toLowerCase()}`}
                  value={`€${subtotal.toFixed(2)}`}
                />
              </div>

              <hr className="my-4 border-border" />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-foreground">{t('booking.estimatedTotal')}</span>
                <span className="text-foreground">€{total.toFixed(2)}</span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{t('booking.noOnlinePayment')}</span>
                </div>
                <a href={travelPolicyPdfPath} target="_blank" rel="noreferrer" className="inline-flex text-primary hover:underline">
                  {t('booking.openConditions')}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function EmptyBookingState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to={primaryHref} className="inline-flex items-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link to={secondaryHref} className="inline-flex items-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  minDate,
  onChange,
}: {
  label: string;
  value?: Date;
  minDate?: Date;
  onChange: (value?: Date) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <DatePicker
        value={value ? dayjs(value) : undefined}
        onChange={(date) => onChange(date?.toDate())}
        disabledDate={(current) => current && current.isBefore(dayjs(minDate || new Date()), 'day')}
        className="w-full"
        size="large"
      />
    </div>
  );
}

function InputField({
  label,
  value,
  placeholder,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, '-');

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} size="large" />
    </div>
  );
}

function InfoNotice() {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div className="text-sm">
          <p className="font-medium text-foreground">{t('booking.infoNoticeTitle')}</p>
          <p className="text-muted-foreground">
            {t('booking.infoNoticeBody')}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || '-'}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
