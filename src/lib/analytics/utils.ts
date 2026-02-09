/**
 * ANALYTICS UTILITIES
 *
 * PURPOSE: Foundation layer providing cross-platform analytics utilities
 * PATTERN: Pure functions with side effects to window.dataLayer and window.posthog
 * DEPENDENCIES: types.ts for TypeScript interfaces
 * OUTPUT: Pushes events to GTM dataLayer and PostHog capture API
 *
 * This is the most important file in the analytics system. Every event
 * flows through these utilities regardless of which tracker component
 * initiated it.
 */

import type { AnalyticsEventData, PageData } from "./types";

// ============================================================================
// CORE TRACKING FUNCTIONS
// ============================================================================

/**
 * pushToDataLayer - Unified event dispatcher for both GTM and PostHog
 *
 * This is THE central function that all events flow through. It handles:
 * - Pushing to GTM's dataLayer array (processed by GTM container)
 * - Capturing in PostHog (sent directly to PostHog API)
 * - Debug logging when PUBLIC_ANALYTICS_DEBUG=true
 *
 * IMPORTANT: This function can be called BEFORE GTM/PostHog scripts load.
 * - dataLayer is just an array - pushes queue up in memory
 * - When GTM loads, it processes the backlog
 * - PostHog does the same with its capture queue
 *
 * Example:
 * pushToDataLayer({
 *   event: 'button_click',
 *   button_id: 'cta',
 *   button_text: 'Get Started'
 * });
 */
export function pushToDataLayer(data: AnalyticsEventData): void {
  // Push to GTM
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(data);

    if (import.meta.env.PUBLIC_ANALYTICS_DEBUG === "true") {
      console.log("[Analytics] Event pushed to GTM:", data);
    }
  }

  // Push to PostHog
  if (typeof window !== "undefined" && window.posthog) {
    const { event, ...properties } = data;
    window.posthog.capture(event, properties);

    if (import.meta.env.PUBLIC_ANALYTICS_DEBUG === "true") {
      console.log("[Analytics] Event pushed to PostHog:", event, properties);
    }
  }
}

/**
 * trackPageView - Convenience wrapper for page view events
 *
 * Automatically adds the 'page_view' event name and spreads page metadata.
 * Called by GTMSetup and PostHogSetup during initialization.
 *
 * Example:
 * trackPageView({
 *   pageCategory: 'marketing',
 *   pageType: 'landing',
 *   pageTitle: 'Home'
 * });
 */
export function trackPageView(pageData: PageData): void {
  pushToDataLayer({
    event: "page_view",
    ...pageData,
  });
}

/**
 * identifyUser - Associates analytics events with a specific user
 *
 * PostHog behavior:
 * - Calls posthog.identify() to link anonymous session to user ID
 * - Enables person profiles and user-specific tracking
 * - Required for PostHog session replay (privacy-first mode)
 *
 * GTM behavior:
 * - Pushes user_identify event to dataLayer
 * - Makes userId available to all GTM tags and triggers
 *
 * Call this after successful login/signup:
 * identifyUser('user_12345', {
 *   email: 'user@example.com',
 *   plan: 'premium'
 * });
 */
export function identifyUser(userId: string, userData?: Record<string, any>): void {
  // PostHog identify
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.identify(userId, userData);

    if (import.meta.env.PUBLIC_ANALYTICS_DEBUG === "true") {
      console.log("[Analytics] User identified:", userId, userData);
    }
  }

  // GTM user data
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "user_identify",
      userId,
      ...userData,
    });
  }
}

// ============================================================================
// UTM & ATTRIBUTION
// ============================================================================

/**
 * captureUTMParams - Extracts marketing attribution from URL query string
 *
 * Captures the 5 standard UTM parameters:
 * - utm_source: Traffic source (e.g., "google", "facebook")
 * - utm_medium: Marketing medium (e.g., "cpc", "email")
 * - utm_campaign: Campaign name (e.g., "summer_sale")
 * - utm_term: Paid keywords (e.g., "analytics software")
 * - utm_content: A/B test variant (e.g., "hero_v2")
 *
 * Test URLs:
 * ?utm_source=google&utm_medium=cpc&utm_campaign=brand
 *
 * IMPORTANT: GTMSetup calls this automatically and stores results in
 * sessionStorage, so UTM data persists across page navigation within
 * the same session.
 *
 * Returns empty object if no UTM params found.
 */
export function captureUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((param) => {
    const value = urlParams.get(param);
    if (value) {
      utmParams[param] = value;
    }
  });

  return utmParams;
}

// ============================================================================
// ID GENERATION & UTILITIES
// ============================================================================

/**
 * generateContextId - Creates unique IDs for tracker components
 *
 * Uses crypto.randomUUID() when available (modern browsers), falls back
 * to timestamp + random string for older browsers.
 *
 * Format: "ctx-{uuid}" or "ctx-{timestamp}-{random}"
 *
 * Use cases:
 * - Identifying specific tracker instances for debugging
 * - AnalyticsContext uses this for context IDs
 * - Each headless component gets a unique tracker-id data attribute
 *
 * Example output: "ctx-a3f2b1c4-5d6e-7f8a-9b0c-1d2e3f4g5h6i"
 */
export function generateContextId(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return `ctx-${window.crypto.randomUUID()}`;
  }

  // Fallback for browsers without crypto.randomUUID
  return `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * debounce - Rate-limits function execution for performance
 *
 * Classic debounce pattern: delays function execution until a pause
 * in rapid-fire calls. Useful for scroll, resize, input events.
 *
 * How it works:
 * - On first call: sets a timer for `wait` milliseconds
 * - On subsequent calls: cancels previous timer, starts new one
 * - Function only executes after `wait` ms of silence
 *
 * Used by CustomScrollEvent to avoid tracking every single scroll pixel.
 *
 * Example:
 * const debouncedScroll = debounce(() => {
 *   console.log('Scroll settled');
 * }, 200);
 *
 * window.addEventListener('scroll', debouncedScroll);
 * // Only logs once user stops scrolling for 200ms
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * isAnalyticsReady - Health check for analytics platforms
 *
 * Returns initialization status for both GTM and PostHog.
 * Useful for conditional tracking or debugging.
 *
 * Checks:
 * - window.gtmInitialized flag (set by GTMSetup)
 * - window.dataLayer exists
 * - window.posthogInitialized flag (set by PostHogSetup)
 * - window.posthog object exists
 *
 * Example:
 * const { gtm, posthog } = isAnalyticsReady();
 * if (!gtm) console.warn('GTM not loaded yet');
 */
export function isAnalyticsReady(): { gtm: boolean; posthog: boolean } {
  if (typeof window === "undefined") {
    return { gtm: false, posthog: false };
  }

  return {
    gtm: Boolean(window.gtmInitialized && window.dataLayer),
    posthog: Boolean(window.posthogInitialized && window.posthog),
  };
}

// ============================================================================
// DATA MERGING & TRANSFORMATION
// ============================================================================

/**
 * mergeEventData - Implements "props spread" pattern for all trackers
 *
 * This is what makes the system flexible - ANY prop you pass to a tracker
 * component automatically becomes part of the tracked event data.
 *
 * Three sources merged in order (last wins):
 * 1. eventName: The event identifier
 * 2. eventData: Explicit data object prop
 * 3. additionalProps: All other component props (...rest pattern)
 *
 * Example component usage:
 * <CustomClickEvent
 *   eventName="product_click"
 *   eventData={{ category: 'shoes' }}
 *   productId={123}           ← Becomes event property
 *   productName="Red Shoe"    ← Becomes event property
 * />
 *
 * Result:
 * {
 *   event: 'product_click',
 *   category: 'shoes',
 *   productId: 123,
 *   productName: 'Red Shoe'
 * }
 *
 * EVENTDATA PATTERN:
 * All event-specific properties are grouped inside an 'eventData' object.
 * This ensures that each event completely replaces the previous event's
 * data in GTM's dataLayer, preventing any cross-contamination.
 * 
 * Structure:
 * - event: Event name (e.g., "cta_click")
 * - environment: "testing" or "production"
 * - eventData: { ...all event-specific properties }
 * 
 * Page-level properties (pageCategory, pageType) persist outside eventData
 * and are set once during page load by AnalyticsSetup.
 */
export function mergeEventData(
  eventName: string,
  eventData: Record<string, any> = {},
  additionalProps: Record<string, any> = {},
  isTestingMode: boolean = false,
): AnalyticsEventData {
  // Apply [TEST] prefix to event name if in testing mode
  const finalEventName = prefixEventName(eventName, isTestingMode);

  // Add environment field for easy filtering
  const environment = isTestingMode ? "testing" : "production";

  // Group all event-specific properties inside eventData object
  const mergedEventData = {
    ...eventData,
    ...additionalProps,
  };

  return {
    event: finalEventName,
    environment,
    eventData: mergedEventData, // All event-specific props grouped here
  };
}

/**
 * prefixEventName - Adds [TEST] prefix to event names in testing mode
 *
 * This makes testing events immediately visible in analytics dashboards
 * without needing to drill into individual event properties.
 *
 * Benefits:
 * - Visual identification at a glance in GTM Debugger
 * - Easy filtering in PostHog Live Events
 * - Prevents accidental analysis of test data
 * - Works alongside the 'environment' field for double safety
 *
 * Examples:
 * prefixEventName('button_click', false) → 'button_click'
 * prefixEventName('button_click', true) → '[TEST] button_click'
 * prefixEventName('form_submit', true) → '[TEST] form_submit'
 *
 * In GTM, you can filter out testing events with:
 * - Event Name does not start with [TEST]
 *
 * In PostHog, you can create cohorts based on:
 * - Event name contains [TEST]
 */
export function prefixEventName(eventName: string, isTestingMode: boolean): string {
  if (!isTestingMode) return eventName;

  // Avoid double-prefixing if already has [TEST]
  if (eventName.startsWith("[TEST]")) return eventName;

  return `[TEST] ${eventName}`;
}
