import {
  HeroSearch,
  FeaturedDestinations,
  PopularHotels,
  SpecialOffers,
  Testimonials,
  WhyChooseUs,
  CTASection,
} from '@/components/home';

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <FeaturedDestinations />
      <WhyChooseUs />
      <PopularHotels />
      <SpecialOffers />
      <Testimonials />
      <CTASection />
    </>
  );
}
