"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

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
    <div className={`bg-card border-border-light relative flex flex-col rounded-[16px] border p-8 shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)] ${
      featured ? "border-primary/40 shadow-[0_8px_24px_-4px_rgba(16,0,118,0.15)]" : ""
    }`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
            Más Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-foreground text-2xl font-bold mb-2">
          {tier.name}
        </h3>
        <p className="text-muted-foreground text-sm">
          {tier.description}
        </p>
      </div>

      <div className="flex-1 space-y-4 mb-8">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5">
              {feature.included ? (
                <Check className="h-5 w-5 text-accent" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1">
              <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/60"}`}>
                {feature.name}
              </span>
              {feature.value && feature.included && (
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {feature.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className={`w-full ${
          featured
            ? "bg-accent hover:bg-accent/90 text-accent-foreground"
            : "bg-primary hover:bg-primary/90"
        }`}
        asChild
      >
        <a href="mailto:consultas@scalifyagencia.online?subject=Consulta sobre plan {tier.name}">
          AGENDAR REUNIÓN
        </a>
      </Button>
    </div>
  );
}

export default function ScalifyPricing() {
  return (
    <section id="scalify-pricing" className="bg-background px-6 lg:px-0">
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-28">
        <h2 className="text-foreground mx-auto max-w-3xl text-balance text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl mb-4">
          PROPUESTA COMERCIAL
        </h2>

        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg mb-12">
          Elige el plan que mejor se adapte a las necesidades de tu empresa
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 md:mt-14 lg:grid-cols-3 lg:gap-8">
          {PRICING_TIERS.map((tier, index) => (
            <PricingCard
              key={index}
              tier={tier}
              featured={tier.name === "Grow"}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Todos los planes incluyen soporte dedicado y actualizaciones continuas
          </p>
        </div>
      </div>
    </section>
  );
}
