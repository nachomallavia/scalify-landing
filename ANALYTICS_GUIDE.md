# Guía de Analytics - Scalify Landing

Sistema de analytics implementado con GTM + PostHog para trackeo headless.

## 📊 Estado Actual

### ✅ Implementado

1. **Core Setup** - Analytics integrado en el layout principal
2. **Hero CTA Tracking** - Botón "AGENDAR REUNIÓN" en el hero
3. **Footer Tracking** - Todos los enlaces del footer (Servicios, Compañía, Legal)
4. **Social Media Tracking** - Enlaces de redes sociales en el footer
5. **Navbar Tracking** - CTAs del navbar (desktop y mobile)
6. **React Helpers** - Librería de funciones para trackear desde componentes React

### 🎯 Eventos Trackeados

| Evento | Ubicación | Propiedades |
|--------|-----------|------------|
| `cta_click` | Hero | `location: "hero"`, `ctaText: "AGENDAR REUNIÓN"`, `ctaType: "primary"` |
| `cta_click` | Navbar | `location: "navbar"`, `ctaText: "Agendar Reunión"`, `ctaType: "primary"` |
| `pricing_cta_click` | Pricing | `location: "pricing"`, `planName: "Start/Grow/Scale"`, `planType: "featured/standard"` |
| `footer_link_click` | Footer | `location: "footer"`, `linkText`, `linkSection` |
| `social_click` | Footer | `location: "footer"`, `socialNetwork` |
| `nav_click` | Navbar | `location: "navbar"` o `"mobile_menu"`, `linkText`, `linkUrl` |
| `section_scroll_percent` | ScalifyFeatures | `sectionName: "ScalifyFeatures"`, `scrollDepth: 25/50/75/100` |

## 🔧 Configuración

### Variables de Entorno

Tu archivo `.env` está configurado con:

```env
# GTM
PUBLIC_GTM_ID=GTM-N56ZVXQX

# PostHog
PUBLIC_POSTHOG_KEY=phc_omZ9YdQRd4MiuOa7wskbCA0wphN1o8kbHRKfAEosfaB

# Modo Testing (activo)
PUBLIC_LIVE_TESTING=true
PUBLIC_ANALYTICS_DEBUG=true
```

**⚠️ IMPORTANTE**: Actualmente está en **MODO TESTING**.

Cuando `PUBLIC_LIVE_TESTING=true`:
- Todos los eventos tienen el prefijo `[TEST]`
- Los eventos incluyen `environment: "testing"`
- Perfecto para validar antes de producción

## 🧪 Verificación

### 1. Verificar en Browser Console

Con `PUBLIC_ANALYTICS_DEBUG=true`, verás logs como:

```
[Analytics] GTM Event: [TEST] cta_click {location: "hero", ctaText: "AGENDAR REUNIÓN", ...}
[Analytics] PostHog Event: [TEST] cta_click {location: "hero", ...}
```

### 2. GTM Debugger

1. Instala [Google Tag Manager Debug Chrome Extension](https://chrome.google.com/webstore/detail/google-tag-manager-debug/jaeghpcmdkamcfckmmipfnpmklkdkibj)
2. Activa el debugger
3. Navega tu sitio
4. Verás eventos con prefijo `[TEST]` en el panel de debug

### 3. PostHog Live Events

1. Ve a tu proyecto PostHog
2. Activity → Live Events
3. Interactúa con el sitio
4. Verás eventos en tiempo real con `environment: "testing"`

## 🚀 Modo Producción

Cuando estés listo para producción:

1. **Actualiza `.env`**:
```env
PUBLIC_LIVE_TESTING=false
PUBLIC_ANALYTICS_DEBUG=false
```

2. **Configura en tu plataforma de hosting** (Vercel, Netlify, etc.):
   - `PUBLIC_GTM_ID`
   - `PUBLIC_POSTHOG_KEY`
   - `PUBLIC_LIVE_TESTING=false`
   - `PUBLIC_ANALYTICS_DEBUG=false`

3. **Verifica**:
   - Los eventos NO deben tener prefijo `[TEST]`
   - `environment: "production"`

## 📝 Cómo Agregar Más Tracking

### En Componentes Astro

```astro
---
import CustomClickEvent from "@/components/analytics/headless/CustomClickEvent.astro";
---

<CustomClickEvent 
  eventName="mi_evento"
  location="mi_seccion"
  customProperty="valor"
>
  <button>Mi Botón</button>
</CustomClickEvent>
```

### En Componentes React

```tsx
import { trackEvent, trackCtaClick } from "@/lib/analytics/react-helpers";

// Trackear cualquier evento
const handleClick = () => {
  trackEvent("mi_evento", {
    location: "mi_seccion",
    customProperty: "valor"
  });
};

// Trackear un CTA
const handleCta = () => {
  trackCtaClick("Mi CTA", "mi_seccion", {
    ctaType: "secondary"
  });
};
```

### Funciones Disponibles para React

- `trackEvent(eventName, properties)` - Evento genérico
- `trackClick(location, properties)` - Click genérico
- `trackCtaClick(ctaText, location, properties)` - CTA click
- `trackNavClick(linkText, linkUrl, location)` - Navegación
- `trackSocialClick(socialNetwork, location)` - Social media
- `trackFormSubmit(formName, location, properties)` - Form submit
- `trackFormError(formName, errorMessage, location)` - Form error

## 📦 Otros Componentes de Tracking

### CustomViewEvent

Para trackear visualizaciones (productos, secciones, etc.):

```astro
---
import CustomViewEvent from "@/components/analytics/headless/CustomViewEvent.astro";
---

<CustomViewEvent 
  eventName="section_view"
  sectionName="Pricing"
>
  <section>...</section>
</CustomViewEvent>
```

### CustomScrollEvent

Para trackear scroll (lectura de artículos, etc.):

```astro
---
import CustomScrollEvent from "@/components/analytics/headless/CustomScrollEvent.astro";
---

<CustomScrollEvent 
  eventName="article_read"
  articleTitle="Mi Artículo"
  milestones={[25, 50, 75, 100]}
>
  <article>...</article>
</CustomScrollEvent>
```

**Comportamiento de milestones**: 
- Los milestones se disparan **secuencialmente** en orden
- Si el usuario hace scroll rápido, se dispararán uno por uno en cada evento de scroll (debounced a 100ms)
- Esto previene que todos los milestones se disparen simultáneamente

**Cálculo del porcentaje**:
- **0%**: Top del elemento entra al viewport (top = windowHeight)
- **25%**: 1/4 del elemento ha entrado al viewport
- **50%**: Mitad del elemento ha entrado al viewport
- **75%**: 3/4 del elemento ha entrado al viewport
- **100%**: Bottom del elemento sale del viewport (bottom = 0) ✅

Este método funciona para elementos de cualquier altura (más pequeños, iguales o más grandes que el viewport). El porcentaje representa cuánto del contenido ha "pasado" por el viewport.

### CustomFormEvent

Para trackear formularios:

```astro
---
import CustomFormEvent from "@/components/analytics/headless/CustomFormEvent.astro";
---

<CustomFormEvent 
  eventNameSubmit="contact_form_submit"
  eventNameError="contact_form_error"
  formName="contact"
>
  <form>...</form>
</CustomFormEvent>
```

### CustomLoopEvent

Para trackear items en loops (listas de productos, artículos, etc.):

```astro
---
import CustomLoopEvent from "@/components/analytics/headless/CustomLoopEvent.astro";
---

{items.map((item, index) => (
  <CustomLoopEvent
    eventName="item_click"
    item={item}
    index={index}
    loopName="featured_items"
  >
    <article>{item.title}</article>
  </CustomLoopEvent>
))}
```

## 🎯 Próximos Pasos Sugeridos

1. **Agregar tracking a formularios de contacto**
2. **Trackear views de secciones importantes** (Features, Pricing, etc.)
3. **Trackear scroll en blog posts** (si aplica)
4. **Trackear clicks en cards/productos** (si aplica)
5. **Crear eventos personalizados** según tus necesidades

## 📊 Monitoreo

### GTM

1. Ve a tu contenedor GTM
2. Preview mode para ver eventos en tiempo real
3. Publica cuando estés listo

### PostHog

1. Dashboard → Insights para crear gráficos
2. Recordings para ver sesiones de usuarios
3. Feature Flags si necesitas A/B testing

## ⚠️ Debugging con Console

Con `PUBLIC_ANALYTICS_DEBUG=true`, todos los eventos mostrarán información detallada en la consola:

```javascript
[CustomClickEvent] Event tracked: {
  trackerId: "ctx_abc123",
  eventName: "cta_click",
  eventData: { event: "[TEST] cta_click", location: "hero", ... }
}
```

El `trackerId` es único para cada instancia del componente y te ayuda a identificar qué tracker disparó el evento.

## 🐛 Troubleshooting

### ⚠️ Eventos que se disparan múltiples veces

**Problema resuelto**: Los componentes Astro analytics ahora usan variables globales para prevenir listeners duplicados.

Cada componente verifica una flag global antes de adjuntar listeners:
- `CustomClickEvent`: `__analyticsClickListenerAttached`
- `CustomHoverEvent`: `__analyticsHoverListenerAttached`
- `CustomFormEvent`: `__analyticsFormListenerAttached`
- `CustomScrollEvent`: `__analyticsScrollListenerAttached`
- `CustomLoopEvent`: `__analyticsLoopListenerAttached`

Esto asegura que solo se adjunte **UN** listener por tipo de evento en toda la página, sin importar cuántas instancias del componente haya.

### Los eventos no aparecen en GTM

1. Verifica que `PUBLIC_GTM_ID` sea correcto
2. Abre console: `console.log(window.dataLayer)`
3. Deberías ver un array con tus eventos

### Los eventos no aparecen en PostHog

1. Verifica que `PUBLIC_POSTHOG_KEY` sea correcto
2. Abre console: `console.log(window.posthog)`
3. Verifica la región (US vs EU) en PostHog settings

### Modo testing no funciona

1. Verifica `PUBLIC_LIVE_TESTING=true` (sin comillas)
2. Reinicia el dev server
3. Verifica en console que aparece `[TEST]` prefix

### Hydration mismatch warnings en React

Si ves warnings de React sobre "hydration mismatch" con `data-tracker-id`:

1. **Causa**: Los IDs se generaban tanto en servidor (SSR) como cliente, produciendo valores diferentes
2. **Solución aplicada**: Los IDs ahora se generan solo en el cliente usando `useState` + `useEffect`
3. **Resultado**: El atributo `data-tracker-id` no aparece durante SSR, solo después de la hidratación en el cliente

Este comportamiento es esperado y no afecta la funcionalidad del tracking.

## 📚 Recursos

- [Skill Original](/.cursor/skills/implement-astro-analytics/SKILL.md)
- [GTM Documentation](https://developers.google.com/tag-manager)
- [PostHog Documentation](https://posthog.com/docs)

---

**Implementado**: Febrero 8, 2026
**Versión**: 1.0.0
