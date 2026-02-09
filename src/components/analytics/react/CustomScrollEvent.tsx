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
 * <CustomScrollEvent 
 *   eventName="section_scroll_percent"
 *   scrollSectionName="Hero"
 * >
 *   <article>
 *     <h1>Long Article</h1>
 *     <p>Content...</p>
 *   </article>
 * </CustomScrollEvent>
 * 
 * Custom milestones:
 * <CustomScrollEvent 
 *   eventName="video_scroll"
 *   scrollSectionName="VideoSection"
 *   milestones={[10, 50, 90]}
 * >
 *   <div className="video-section">...</div>
 * </CustomScrollEvent>
 * 
 * With additional data:
 * <CustomScrollEvent 
 *   eventName="product_description_read"
 *   scrollSectionName="ProductDetails"
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
  scrollSectionName?: string;          // Identifies which section is being scrolled
  children: ReactNode;
  [key: string]: any;
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
  // HYBRID TRACKING: IntersectionObserver + Scroll Listener
  // ============================================================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current) return;
    
    // Get the actual child element
    childRef.current = wrapperRef.current.firstElementChild;
    if (!childRef.current) return;
    
    const childElement = childRef.current as HTMLElement;
    let isVisible = false;
    
    // Function to calculate scroll progress through element
    const calculateScrollProgress = (): number => {
      const rect = childElement.getBoundingClientRect();
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Element not yet in viewport
      if (rect.bottom < 0) return 100; // Scrolled past
      if (rect.top > windowHeight) return 0; // Not yet reached
      
      // Calculate scroll progress
      // When element.top = windowHeight, progress = 0%
      // When element.bottom = 0, progress = 100%
      const scrollProgress = Math.max(0, windowHeight - rect.top);
      const maxProgress = elementHeight + windowHeight;
      
      return Math.min((scrollProgress / maxProgress) * 100, 100);
    };
    
    // Function to check and track milestones
    const checkMilestones = () => {
      if (!isVisible) return; // Only check when element is visible
      
      const scrollPercent = calculateScrollProgress();
      const sortedMilestones = [...milestones].sort((a, b) => a - b);
      
      // Track milestones in sequential order
      for (const milestone of sortedMilestones) {
        if (scrollPercent >= milestone && !trackedMilestones.current.has(milestone)) {
          // Check if all previous milestones were tracked
          const previousMilestones = sortedMilestones.filter(m => m < milestone);
          const allPreviousTracked = previousMilestones.every(m => trackedMilestones.current.has(m));
          
          if (allPreviousTracked || previousMilestones.length === 0) {
            // Track this milestone
            const eventDataToSend = {
              ...finalEventData,
              scrollDepth: milestone,
              scrollPercent: Math.round(scrollPercent),
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
            
            trackedMilestones.current.add(milestone);
            break; // One milestone per scroll event
          }
        }
      }
    };
    
    // Create IntersectionObserver to detect visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          
          if (isVisible) {
            // Element became visible - check immediately
            checkMilestones();
          }
        });
      },
      {
        threshold: [0], // Just detect when element enters/exits viewport
        rootMargin: '0px'
      }
    );
    
    // Start observing
    observer.observe(childElement);
    
    // Attach scroll listener
    const handleScroll = () => checkMilestones();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
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
