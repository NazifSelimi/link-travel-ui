import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { message } from 'antd';
import { useSubscribeNewsletterMutation } from '@/store/linktravelApi';

const footerNavigation = {
  destinations: [
    { name: 'All Destinations', href: '/destinations' },
    { name: 'Hotels', href: '/hotels' },
    { name: 'Packages', href: '/packages' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Contact', href: '/contact' },
    { name: 'Booking', href: '/booking' },
    { name: 'Packages', href: '/packages' },
  ],
  legal: [
    { name: 'Travel Policy', href: '/travel-policy' },
    { name: 'Contact Support', href: '/contact' },
  ],
};

const contactLinks = [
  { name: 'Email', icon: Mail, href: 'mailto:linktravelnmk@gmail.com' },
  { name: 'Phone', icon: Phone, href: 'tel:+38971726726' },
  { name: 'Map', icon: MapPin, href: 'https://maps.google.com/?q=Ivo+Lola+Ribar+32,+Gostivar' },
];

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeNewsletter, { isLoading: submitting }] = useSubscribeNewsletterMutation();

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newsletterEmail) {
      message.error('Please enter your email address.');
      return;
    }

    try {
      await subscribeNewsletter(newsletterEmail).unwrap();
      message.success('You have been subscribed to the newsletter.');
      setNewsletterEmail('');
    } catch (error) {
      message.error((error as Error).message || 'Failed to subscribe to the newsletter.');
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
                Merr ofertat e fundit direkt nga Link Travel
              </h3>
              <p className="mt-2 text-background/70">
                Oferta aktuale, data nisjeje dhe paketa sezonale per Stamboll, Shqiperi, Tunizi dhe me shume.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-3" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-md px-4 py-2 bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:bg-background/15 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium whitespace-nowrap transition-colors"
              >
                {submitting ? 'Duke derguar...' : 'Abonohu'}
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
              Oferta reale, cmime aktuale dhe mbeshtetje direkte ne WhatsApp dhe Viber.
              Link Travel nga Gostivari ju ndihmon te rezervoni me shpejt dhe me siguri.
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
              Destinations
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.destinations.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              Company
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              Support
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              Legal
            </h4>
            <ul className="mt-4 space-y-3">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-background/10 pt-8 md:flex-row">
          <p className="text-sm text-background/60">
            &copy; {new Date().getFullYear()} LinkTravel. All rights reserved.
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
