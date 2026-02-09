// Window extensions for GTM and PostHog
declare global {
  interface Window {
    dataLayer?: any[];
    posthog?: any;
    gtmInitialized?: boolean;
    posthogInitialized?: boolean;
  }
}

// Event data structure
export interface AnalyticsEventData {
  event: string;
  [key: string]: any;
}

// Component props interfaces
export interface BaseTrackerProps {
  eventName: string;
  eventData?: Record<string, any>;
}

export interface PageData {
  pageCategory?: string;
  pageType?: string;
  pageTitle?: string;
  pagePath?: string;
  [key: string]: any;
}

export {};
