export const SITE_TITLE = "Scalify - Agencia de Marketing Digital";
export const SITE_DESCRIPTION =
  "Somos una empresa de marketing digital formada por profesionales jóvenes, creativos y en constante evolución. Combinamos consultoría estratégica, generación de demanda, inteligencia artificial y tecnología para potenciar el crecimiento comercial de tu empresa.";

export const SITE_METADATA = {
  title: {
    default: SITE_TITLE,
    template: "%s | Scalify",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Marketing Digital",
    "Agencia de Marketing",
    "Google Ads",
    "Meta Ads",
    "TikTok Ads",
    "Consultoría Estratégica",
    "Inteligencia Artificial",
    "Generación de Demanda",
    "Pauta Publicitaria",
    "CRM",
  ],
  authors: [{ name: "Scalify Team" }],
  creator: "Scalify",
  publisher: "Scalify",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Scalify",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Scalify - Agencia de Marketing Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
    creator: "@scalify",
  },
};
