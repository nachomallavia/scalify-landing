/**
 * REACT HOOKS FOR ANALYTICS
 *
 * PURPOSE: React-specific utilities for analytics tracking
 * PATTERN: Custom hooks following React best practices
 * DEPENDENCIES: utils.ts for core analytics functions
 * OUTPUT: Hooks that can be used in React components
 *
 * These hooks provide imperative analytics tracking and utilities
 * for React components that need to track events programmatically
 * rather than using declarative wrapper components.
 */

import { useCallback, useEffect, useState } from "react";

import type { AnalyticsEventData } from "./types";
import { identifyUser as utilsIdentifyUser, pushToDataLayer } from "./utils";

// ============================================================================
// TESTING MODE HOOK
// ============================================================================

/**
 * useIsTestingMode - Detects if analytics is in testing mode
 *
 * Returns true when PUBLIC_LIVE_TESTING=true, indicating all events will:
 * - Have [TEST] prefix in event names
 * - Include environment: 'testing' field
 * - Go to testing GTM container / PostHog project
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const isTestingMode = useIsTestingMode();
 *
 *   return (
 *     <div>
 *       {isTestingMode && <Badge>Testing Mode</Badge>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsTestingMode(): boolean {
  // import.meta.env is resolved at build time, so we can read it directly
  // No need for useEffect or useState
  return import.meta.env.PUBLIC_LIVE_TESTING === "true";
}

// ============================================================================
// IMPERATIVE TRACKING HOOK
// ============================================================================

/**
 * useTrackEvent - Imperative event tracking
 *
 * Returns a stable callback function for tracking events programmatically.
 * Useful for tracking events that aren't triggered by user interaction
 * on a specific element (e.g., API responses, timers, complex logic).
 *
 * The returned function automatically:
 * - Applies [TEST] prefix if in testing mode
 * - Adds environment field
 * - Pushes to both GTM and PostHog
 *
 * Usage:
 * ```tsx
 * function Checkout() {
 *   const trackEvent = useTrackEvent();
 *
 *   const handlePayment = async () => {
 *     try {
 *       await processPayment();
 *       trackEvent('payment_success', {
 *         amount: 99.99,
 *         currency: 'USD'
 *       });
 *     } catch (error) {
 *       trackEvent('payment_error', {
 *         error: error.message
 *       });
 *     }
 *   };
 *
 *   return <button onClick={handlePayment}>Pay Now</button>;
 * }
 * ```
 */
export function useTrackEvent() {
  return useCallback(
    (eventName: string, eventData?: Record<string, any>): void => {
      // Check testing mode from build-time env var
      const isTestingMode = import.meta.env.PUBLIC_LIVE_TESTING === "true";
      
      // Apply [TEST] prefix if in testing mode
      const finalEventName = isTestingMode ? `[TEST] ${eventName}` : eventName;

      // Add environment field
      const environment = isTestingMode ? "testing" : "production";

      // Build complete event data
      const completeEventData: AnalyticsEventData = {
        event: finalEventName,
        environment,
        ...eventData,
      };

      // Push to analytics platforms
      pushToDataLayer(completeEventData);
    },
    [], // No dependencies needed since import.meta.env is constant at build time
  );
}

// ============================================================================
// USER IDENTIFICATION HOOK
// ============================================================================

/**
 * useIdentifyUser - User identification for analytics
 *
 * Returns a stable callback for identifying users in analytics platforms.
 * This is essential for:
 * - PostHog session replay (requires identified users in privacy-first mode)
 * - User-specific analytics and cohorts
 * - Cross-device tracking
 *
 * Call this after successful login/signup.
 *
 * Usage:
 * ```tsx
 * function LoginForm() {
 *   const identifyUser = useIdentifyUser();
 *
 *   const handleLogin = async (credentials) => {
 *     const user = await login(credentials);
 *
 *     // Identify user in analytics
 *     identifyUser(user.id, {
 *       email: user.email,
 *       plan: user.subscription.plan,
 *       signupDate: user.createdAt,
 *     });
 *   };
 *
 *   return <form onSubmit={handleLogin}>...</form>;
 * }
 * ```
 */
export function useIdentifyUser() {
  return useCallback((userId: string, userData?: Record<string, any>): void => {
    // Delegate to utils function
    // This handles both GTM and PostHog identification
    utilsIdentifyUser(userId, userData);
  }, []);
}

// ============================================================================
// ANALYTICS READY HOOK
// ============================================================================

/**
 * useAnalyticsReady - Check if analytics platforms are loaded
 *
 * Returns the loading state of GTM and PostHog. Useful for:
 * - Showing loading indicators
 * - Conditionally rendering analytics-dependent UI
 * - Debugging analytics setup
 *
 * Usage:
 * ```tsx
 * function AnalyticsDebugPanel() {
 *   const { gtm, posthog, isLoading } = useAnalyticsReady();
 *
 *   if (isLoading) return <div>Loading analytics...</div>;
 *
 *   return (
 *     <div>
 *       <StatusBadge label="GTM" active={gtm} />
 *       <StatusBadge label="PostHog" active={posthog} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnalyticsReady(): {
  gtm: boolean;
  posthog: boolean;
  isLoading: boolean;
} {
  const [state, setState] = useState({
    gtm: false,
    posthog: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check on mount and after a delay (give scripts time to load)
    const checkReady = () => {
      if (typeof window === "undefined") return;

      const gtm = Boolean(window.gtmInitialized && window.dataLayer);
      const posthog = Boolean(window.posthogInitialized && window.posthog);

      setState({
        gtm,
        posthog,
        isLoading: false,
      });
    };

    // Check immediately
    checkReady();

    // Check again after 1 second (scripts might still be loading)
    const timeout = setTimeout(checkReady, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return state;
}

// ============================================================================
// PAGEVIEW TRACKING HOOK
// ============================================================================

/**
 * usePageView - Automatic page view tracking
 *
 * Tracks a page view event when the component mounts.
 * Useful for tracking page views in single-page applications
 * where navigation doesn't trigger full page reloads.
 *
 * Note: For regular Astro pages, use AnalyticsSetup in the layout instead.
 * This hook is for React-controlled routing (e.g., React Router in Astro).
 *
 * Usage:
 * ```tsx
 * function ProductPage({ productId }) {
 *   usePageView('product_page', {
 *     productId,
 *     productCategory: 'electronics',
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePageView(pageName: string, pageData?: Record<string, any>): void {
  const trackEvent = useTrackEvent();

  useEffect(() => {
    trackEvent("page_view", {
      pageName,
      ...pageData,
    });
    // Only track on mount (when page changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName]);
}
