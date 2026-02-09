# Astro Analytics Implementation Skill

## Description
Guides implementation of the Astro Analytics boilerplate (GTM + PostHog headless tracking system) into client Astro projects. Includes setup, configuration, integration, and testing mode.

## When to Use
Use this skill when the user asks to:
- Install analytics tracking in an Astro site
- Set up GTM or PostHog tracking
- Implement headless analytics components
- Add event tracking to Astro components
- Configure testing mode for client validation

## Prerequisites
- Astro v5+ project
- Node.js and npm/pnpm/yarn installed
- Access to GTM and/or PostHog accounts (optional for initial setup)

## Implementation Steps

### Step 1: Understand Project Structure

First, explore the target project to understand:
1. Current directory structure
2. Existing layouts (typically in `src/layouts/`)
3. Package manager in use (check for `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`)
4. TypeScript configuration (check `tsconfig.json`)

Ask the user:
- "¿Qué tipo de sitio es? (e-commerce, blog, marketing, app)"
- "¿Ya tenés GTM ID y PostHog Key configurados?"
- "¿Necesitás modo testing para validar en el sitio del cliente?"

### Step 2: Copy Core Files

Copy these directories from the Astro Analytics boilerplate:

```
Source → Target
src/components/analytics/ → src/components/analytics/
src/lib/analytics/ → src/lib/analytics/
```

Use the following command pattern:
```bash
# Assuming boilerplate is at ~/path/to/Astro-Analytics
cp -r ~/path/to/Astro-Analytics/src/components/analytics ./src/components/
cp -r ~/path/to/Astro-Analytics/src/lib/analytics ./src/lib/
```

**Files copied:**
- Core: `AnalyticsSetup.astro`, `GTMSetup.astro`, `PostHogSetup.astro`
- Headless: `CustomClickEvent.astro`, `CustomViewEvent.astro`, `CustomScrollEvent.astro`, `CustomFormEvent.astro`, `CustomHoverEvent.astro`, `CustomTimeEvent.astro`, `CustomLoopEvent.astro`, `AnalyticsContext.astro`
- Utils: `utils.ts`, `types.ts`

### Step 3: Configure Path Aliases

Update `tsconfig.json` to include path aliases if not present:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"]
    }
  }
}
```

### Step 4: Environment Variables Setup

Create or update `.env` with analytics configuration:

```env
# Google Tag Manager ID (obtener desde GTM admin)
PUBLIC_GTM_ID=GTM-XXXXXXX

# PostHog Project API Key (obtener desde PostHog settings)
PUBLIC_POSTHOG_KEY=phc_xxxxx

# Modo testing: para validación en sitio del cliente
LIVE_TESTING=false

# IDs de testing (opcionales, solo si LIVE_TESTING=true)
PUBLIC_GTM_TESTING_ID=
PUBLIC_POSTHOG_TESTING_ID=

# Habilitar modo debug (muestra logs en consola)
PUBLIC_ANALYTICS_DEBUG=false
```

**Important:** Add `.env` to `.gitignore` if not already there.

Update `.env.example` for team reference:
```bash
cp .env .env.example
# Then clear the values in .env.example
```

### Step 5: Integrate in Layout

Find the main layout file (typically `src/layouts/BaseLayout.astro` or similar) and add analytics setup in the `<head>`:

```astro
---
import AnalyticsSetup from '@/components/analytics/core/AnalyticsSetup.astro';

// ... other imports
---

<html lang="es">
  <head>
    <!-- Analytics Setup - must be in head -->
    <AnalyticsSetup 
      pageCategory="marketing"
      pageType="landing"
    />
    
    <!-- ... other head content -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Page metadata patterns:**
- `pageCategory`: "marketing", "product", "support", "blog", "checkout"
- `pageType`: "landing", "article", "product", "category", "cart", "thank-you"

### Step 6: Add Tracking to Components

#### Example 1: Track Button Clicks

```astro
---
import CustomClickEvent from '@/components/analytics/headless/CustomClickEvent.astro';
---

<CustomClickEvent 
  eventName="cta_click"
  location="hero"
  ctaText="Get Started"
>
  <button class="btn-primary">
    Get Started
  </button>
</CustomClickEvent>
```

#### Example 2: Track Product Views

```astro
---
import CustomViewEvent from '@/components/analytics/headless/CustomViewEvent.astro';
---

<CustomViewEvent 
  eventName="product_view"
  productId={product.id}
  productName={product.name}
  productPrice={product.price}
>
  <div class="product-card">
    <!-- product content -->
  </div>
</CustomViewEvent>
```

#### Example 3: Track Forms

```astro
---
import CustomFormEvent from '@/components/analytics/headless/CustomFormEvent.astro';
---

<CustomFormEvent 
  eventNameSubmit="contact_form_submit"
  eventNameError="contact_form_error"
  formName="contact"
>
  <form>
    <input type="email" name="email" required />
    <button type="submit">Send</button>
  </form>
</CustomFormEvent>
```

#### Example 4: Track Loops (Product Lists)

```astro
---
import CustomLoopEvent from '@/components/analytics/headless/CustomLoopEvent.astro';
---

{products.map((product, index) => (
  <CustomLoopEvent
    eventName="product_click"
    item={product}
    index={index}
    loopName="featured_products"
  >
    <article class="product">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </article>
  </CustomLoopEvent>
))}
```

### Step 7: Testing Mode Setup (Optional)

For client validation before go-live:

1. **Create testing GTM container:**
   - In GTM admin, duplicate production container
   - Name it "Client Name - Testing"
   - Get the testing GTM ID

2. **Create testing PostHog project:**
   - In PostHog, create new project "Client Name - Testing"
   - Get the testing API key

3. **Configure testing environment:**

```env
LIVE_TESTING=true
PUBLIC_GTM_TESTING_ID=GTM-TESTXXXX
PUBLIC_POSTHOG_TESTING_ID=phc_testxxxx
# Keep production IDs as fallback
PUBLIC_GTM_ID=GTM-PRODXXXX
PUBLIC_POSTHOG_KEY=phc_prodxxxx
```

**Testing mode benefits:**
- All events have `[TEST]` prefix (e.g., `[TEST] button_click`)
- All events include `environment: 'testing'` field
- Easy to filter out in production analytics
- Client can validate implementation without contaminating production data

### Step 8: Verification

After implementation, verify:

1. **Build succeeds:**
```bash
npm run build
```

2. **Check browser console:**
   - Set `PUBLIC_ANALYTICS_DEBUG=true`
   - Visit the site
   - Look for `[Analytics]` logs

3. **GTM Debugger:**
   - Open GTM Debugger
   - Navigate the site
   - Verify events appear
   - Check for `[TEST]` prefix if in testing mode

4. **PostHog Live Events:**
   - Open PostHog project
   - Go to "Activity" → "Live events"
   - Trigger actions on the site
   - Verify events appear in real-time

### Step 9: Production Deployment

Before production:

1. **Switch to production mode:**
```env
LIVE_TESTING=false
PUBLIC_ANALYTICS_DEBUG=false
```

2. **Verify environment variables** are set in hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Cloudflare Pages: Settings → Environment Variables

3. **Deploy and verify:**
   - Deploy to production
   - Use GTM Debugger to verify events (no `[TEST]` prefix)
   - Check PostHog for `environment: 'production'`

## Common Patterns

### E-commerce Tracking

```astro
<!-- Product detail page -->
<CustomViewEvent 
  eventName="product_detail_view"
  productId={product.id}
  productCategory={product.category}
  productPrice={product.price}
>
  <div class="product-detail">...</div>
</CustomViewEvent>

<!-- Add to cart button -->
<CustomClickEvent 
  eventName="add_to_cart"
  productId={product.id}
  quantity={1}
>
  <button>Add to Cart</button>
</CustomClickEvent>
```

### Blog Tracking

```astro
<!-- Article read tracking -->
<CustomScrollEvent 
  eventName="article_read"
  articleTitle={article.title}
  articleCategory={article.category}
  milestones={[25, 50, 75, 100]}
>
  <article>...</article>
</CustomScrollEvent>

<!-- Related articles -->
{relatedArticles.map((article, i) => (
  <CustomLoopEvent
    eventName="related_article_click"
    item={article}
    index={i}
    loopName="related_articles"
  >
    <a href={article.url}>{article.title}</a>
  </CustomLoopEvent>
))}
```

### Lead Generation

```astro
<!-- Contact form -->
<CustomFormEvent 
  eventNameSubmit="lead_form_submit"
  eventNameError="lead_form_error"
  formName="contact"
  formLocation="footer"
>
  <form>...</form>
</CustomFormEvent>

<!-- CTA tracking -->
<CustomClickEvent 
  eventName="cta_click"
  ctaLocation="hero"
  ctaType="primary"
>
  <button>Request Demo</button>
</CustomClickEvent>
```

## Troubleshooting

### Events not appearing in GTM

1. Check GTM container is published
2. Verify `PUBLIC_GTM_ID` is correct
3. Open GTM Debugger to see if container loads
4. Check browser console for errors
5. Verify `window.dataLayer` exists (console: `console.log(window.dataLayer)`)

### Events not appearing in PostHog

1. Verify `PUBLIC_POSTHOG_KEY` is correct
2. Check PostHog project settings (US vs EU region)
3. Verify `window.posthog` exists (console: `console.log(window.posthog)`)
4. Check PostHog SDK loads (Network tab, look for PostHog requests)
5. For session replay: verify user is identified with `identifyUser()`

### Testing mode not working

1. Verify `LIVE_TESTING=true` (no quotes, case-sensitive)
2. Check environment variables are loaded (restart dev server)
3. Enable debug mode: `PUBLIC_ANALYTICS_DEBUG=true`
4. Check browser console for `[Analytics]` logs showing `testingMode: true`
5. Verify events have `[TEST]` prefix in GTM Debugger

### TypeScript errors

1. Verify path aliases in `tsconfig.json`
2. Check `types.ts` is in correct location
3. Restart TypeScript server in IDE
4. Run `npm run build` to see full type errors

## Best Practices

1. **Start simple:** Begin with page views and main CTAs
2. **Use descriptive names:** `checkout_button_click` not `button_1`
3. **Keep data consistent:** Use same property names across events
4. **Test thoroughly:** Use testing mode before production
5. **Document events:** Maintain a spreadsheet of tracked events
6. **Monitor regularly:** Check GTM/PostHog weekly for data quality

## Success Checklist

- [ ] Core files copied to project
- [ ] Path aliases configured in `tsconfig.json`
- [ ] Environment variables set in `.env`
- [ ] `AnalyticsSetup` added to main layout
- [ ] At least 3 tracking components implemented
- [ ] Build succeeds without errors
- [ ] Events visible in GTM Debugger (or PostHog Live Events)
- [ ] Testing mode configured (if needed)
- [ ] Production deployment verified
- [ ] Client trained on how to view analytics

## Additional Resources

- GTM Debugger: Chrome extension "Google Tag Manager Debug"
- PostHog Documentation: https://posthog.com/docs
- Astro Documentation: https://docs.astro.build

## Notes

- The system is framework-agnostic - headless components don't modify client HTML
- All trackers use event delegation for performance (one listener per event type)
- The `[TEST]` prefix makes testing events immediately visible
- PostHog super properties ensure `environment` field on ALL events automatically
- Zero visual footprint - `display: contents` makes wrappers invisible to layout
