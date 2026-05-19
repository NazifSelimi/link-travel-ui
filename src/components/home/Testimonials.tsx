import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useGetFeaturedReviewsQuery } from '@/store/linktravelApi';

export function Testimonials() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: testimonials = [], isLoading: loading } = useGetFeaturedReviewsQuery();

  if (!loading && testimonials.length === 0) {
    return null;
  }

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="py-20 lg:py-28 bg-primary/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Section Info */}
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('home.testimonials.kicker')}
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-foreground">
              {t('home.testimonials.title')}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t('home.testimonials.subtitle')}
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-primary">4.9</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t('home.testimonials.averageRating')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{testimonials.length}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('home.testimonials.recentReviews')}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={prevTestimonial}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-transparent hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      index === activeIndex
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-primary/30 hover:bg-primary/50'
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextTestimonial}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-transparent hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Right Side - Testimonial Card */}
          <div className="relative">
            <Quote className="absolute -top-4 -left-4 h-16 w-16 text-primary/10" />
            <div className="relative bg-card rounded-2xl p-8 shadow-lg border border-border">
              {loading ? (
                <div className="h-48 animate-pulse rounded-2xl bg-muted" />
              ) : (
              <>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < activeTestimonial.rating
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                &ldquo;{activeTestimonial.comment || activeTestimonial.title || t('home.testimonials.fallback')}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {activeTestimonial.user?.firstName?.charAt(0) || 'G'}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {activeTestimonial.user
                      ? `${activeTestimonial.user.firstName} ${activeTestimonial.user.lastName}`
                      : t('home.testimonials.guestTraveler')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeTestimonial.reviewableType || t('home.testimonials.tripReview')}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-medium text-primary">{activeTestimonial.reviewableName || 'LinkTravel'}</p>
                </div>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
