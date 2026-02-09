/**
 * CustomHoverEvent REACT COMPONENT
 * 
 * PURPOSE: Track hover events with configurable duration threshold
 * PATTERN: Headless with mouseenter/mouseleave listeners
 * DEPENDENCIES: utils.ts, hooks.ts
 * OUTPUT: Invisible wrapper that tracks meaningful hovers
 * 
 * KEY CONCEPTS:
 * - Only fires if user hovers for minimum duration (default 1000ms)
 * - Fires once per element (not on every hover)
 * - Useful for measuring interest without commitment (click)
 * - Timer is cancelled if user leaves before duration
 * 
 * USAGE EXAMPLES:
 * 
 * Basic (1 second hover):
 * <CustomHoverEvent eventName="product_interest">
 *   <div className="product-card">
 *     <img src={product.image} />
 *     <h3>{product.name}</h3>
 *   </div>
 * </CustomHoverEvent>
 * 
 * Quick hover (500ms):
 * <CustomHoverEvent 
 *   eventName="menu_item_hover"
 *   duration={500}
 * >
 *   <button>Menu Item</button>
 * </CustomHoverEvent>
 * 
 * Long hover (3 seconds):
 * <CustomHoverEvent 
 *   eventName="deep_interest"
 *   duration={3000}
 *   productId={product.id}
 * >
 *   <div className="detailed-view">...</div>
 * </CustomHoverEvent>
 * 
 * USE CASES:
 * - E-commerce: Track product interest without clicks
 * - Navigation: Measure menu item consideration
 * - Tooltips: Track which help content users read
 * - Pricing: Track which plans users compare
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generateContextId, mergeEventData } from '@/lib/analytics/utils';
import { useIsTestingMode } from '@/lib/analytics/hooks';

// ============================================================================
// PROPS & TYPES
// ============================================================================

interface CustomHoverEventProps {
  eventName: string;
  eventData?: Record<string, any>;
  duration?: number;                    // Minimum hover duration in ms (default: 1000)
  children: ReactNode;
  [key: string]: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomHoverEvent({
  eventName,
  eventData = {},
  duration = 1000,
  children,
  ...additionalProps
}: CustomHoverEventProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const childRef = useRef<Element | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTracked = useRef(false);
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
  // HOVER TRACKING SETUP
  // ============================================================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current) return;
    
    // Get the actual child element
    childRef.current = wrapperRef.current.firstElementChild;
    if (!childRef.current) return;
    
    const childElement = childRef.current as HTMLElement;
    
    // Mouse enter - start timer
    const handleMouseEnter = () => {
      // Don't track if already tracked
      if (hasTracked.current) return;
      
      hoverTimer.current = setTimeout(() => {
        // Track the hover event
        const eventDataToSend = {
          ...finalEventData,
          hoverDuration: duration,
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
          console.log('[CustomHoverEvent] Event tracked:', eventDataToSend);
        }
        
        // Mark as tracked
        hasTracked.current = true;
      }, duration);
    };
    
    // Mouse leave - cancel timer
    const handleMouseLeave = () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }
    };
    
    // Attach listeners
    childElement.addEventListener('mouseenter', handleMouseEnter);
    childElement.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup
    return () => {
      childElement.removeEventListener('mouseenter', handleMouseEnter);
      childElement.removeEventListener('mouseleave', handleMouseLeave);
      
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, [duration, finalEventData, isTestingMode]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-analytics-hover
      data-hover-event={eventName}
      data-hover-duration={duration}
      {...(trackerId && { 'data-tracker-id': trackerId })}
    >
      {children}
    </span>
  );
}
