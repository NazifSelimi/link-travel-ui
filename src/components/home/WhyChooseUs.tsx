import { Shield, Headphones, Award, ClipboardCheck, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const featureKeys = [
  { icon: Shield, key: 'easyReservations' },
  { icon: Headphones, key: 'support' },
  { icon: Award, key: 'trusted' },
  { icon: ClipboardCheck, key: 'followUp' },
  { icon: MapPin, key: 'curated' },
  { icon: Clock, key: 'clearTerms' },
] as const;

export function WhyChooseUs() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            {t('home.whyChooseUs.kicker')}
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-foreground">
            {t('home.whyChooseUs.title')}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t('home.whyChooseUs.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((feature) => (
            <div
              key={feature.key}
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
                {t(`home.whyChooseUs.features.${feature.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`home.whyChooseUs.features.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
