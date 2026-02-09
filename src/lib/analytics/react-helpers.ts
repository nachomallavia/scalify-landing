/**
 * React Analytics Helpers
 * 
 * Helper functions to track events from React components.
 * These functions push events to dataLayer (GTM) and PostHog.
 */

declare global {
  interface Window {
    dataLayer: any[];
    posthog?: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
    };
  }
}

interface AnalyticsEvent {
  eventName: string;
  [key: string]: any;
}

/**
 * Track a custom event
 * @param eventName - Name of the event
 * @param properties - Additional properties to track
 */
export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  // Get testing mode from environment
  const testingMode = import.meta.env.LIVE_TESTING === "true";
  const debugMode = import.meta.env.PUBLIC_ANALYTICS_DEBUG === "true";

  // Add [TEST] prefix if in testing mode
  const finalEventName = testingMode ? `[TEST] ${eventName}` : eventName;

  // Add environment to properties
  const finalProperties = {
    ...properties,
    environment: testingMode ? "testing" : "production",
  };

  // Push to GTM dataLayer
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: finalEventName,
      ...finalProperties,
    });

    if (debugMode) {
      console.log("[Analytics] GTM Event:", finalEventName, finalProperties);
    }
  }

  // Push to PostHog
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.capture(finalEventName, finalProperties);

    if (debugMode) {
      console.log("[Analytics] PostHog Event:", finalEventName, finalProperties);
    }
  }
}

/**
 * Track a click event
 * @param location - Where the click happened (e.g., "navbar", "hero", "footer")
 * @param properties - Additional properties
 */
export function trackClick(location: string, properties: Record<string, any> = {}) {
  trackEvent("click", {
    location,
    ...properties,
  });
}

/**
 * Track a CTA click
 * @param ctaText - Text of the CTA
 * @param location - Where the CTA is located
 * @param properties - Additional properties
 */
export function trackCtaClick(ctaText: string, location: string, properties: Record<string, any> = {}) {
  trackEvent("cta_click", {
    ctaText,
    location,
    ...properties,
  });
}

/**
 * Track a navigation link click
 * @param linkText - Text of the link
 * @param linkUrl - URL of the link
 * @param location - Where the link is located
 */
export function trackNavClick(linkText: string, linkUrl: string, location: string) {
  trackEvent("nav_click", {
    linkText,
    linkUrl,
    location,
  });
}

/**
 * Track a social media link click
 * @param socialNetwork - Name of the social network
 * @param location - Where the link is located
 */
export function trackSocialClick(socialNetwork: string, location: string) {
  trackEvent("social_click", {
    socialNetwork,
    location,
  });
}

/**
 * Track form submission
 * @param formName - Name of the form
 * @param location - Where the form is located
 * @param properties - Additional properties
 */
export function trackFormSubmit(formName: string, location: string, properties: Record<string, any> = {}) {
  trackEvent("form_submit", {
    formName,
    location,
    ...properties,
  });
}

/**
 * Track form error
 * @param formName - Name of the form
 * @param errorMessage - Error message
 * @param location - Where the form is located
 */
export function trackFormError(formName: string, errorMessage: string, location: string) {
  trackEvent("form_error", {
    formName,
    errorMessage,
    location,
  });
}
