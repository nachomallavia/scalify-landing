/**
 * CustomTimeEvent REACT COMPONENT
 * 
 * PURPOSE: Track time spent with element visible in viewport
 * PATTERN: Headless with IntersectionObserver + interval reporting
 * DEPENDENCIES: utils.ts, hooks.ts
 * OUTPUT: Invisible wrapper that measures engagement time
 * 
 * KEY CONCEPTS:
 * - Uses IntersectionObserver to detect visibility
 * - Only counts time when element is visible (>= threshold)
 * - Reports periodically (default every 10 seconds)
 * - Automatically pauses/resumes as user scrolls
 * - Sends final report on page unload
 * 
 * USAGE EXAMPLES:
 * 
 * Basic (10s intervals, 50% visible):
 * <CustomTimeEvent eventName="video_engagement">
 *   <video src="demo.mp4" controls />
 * </CustomTimeEvent>
 * 
 * Quick intervals (5s reports):
 * <CustomTimeEvent 
 *   eventName="article_engagement"
 *   interval={5000}
 * >
 *   <article>Long content...</article>
 * </CustomTimeEvent>
 * 
 * High threshold (90% visible):
 * <CustomTimeEvent 
 *   eventName="hero_attention"
 *   threshold={0.9}
 *   interval={3000}
 * >
 *   <section className="hero">...</section>
 * </CustomTimeEvent>
 * 
 * USE CASES:
 * - Videos: Track watch time without video API
 * - Articles: Measure reading engagement
 * - Products: Time spent viewing details
 * - Infographics: Attention to visual content
 * - Forms: Time spent filling (combined with CustomFormEvent)
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generateContextId, mergeEventData } from '@/lib/analytics/utils';
import { useIsTestingMode } from '@/lib/analytics/hooks';

// ============================================================================
// PROPS & TYPES
// ============================================================================

interface CustomTimeEventProps {
  eventName: string;
  eventData?: Record<string, any>;
  interval?: number;                    // Report interval in ms (default: 10000)
  threshold?: number;                   // Visibility threshold 0-1 (default: 0.5)
  children: ReactNode;
  [key: string]: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomTimeEvent({
  eventName,
  eventData = {},
  interval = 10000,
  threshold = 0.5,
  children,
  ...additionalProps
}: CustomTimeEventProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const childRef = useRef<Element | null>(null);
  const isTestingMode = useIsTestingMode();
  
  // Time tracking state
  const tracker = useRef({
    startTime: null as number | null,
    totalTime: 0,
    intervalTimer: null as ReturnType<typeof setInterval> | null,
    isVisible: false,
  });
  
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
  // HELPER: UPDATE TIME
  // ============================================================================
  
  const updateTime = () => {
    if (!tracker.current.isVisible || !tracker.current.startTime) return;
    
    const now = Date.now();
    tracker.current.totalTime += (now - tracker.current.startTime);
    tracker.current.startTime = now;
  };
  
  // ============================================================================
  // HELPER: REPORT TIME
  // ============================================================================
  
  const reportTime = () => {
    const eventDataToSend = {
      ...finalEventData,
      timeSpent: Math.round(tracker.current.totalTime / 1000), // seconds
      timeSpentMs: tracker.current.totalTime,
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
      console.log('[CustomTimeEvent] Time tracked:', eventDataToSend);
    }
  };
  
  // ============================================================================
  // INTERSECTION OBSERVER SETUP
  // ============================================================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current) return;
    
    // Get the actual child element
    childRef.current = wrapperRef.current.firstElementChild;
    if (!childRef.current) return;
    
    const childElement = childRef.current as HTMLElement;
    
    // Create IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            // Element became visible
            if (!tracker.current.isVisible) {
              tracker.current.isVisible = true;
              tracker.current.startTime = Date.now();
              
              // Start interval reporting
              tracker.current.intervalTimer = setInterval(() => {
                updateTime();
                reportTime();
              }, interval);
            }
          } else {
            // Element became hidden
            if (tracker.current.isVisible) {
              updateTime();
              tracker.current.isVisible = false;
              tracker.current.startTime = null;
              
              // Clear interval
              if (tracker.current.intervalTimer) {
                clearInterval(tracker.current.intervalTimer);
                tracker.current.intervalTimer = null;
              }
            }
          }
        });
      },
      { threshold }
    );
    
    // Start observing
    observer.observe(childElement);
    
    // Cleanup
    return () => {
      observer.disconnect();
      
      if (tracker.current.intervalTimer) {
        clearInterval(tracker.current.intervalTimer);
      }
    };
  }, [interval, threshold, finalEventData, isTestingMode]);
  
  // ============================================================================
  // FINAL REPORT ON UNMOUNT
  // ============================================================================
  
  useEffect(() => {
    // Report final time on page unload
    const handleUnload = () => {
      if (tracker.current.isVisible) {
        updateTime();
      }
      if (tracker.current.totalTime > 0) {
        reportTime();
      }
    };
    
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      
      // Also report on component unmount
      if (tracker.current.isVisible) {
        updateTime();
      }
      if (tracker.current.totalTime > 0) {
        reportTime();
      }
    };
  }, [finalEventData]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-analytics-time
      data-time-event={eventName}
      data-time-interval={interval}
      data-time-threshold={threshold}
      {...(trackerId && { 'data-tracker-id': trackerId })}
    >
      {children}
    </span>
  );
}
