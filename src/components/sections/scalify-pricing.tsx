"use client";

import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type PricingTier = {
  name: string;
  description: string;
  features: { name: string; included: boolean; value?: string }[];
};

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Start",
    description: "Ideal para comenzar tu transformación digital",
    features: [
      { name: "3 usuarios de CRM", included: true, value: "3 usuarios" },
      { name: "Bandeja unificada de IG y FB", included: true },
      { name: "App Mobile", included: true },
      { name: "Gestión y optimización en Google Ads", included: true },
      { name: "Gestión y optimización en Meta Ads", included: true },
      { name: "Diseño de placas para ads", included: true, value: "Hasta 10/mes" },
      { name: "Reporte en tiempo real", included: true },
      { name: "WhatsApp integrado", included: false },
      { name: "Chat bot automatizado", included: false },
    ],
  },
  {
    name: "Grow",
    description: "Perfecto para empresas en crecimiento",
    features: [
      { name: "5 usuarios de CRM", included: true, value: "5 usuarios" },
      { name: "Bandeja unificada de IG y FB", included: true },
      { name: "App Mobile", included: true },
      { name: "Gestión y optimización en Google Ads", included: true },
      { name: "Gestión y optimización en Meta Ads", included: true },
      { name: "Diseño de placas para ads", included: true, value: "Hasta 10/mes" },
      { name: "Reporte en tiempo real", included: true },
      { name: "WhatsApp integrado", included: true },
      { name: "Chat bot automatizado", included: false },
    ],
  },
  {
    name: "Scale",
    description: "Solución completa para empresas consolidadas",
    features: [
      { name: "10 usuarios de CRM", included: true, value: "10 usuarios" },
      { name: "Bandeja unificada de IG y FB", included: true },
      { name: "App Mobile", included: true },
      { name: "Gestión y optimización en Google Ads", included: true },
      { name: "Gestión y optimización en Meta Ads", included: true },
      { name: "Diseño de placas para ads", included: true, value: "Hasta 10/mes" },
      { name: "Reporte en tiempo real", included: true },
      { name: "WhatsApp integrado", included: true },
      { name: "Chat bot automatizado", included: true },
    ],
  },
];

function PricingCard({ tier, featured }: { tier: PricingTier; featured?: boolean }) {
  return (
    <div
      className={`bg-card border-border-light relative flex min-w-[280px] flex-shrink-0 snap-center flex-col rounded-[16px] border p-8 shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)] sm:min-w-[320px] md:min-w-0 ${
        featured ? "border-primary/40 shadow-[0_8px_24px_-4px_rgba(16,0,118,0.15)]" : ""
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
          <span className="bg-accent text-accent-foreground rounded-full px-4 py-1.5 text-sm font-semibold shadow-md">Más Popular</span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-foreground mb-2 text-2xl font-bold">{tier.name}</h3>
        <p className="text-muted-foreground text-sm">{tier.description}</p>
      </div>

      <div className="mb-8 flex-1 space-y-4">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5">
              {feature.included ? <Check className="text-accent h-5 w-5" /> : <X className="text-muted-foreground/40 h-5 w-5" />}
            </div>
            <div className="flex-1">
              <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/60"}`}>{feature.name}</span>
              {feature.value && feature.included && <span className="text-muted-foreground mt-0.5 block text-xs">{feature.value}</span>}
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className={`w-full ${featured ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-primary hover:bg-primary/90"}`}
        asChild
      >
        <a href="mailto:consultas@scalifyagencia.online?subject=Consulta sobre plan {tier.name}">AGENDAR REUNIÓN</a>
      </Button>
    </div>
  );
}

export default function ScalifyPricing() {
  const [activeIndex, setActiveIndex] = useState(1); // Start with "Grow" (middle card)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the active card
  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / PRICING_TIERS.length;
      const scrollPosition = cardWidth * index;
      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  // Initialize with middle card on mount (mobile only)
  useEffect(() => {
    const isMobile = window.innerWidth < 768; // md breakpoint
    if (isMobile) {
      scrollToCard(1);
    }
  }, []);

  // Handle scroll to update active indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = container.scrollWidth / PRICING_TIERS.length;
      const scrollPosition = container.scrollLeft;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrevious = () => {
    const newIndex = Math.max(0, activeIndex - 1);
    setActiveIndex(newIndex);
    scrollToCard(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(PRICING_TIERS.length - 1, activeIndex + 1);
    setActiveIndex(newIndex);
    scrollToCard(newIndex);
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    scrollToCard(index);
  };

  return (
    <section id="scalify-pricing" className="bg-background px-6 lg:px-0">
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-28">
        <h2 className="text-foreground mx-auto mb-4 max-w-3xl text-balance text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          PROPUESTA COMERCIAL
        </h2>

        <p className="text-muted-foreground mx-auto mb-12 mt-4 max-w-2xl text-center text-base sm:text-lg">
          Elige el plan que mejor se adapte a las necesidades de tu empresa
        </p>

        {/* Mobile carousel container with extra padding-top for the "Más Popular" pill */}
        <div className="relative">
          {/* Cards container */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-6 overflow-visible overflow-x-auto px-6 pt-12 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-8 md:px-0"
          >
            {PRICING_TIERS.map((tier, index) => (
              <PricingCard key={index} tier={tier} featured={tier.name === "Grow"} />
            ))}
          </div>

          {/* Navigation controls - buttons and dots together, only visible on mobile */}
          <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={activeIndex === 0}
              className="bg-card border-border hover:bg-muted rounded-full border p-2 shadow-md transition-all disabled:opacity-30"
              aria-label="Previous plan"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {PRICING_TIERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${index === activeIndex ? "bg-accent w-8" : "bg-border hover:bg-border-light"}`}
                  aria-label={`Go to plan ${index + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={activeIndex === PRICING_TIERS.length - 1}
              className="bg-card border-border hover:bg-muted rounded-full border p-2 shadow-md transition-all disabled:opacity-30"
              aria-label="Next plan"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">Todos los planes incluyen soporte dedicado y actualizaciones continuas</p>
        </div>
      </div>
    </section>
  );
}
