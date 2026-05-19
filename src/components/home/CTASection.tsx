import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-background rounded-full translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {t('home.cta.title')}
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/destinations"
              className="inline-flex items-center justify-center min-w-[200px] px-6 py-3 rounded-md bg-secondary text-secondary-foreground text-base font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('home.cta.viewOffers')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center min-w-[200px] px-6 py-3 rounded-md border border-primary-foreground/30 text-primary-foreground text-base font-medium hover:bg-primary-foreground/10 bg-transparent transition-colors"
            >
              {t('home.cta.contactUs')}
            </Link>
          </div>

          {/* Contact Options */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-primary-foreground/80">
            <a href="tel:+38971726726" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <div className="p-2 rounded-full bg-primary-foreground/10">
                <Phone className="h-5 w-5" />
              </div>
              <span className="text-sm">+389 71 726 726</span>
            </a>
            <a href="mailto:linktravelnmk@gmail.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <div className="p-2 rounded-full bg-primary-foreground/10">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-sm">linktravelnmk@gmail.com</span>
            </a>
            <a href="https://wa.me/38971726726" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <div className="p-2 rounded-full bg-primary-foreground/10">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-sm">WhatsApp / Viber</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
