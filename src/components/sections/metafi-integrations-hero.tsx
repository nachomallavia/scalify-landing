"use client";

import { Button } from "@/components/ui/button";

type MetafiIntegrationsHeroProps = {
  overline?: string;
  title?: string;
  description?: string;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
};

export default function MetafiIntegrationsHero({
  overline = "Integrations",
  title = "Integrations Tool You Use to Run Your Business",
  description = "Effortlessly integrate essential tools into your business operations, ensuring seamless functionality and enhanced efficiency",
  primaryCtaHref = "/pricing",
  primaryCtaLabel = "Get Started",
  secondaryCtaHref = "/contact",
  secondaryCtaLabel = "Contact Us",
}: MetafiIntegrationsHeroProps) {
  return (
    <section
      id="metafi-integrations-hero"
      className="bg-background px-6 lg:px-0"
    >
      <div className="container px-0 md:px-6">
        <div className="bg-features-hero relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-8 sm:py-20 md:py-24">
            <p className="text-tagline mb-4 text-sm sm:text-base">{overline}</p>

            <h1 className="text-foreground text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl md:text-[68px]">
              {title}
            </h1>

            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base sm:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Button asChild className="w-full sm:w-auto">
                <a href={primaryCtaHref}>{primaryCtaLabel}</a>
              </Button>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={secondaryCtaHref}>{secondaryCtaLabel}</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="h-6 sm:h-8" />
      </div>
    </section>
  );
}
