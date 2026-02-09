/**
 * CustomClickEvent REACT COMPONENT
 * 
 * PURPOSE: Track click events in React components without visual wrappers
 * PATTERN: Headless - uses display:contents + data attributes
 * DEPENDENCIES: utils.ts, hooks.ts
 * OUTPUT: Invisible <span> wrapper that captures clicks via event delegation
 * 
 * REACT-SPECIFIC NOTES:
 * - Uses useEffect for event delegation setup
 * - Works with SSR (Astro SSR) - data attributes render, listeners attach on client
 * - Compatible with all Astro client directives (client:load, client:idle, etc.)
 * - Properly cleans up listeners on unmount
 * 
 * USAGE EXAMPLES:
 * 
 * Basic:
 * <CustomClickEvent eventName="button_click">
 *   <button>Click Me</button>
 * </CustomClickEvent>
 * 
 * With data and React state:
 * <CustomClickEvent 
 *   eventName="add_to_cart"
 *   productId={product.id}
 *   quantity={count}
 * >
 *   <button onClick={() => setCount(c => c + 1)}>
 *     Add to Cart
 *   </button>
 * </CustomClickEvent>
 * 
 * Nested (only innermost fires):
 * <CustomClickEvent eventName="card_click">
 *   <div className="card">
 *     <CustomClickEvent eventName="button_click">
 *       <button>Buy Now</button>  ← Only button_click fires
 *     </CustomClickEvent>
 *   </div>
 * </CustomClickEvent>
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generateContextId, mergeEventData } from '@/lib/analytics/utils';
import { useIsTestingMode } from '@/lib/analytics/hooks';

// ============================================================================
// PROPS & TYPES
// ============================================================================

interface CustomClickEventProps {
  eventName: string;                    // Required: Event identifier
  eventData?: Record<string, any>;      // Optional: Explicit event data
  children: ReactNode;                  // React children to wrap
  [key: string]: any;                   // Props spread: any extra prop becomes event data
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomClickEvent({
  eventName,
  eventData = {},
  children,
  ...additionalProps
}: CustomClickEventProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const isTestingMode = useIsTestingMode();
  
  // ============================================================================
  // DATA PREPARATION
  // ============================================================================
  
  // Generate stable ID only on client to avoid hydration mismatch
  const [trackerId, setTrackerId] = useState<string | null>(null);
  
  useEffect(() => {
    // Only generate ID on client-side
    if (typeof window !== 'undefined' && !trackerId) {
      setTrackerId(generateContextId());
    }
  }, []);
  
  // Merge event data with testing mode support
  const finalEventData = mergeEventData(
    eventName, 
    eventData, 
    additionalProps,
    isTestingMode
  );
  
  // ============================================================================
  // EVENT DELEGATION SETUP
  // ============================================================================
  
  useEffect(() => {
    // Guard: only run on client
    if (typeof window === 'undefined') return;
    
    let listenerAttached = false;
    
    const attachClickListener = () => {
      // Guard: only attach once globally
      if (listenerAttached || (window as any).__analyticsClickListenerAttached) return;
      
      // Global click listener with event delegation
      const clickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // Find nearest tracker using closest()
        // This automatically handles nested trackers (innermost wins)
        const trackedElement = target.closest('[data-analytics-click]');
        
        if (trackedElement) {
          const eventName = trackedElement.getAttribute('data-click-event');
          const eventDataStr = trackedElement.getAttribute('data-click-data');
          
          if (eventName && eventDataStr) {
            try {
              const eventData = JSON.parse(eventDataStr);
              
              // Push to GTM
              if (window.dataLayer) {
                window.dataLayer.push(eventData);
              }
              
              // Push to PostHog
              if (window.posthog) {
                const { event, ...properties } = eventData;
                window.posthog.capture(event, properties);
              }
              
              // Debug logging
              if (import.meta.env.PUBLIC_ANALYTICS_DEBUG === 'true') {
                console.log('[CustomClickEvent] Event tracked:', eventData);
              }
            } catch (error) {
              console.error('[CustomClickEvent] Error parsing event data:', error);
            }
          }
        }
      };
      
      // Attach listener in capture phase
      document.addEventListener('click', clickHandler, { capture: true });
      
      // Mark as attached globally
      (window as any).__analyticsClickListenerAttached = true;
      listenerAttached = true;
    };
    
    // Attach immediately or on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachClickListener);
    } else {
      attachClickListener();
    }
    
    // Cleanup: In React, we don't remove the global listener
    // because multiple instances share it. It stays for the app lifetime.
    return () => {
      // No cleanup needed - global listener persists
    };
  }, []); // Empty deps - only run once
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-analytics-click
      data-click-event={eventName}
      data-click-data={JSON.stringify(finalEventData)}
      {...(trackerId && { 'data-tracker-id': trackerId })}
    >
      {children}
    </span>
  );
}
