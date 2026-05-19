import { Users, Award, Globe, Heart, Target, Shield, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const valueKeys = [
  { icon: Heart, key: 'passion' },
  { icon: Shield, key: 'trust' },
  { icon: Target, key: 'personal' },
  { icon: Star, key: 'excellence' },
] as const;

const awardKeys = [
  { icon: Award, key: 'trusted' },
  { icon: Users, key: 'customerFirst' },
  { icon: Globe, key: 'regional' },
] as const;

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] bg-muted overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920"
          alt={t('about.title')}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              {t('about.title')}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                {t('about.storyTitle')}
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>{t('about.story.p1')}</p>
                <p>{t('about.story.p2')}</p>
                <p>{t('about.story.p3')}</p>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800"
                alt="LinkTravel team planning"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {t('about.values.title')}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {valueKeys.map((value) => (
              <div key={value.key} className="text-center rounded-2xl border border-border bg-card p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{t(`about.values.${value.key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`about.values.${value.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {t('about.awards.title')}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {awardKeys.map((award) => (
              <div key={award.key} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <award.icon className="h-10 w-10 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">{t(`about.awards.${award.key}.title`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`about.awards.${award.key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
