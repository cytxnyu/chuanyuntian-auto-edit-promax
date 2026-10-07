import type { Metadata } from "next";
import { Faq } from "./components/sections/faq";
import { FinalCTA } from "./components/sections/final-cta";
import { Hero } from "./components/sections/hero";
import { HowItWorks } from "./components/sections/how-it-works";
import { LandingPartners } from "./components/sections/landing-partners";
import { Testimonials } from "./components/sections/testimonials";
import { WhatsInside } from "./components/sections/whats-inside";
import { WhyRemocn } from "./components/sections/why-remocn";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WhyRemocn />
      <WhatsInside />
      <Testimonials />
      <Faq />
      <LandingPartners />
      <FinalCTA />
    </>
  );
}
