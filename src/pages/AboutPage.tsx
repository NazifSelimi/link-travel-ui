import { Users, Award, Globe, Heart, Target, Shield, Star } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion for Travel',
    description: 'We believe travel transforms lives and creates lasting memories.',
  },
  {
    icon: Shield,
    title: 'Trust & Reliability',
    description: 'Your safety and satisfaction are our top priorities.',
  },
  {
    icon: Target,
    title: 'Personalized Service',
    description: 'Every journey is tailored to your unique preferences.',
  },
  {
    icon: Star,
    title: 'Excellence',
    description: 'We partner only with the best hotels and service providers.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] bg-muted overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920"
          alt="Beautiful travel destination"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              About LinkTravel
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Oferta aktuale, sherbim personal dhe rezervime te shpejta nga Gostivari
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
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Link Travel eshte agjenci qe komunikon drejtperdrejt, shpejt dhe qarte.
                  Ne fokusohemi te ofertat reale, cmimet aktuale dhe ndihma personale per cdo klient qe kerkon pushime, hotel ose udhetim me avion.
                </p>
                <p>
                  Nga Stambolli deri ne bregdetin shqiptar dhe ofertat sezonale per Tunizi,
                  prezantimi yne bazohet ne informacione konkrete: data nisjeje, lloji i sherbimit, cfare perfshihet dhe si mund te rezervoni menjehere.
                </p>
                <p>
                  Pika jone e forte eshte kontakti i afert me klientin ne telefon, WhatsApp, Viber dhe email,
                  me qellim qe kerkesa te kthehet sa me shpejt ne nje rezervim te konfirmuar.
                </p>
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
              Our Values
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at LinkTravel
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="text-center rounded-2xl border border-border bg-card p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
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
              Recognition & Awards
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Award className="h-10 w-10 text-accent" />
              <div>
                <p className="font-semibold text-foreground">Trusted Travel Planning</p>
                <p className="text-sm text-muted-foreground">Carefully selected experiences and stays</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Users className="h-10 w-10 text-accent" />
              <div>
                <p className="font-semibold text-foreground">Customer-first Support</p>
                <p className="text-sm text-muted-foreground">Responsive guidance before and after booking</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Globe className="h-10 w-10 text-accent" />
              <div>
                <p className="font-semibold text-foreground">Regional Expertise</p>
                <p className="text-sm text-muted-foreground">Focused knowledge of destinations across the region</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
