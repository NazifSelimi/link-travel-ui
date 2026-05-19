import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSubscribeNewsletterMutation } from '@/store/linktravelApi';

const contactLinks = [
  { name: 'Email', icon: Mail, href: 'mailto:linktravelnmk@gmail.com' },
  { name: 'Phone', icon: Phone, href: 'tel:+38971726726' },
  { name: 'Map', icon: MapPin, href: 'https://maps.google.com/?q=Ivo+Lola+Ribar+32,+Gostivar' },
];

export function Footer() {
  const { t } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeNewsletter, { isLoading: submitting }] = useSubscribeNewsletterMutation();

  const footerNavigation = {
    destinations: [
      { label: t('footer.links.allDestinations'), href: '/destinations' },
      { label: t('footer.links.hotels'), href: '/hotels' },
      { label: t('footer.links.packages'), href: '/packages' },
    ],
    company: [
      { label: t('footer.links.aboutUs'), href: '/about' },
      { label: t('footer.links.contact'), href: '/contact' },
    ],
    support: [
      { label: t('footer.links.contact'), href: '/contact' },
      { label: t('footer.links.booking'), href: '/booking' },
      { label: t('footer.links.packages'), href: '/packages' },
    ],
    legal: [
      { label: t('footer.links.travelPolicy'), href: '/travel-policy' },
      { label: t('footer.links.contactSupport'), href: '/contact' },
    ],
  };

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newsletterEmail) {
      message.error(t('footer.newsletterPleaseEnterEmail'));
      return;
    }

    try {
      await subscribeNewsletter(newsletterEmail).unwrap();
      message.success(t('footer.newsletterSubscribed'));
      setNewsletterEmail('');
    } catch (error) {
      message.error((error as Error).message || t('footer.newsletterFailed'));
    }
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            <div className="text-center lg:text-left">
              <h3 className="font-serif text-2xl font-bold text-background">
                {t('footer.newsletterTitle')}
              </h3>
              <p className="mt-2 text-background/70">
                {t('footer.newsletterSubtitle')}
              </p>
            </div>
            <form className="flex w-full max-w-md gap-3" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder={t('footer.newsletterPlaceholder')}
                className="flex-1 rounded-md px-4 py-2 bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:bg-background/15 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium whitespace-nowrap transition-colors"
              >
                {submitting ? t('footer.newsletterSending') : t('footer.newsletterSubmit')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center">
              <img
                src="/images/logo-linktravel.png"
                alt="LinkTravel"
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-background/70 max-w-xs">
              {t('footer.brandDescription')}
            </p>
            <div className="mt-6 space-y-3">
              <a href="mailto:linktravelnmk@gmail.com" className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors">
                <Mail className="h-4 w-4" />
                linktravelnmk@gmail.com
              </a>
              <a href="tel:+38971726726" className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors">
                <Phone className="h-4 w-4" />
                +389 71 726 726
              </a>
              <p className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="h-4 w-4" />
                Rr. Ivo Lola Ribar 32, Gostivar
              </p>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              {t('footer.destinations')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.destinations.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              {t('footer.company')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              {t('footer.support')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.support.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              {t('footer.legal')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-background/10 pt-8 md:flex-row">
          <p className="text-sm text-background/60">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            {contactLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                className="rounded-full bg-background/10 p-2 text-background/70 hover:bg-background/20 hover:text-background transition-colors"
                aria-label={item.name}
              >
                <item.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
