import { Image } from "astro:assets";
import { Brain, TrendingUp, Users } from "lucide-react";

import AdManagementImage from "@/assets/images/ads copy.webp";

const MetafiFeatures = () => {
  return (
    <>
      {/* Services Header */}
      <section id="scalify-services-intro" className="bg-background px-6 lg:px-0">
        <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
          <h2 className="text-foreground mx-auto mb-4 max-w-3xl text-balance text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            ¿QUÉ HACEMOS?
          </h2>

          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg">
            Ofrecemos soluciones integrales de marketing digital para escalar tu negocio
          </p>
        </div>
      </section>

      {/* Service 1: Ad Management */}
      <section id="scalify-service-ads" className="bg-muted/30 border-border border-y px-6 lg:px-0">
        <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
          <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
            <div className="flex justify-center lg:justify-start">
              <div className="bg-accent/10 flex h-full w-full items-center justify-center rounded-full">
                <Image src={AdManagementImage} alt="Ad Management" width={1200} height={800} className="h-auto w-full object-contain" />
              </div>
            </div>

            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-foreground mb-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                GESTIÓN Y OPTIMIZACIÓN DE PAUTA PUBLICITARIA
              </h3>

              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                Campañas de alto rendimiento en Meta Ads, Google Ads y TikTok Ads, optimizadas para ventas, leads y crecimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service 2: Strategic Consulting + AI */}
      <section id="scalify-service-consulting" className="bg-background border-border border-b px-6 lg:px-0">
        <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
          <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
            <div className="max-w-xl text-center lg:order-1 lg:text-left">
              <h3 className="text-foreground mb-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                CONSULTORÍA ESTRATÉGICA + IA
              </h3>

              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                Analizamos tu ecosistema comercial, identificamos oportunidades y aplicamos tecnología e inteligencia artificial para acelerar tus
                resultados.
              </p>
            </div>

            <div className="flex justify-center lg:order-2 lg:justify-end">
              <div className="bg-primary/10 flex h-32 w-32 items-center justify-center rounded-full">
                <Brain className="text-primary h-16 w-16" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service 3: Sales Team Integration */}
      <section id="scalify-service-sales" className="bg-muted/30 border-border border-b px-6 lg:px-0">
        <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
          <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
            <div className="flex justify-center lg:justify-start">
              <div className="bg-accent/10 flex h-32 w-32 items-center justify-center rounded-full">
                <Users className="text-accent h-16 w-16" />
              </div>
            </div>

            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-foreground mb-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                INTEGRACIÓN CON TU EQUIPO COMERCIAL
              </h3>

              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                Analizamos tu proceso de ventas para detectar qué está pasando, mejorar la conversión y alinear marketing + ventas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MetafiFeatures;
