/**
 * CustomScrollEvent REACT COMPONENT
 * 
 * PURPOSE: Track scroll depth milestones (25%, 50%, 75%, 100%)
 * PATTERN: Headless with scroll event delegation + debouncing
 * DEPENDENCIES: utils.ts, hooks.ts
 * OUTPUT: Invisible wrapper that tracks scroll progress through element
 * 
 * KEY CONCEPTS:
 * - Debounced scroll listener for performance
 * - Tracks scroll percentage relative to element, not page
 * - Fires once per milestone (25%, 50%, 75%, 100%)
 * - Configurable milestones array
 * 
 * USAGE EXAMPLES:
 * 
 * Basic (default milestones):
 * <CustomScrollEvent eventName="article_read">
 *   <article>
 *     <h1>Long Article</h1>
 *     <p>Content...</p>
 *   </article>
 * </CustomScrollEvent>
 * 
 * Custom milestones:
 * <CustomScrollEvent 
 *   eventName="video_scroll"
 *   milestones={[10, 50, 90]}
 * >
 *   <div className="video-section">...</div>
 * </CustomScrollEvent>
 * 
 * With additional data:
 * <CustomScrollEvent 
 *   eventName="product_description_read"
 *   productId={product.id}
 *   milestones={[25, 50, 75, 100]}
 * >
 *   <div className="description">...</div>
 * </CustomScrollEvent>
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generateContextId, mergeEventData } from '@/lib/analytics/utils';
import { useIsTestingMode } from '@/lib/analytics/hooks';

// ============================================================================
// PROPS & TYPES
// ============================================================================

interface CustomScrollEventProps {
  eventName: string;
  eventData?: Record<string, any>;
  milestones?: number[];               // Scroll percentages to track (default: [25, 50, 75, 100])
  children: ReactNode;
  [key: string]: any;
}

// ============================================================================
// HELPER: DEBOUNCE
// ============================================================================

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  } as T;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomScrollEvent({
  eventName,
  eventData = {},
  milestones = [25, 50, 75, 100],
  children,
  ...additionalProps
}: CustomScrollEventProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const childRef = useRef<Element | null>(null);
  const trackedMilestones = useRef<Set<number>>(new Set());
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
  // SCROLL TRACKING SETUP
  // ============================================================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current) return;
    
    // Get the actual child element
    childRef.current = wrapperRef.current.firstElementChild;
    if (!childRef.current) return;
    
    const childElement = childRef.current as HTMLElement;
    
    const handleScroll = () => {
      if (!childElement) return;
      
      const rect = childElement.getBoundingClientRect();
      const elementHeight = childElement.scrollHeight || childElement.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll percentage for this element
      const elementTop = rect.top + window.scrollY;
      const elementBottom = elementTop + elementHeight;
      const scrollPosition = window.scrollY + windowHeight;
      
      let scrollPercent = 0;
      if (scrollPosition >= elementBottom) {
        scrollPercent = 100;
      } else if (scrollPosition > elementTop) {
        const visibleHeight = scrollPosition - elementTop;
        scrollPercent = Math.min((visibleHeight / elementHeight) * 100, 100);
      }
      
      // Check which milestones have been reached
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedMilestones.current.has(milestone)) {
          // The eventData already comes structured from mergeEventData
          // We just need to add scroll-specific properties
          const eventDataToSend = {
            ...finalEventData,
            eventData: {
              ...finalEventData.eventData,
              scrollDepth: milestone,
              scrollPercent: Math.round(scrollPercent)
            }
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
            console.log('[CustomScrollEvent] Milestone tracked:', eventDataToSend);
          }
          
          // Mark milestone as tracked
          trackedMilestones.current.add(milestone);
        }
      });
    };
    
    // Debounce scroll handler for performance
    const debouncedScroll = debounce(handleScroll, 100);
    
    // Attach scroll listener
    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, [eventName, milestones, finalEventData, isTestingMode]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-analytics-scroll
      data-scroll-event={eventName}
      data-scroll-milestones={JSON.stringify(milestones)}
      {...(trackerId && { 'data-tracker-id': trackerId })}
    >
      {children}
    </span>
  );
}
