import { CustomClickEvent } from "@/components/analytics/react";
import { Button } from "@/components/ui/button";

const ScalifyCta = () => {
  return (
    <section id="scalify-cta" className="bg-primary relative overflow-hidden px-6">
      {/* dotted pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 [color:oklch(1_0_89.88)]" />

      {/* accent gradient */}
      <div className="from-accent/10 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />

      <div className="container relative px-0 py-16 text-center sm:py-20 md:px-6 md:py-28">
        <h2 className="text-primary-foreground mx-auto max-w-5xl text-balance text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          ¿Listo para escalar tu negocio?
        </h2>

        <p className="text-primary-foreground/90 mx-auto mt-4 max-w-2xl text-base font-normal sm:text-lg">
          Agenda una reunión con nuestro equipo y descubre cómo podemos ayudarte a alcanzar tus objetivos de crecimiento
        </p>

        <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
          <CustomClickEvent eventName="cta_click" location="scalify-cta" ctaText="AGENDAR REUNIÓN" ctaType="primary">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 w-full rounded-[12px] px-8 text-lg font-semibold sm:w-auto"
              onClick={() => document.dispatchEvent(new CustomEvent('open-calendar-modal'))}
            >
              AGENDAR REUNIÓN
            </Button>
          </CustomClickEvent>
        </div>
      </div>
    </section>
  );
};

export default ScalifyCta;
