import { Shield, Headphones, Award, ClipboardCheck, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Shield,
    title: 'Easy Reservations',
    description: 'Send your stay request in minutes and let our team confirm the details with you directly.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our travel experts are available around the clock to assist you.',
  },
  {
    icon: Award,
    title: 'Trusted Guidance',
    description: 'We help you choose the right destination, hotel, and package with personal support.',
  },
  {
    icon: ClipboardCheck,
    title: 'Fast Follow-Up',
    description: 'Every reservation request is saved so our team can contact you quickly with next steps.',
  },
  {
    icon: MapPin,
    title: 'Curated Experiences',
    description: 'Handpicked destinations and accommodations vetted by our experts.',
  },
  {
    icon: Clock,
    title: 'Clear Travel Conditions',
    description: 'Every request follows agency travel conditions and offer-specific cancellation rules.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Why LinkTravel
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Travel with Confidence
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            We go above and beyond to ensure your travel experience is seamless, 
            secure, and unforgettable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                'group p-6 rounded-2xl bg-card border border-border',
                'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20',
                'transition-all duration-300'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
