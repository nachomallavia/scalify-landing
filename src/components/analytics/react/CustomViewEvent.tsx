/**
 * CustomViewEvent REACT COMPONENT
 * 
 * PURPOSE: Track when elements become visible using IntersectionObserver
 * PATTERN: Headless with IntersectionObserver API
 * DEPENDENCIES: utils.ts, hooks.ts
 * OUTPUT: Invisible wrapper that tracks visibility
 * 
 * KEY CONCEPTS:
 * - Uses IntersectionObserver for efficient visibility detection
 * - Configurable threshold (0-1, default 0.5 = 50% visible)
 * - Optional "fire once" mode (default) or continuous tracking
 * - Works with SSR - observer attaches on client
 * 
 * USAGE EXAMPLES:
 * 
 * Basic (fires when 50% visible):
 * <CustomViewEvent eventName="product_view">
 *   <div className="product-card">...</div>
 * </CustomViewEvent>
 * 
 * High threshold (90% visible to fire):
 * <CustomViewEvent 
 *   eventName="hero_view"
 *   threshold={0.9}
 * >
 *   <section className="hero">...</section>
 * </CustomViewEvent>
 * 
 * Continuous tracking (fires every time):
 * <CustomViewEvent 
 *   eventName="sidebar_view"
 *   once={false}
 * >
 *   <aside>...</aside>
 * </CustomViewEvent>
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generateContextId, mergeEventData } from '@/lib/analytics/utils';
import { useIsTestingMode } from '@/lib/analytics/hooks';

// ============================================================================
// PROPS & TYPES
// ============================================================================

interface CustomViewEventProps {
  eventName: string;
  eventData?: Record<string, any>;
  threshold?: number;                   // 0-1, how much visible to trigger (default 0.5)
  once?: boolean;                       // Fire only once? (default true)
  children: ReactNode;
  [key: string]: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomViewEvent({
  eventName,
  eventData = {},
  threshold = 0.5,
  once = true,
  children,
  ...additionalProps
}: CustomViewEventProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const childRef = useRef<Element | null>(null);
  const hasFired = useRef(false);
  const isTestingMode = useIsTestingMode();
  
  // ============================================================================
  // DATA PREPARATION
  // ============================================================================
  
  const [trackerId, setTrackerId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !trackerId) {
      setTrackerId(generateContextId());
    }
  }, []);
  
  const finalEventData = mergeEventData(
    eventName,
    eventData,
    additionalProps,
    isTestingMode
  );
  
  // ============================================================================
  // INTERSECTION OBSERVER SETUP
  // ============================================================================
  
  useEffect(() => {
    // Guard: only run on client
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current) return;
    
    // Get the actual child element (wrapper has display:contents)
    childRef.current = wrapperRef.current.firstElementChild;
    if (!childRef.current) return;
    
    // Create IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Check if element is intersecting (visible)
          if (entry.isIntersecting) {
            // If "once" mode and already fired, skip
            if (once && hasFired.current) return;
            
            // Mark as fired
            hasFired.current = true;
            
            // Track the view event
            const eventDataToSend = {
              ...finalEventData,
              visibilityRatio: entry.intersectionRatio,
            };
            
            // Push to GTM
            if (window.dataLayer) {
              window.dataLayer.push(eventDataToSend);
            }
            
            // Push to PostHog
            if (window.posthog) {
              const { event, ...properties } = eventDataToSend;
              window.posthog.capture(event, properties);
            }
            
            // Debug logging
            if (import.meta.env.PUBLIC_ANALYTICS_DEBUG === 'true') {
              console.log('[CustomViewEvent] Event tracked:', eventDataToSend);
            }
            
            // If "once" mode, disconnect observer
            if (once) {
              observer.disconnect();
            }
          } else {
            // Element left viewport
            // Reset hasFired if not in "once" mode
            if (!once) {
              hasFired.current = false;
            }
          }
        });
      },
      {
        threshold, // Visibility threshold
        rootMargin: '0px',
      }
    );
    
    // Start observing
    observer.observe(childRef.current);
    
    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, [eventName, threshold, once, finalEventData, isTestingMode]); // Re-observe if config changes
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-analytics-view
      data-view-event={eventName}
      data-view-threshold={threshold}
      data-view-once={once}
      {...(trackerId && { 'data-tracker-id': trackerId })}
    >
      {children}
    </span>
  );
}
