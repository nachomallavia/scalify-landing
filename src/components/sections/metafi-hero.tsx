"use client";

import { Button } from "@/components/ui/button";

import { GridBackground } from "../ui/grid-background";

const MetafiHero = () => {
  return (
    <section
      id="scalify-hero"
      className="bg-background border-b-border relative overflow-hidden border-b px-6 lg:px-0"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 h-[530px] md:h-[686px]">
          <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-40" />
          <GridBackground className="[background-size:calc(var(--square-size,64px))_calc(var(--square-size,64px))]" />

          <div className="from-background to-background/0 absolute inset-x-0 top-0 h-40 bg-gradient-to-b" />
        </div>
      </div>

      <div className="container relative px-0 md:px-6">
        <div className="mx-auto grid max-w-4xl gap-6 py-14 text-center sm:py-16 md:gap-8 md:pb-20 md:pt-24">
          <p className="text-foreground mx-auto max-w-2xl text-lg font-medium sm:text-xl md:text-2xl">
            Somos una empresa de marketing digital formada por profesionales
            jóvenes, creativos y en constante evolución.
          </p>

          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
            Vivimos el cambio como parte del proceso y adaptamos nuestras
            estrategias de manera ágil a las dinámicas de cada plataforma.
            Trabajamos combinando consultoría estratégica, generación de
            demanda, inteligencia artificial y tecnología para potenciar el
            crecimiento comercial de tu empresa.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <Button
              aria-label="Agendar reunión"
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full px-8 py-6 text-lg font-semibold sm:w-auto"
              asChild
            >
              <a href="mailto:consultas@scalifyagencia.online">
                AGENDAR REUNIÓN
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetafiHero;
