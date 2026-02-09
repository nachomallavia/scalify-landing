/**
 * CustomLoopEvent REACT COMPONENT
 * 
 * PURPOSE: Track clicks on items in loops/lists with auto-enrichment
 * PATTERN: Headless with automatic loop metadata injection
 * DEPENDENCIES: utils.ts, hooks.ts
 * OUTPUT: Invisible wrapper that enriches events with loop context
 * 
 * AUTO-ENRICHMENT:
 * - loopIndex: Position in array
 * - loopName: Identifier for the list
 * - loopTotal: Total items (optional)
 * - Item properties: Automatically spread from `item` prop
 * 
 * USAGE EXAMPLES:
 * 
 * Product list:
 * {products.map((product, index) => (
 *   <CustomLoopEvent
 *     key={product.id}
 *     eventName="product_click"
 *     item={product}
 *     index={index}
 *     loopName="featured_products"
 *   >
 *     <ProductCard product={product} />
 *   </CustomLoopEvent>
 * ))}
 * 
 * With total count:
 * <CustomLoopEvent
 *   eventName="article_click"
 *   item={article}
 *   index={i}
 *   loopName="related_articles"
 *   loopTotal={articles.length}
 * >
 *   <ArticlePreview article={article} />
 * </CustomLoopEvent>
 * 
 * TRACKED DATA EXAMPLE:
 * {
 *   event: 'product_click',
 *   environment: 'production',
 *   loopIndex: 2,
 *   loopName: 'featured_products',
 *   loopTotal: 10,
 *   // Item properties automatically included:
 *   id: 123,
 *   name: 'Red Shoes',
 *   price: 99.99,
 *   category: 'footwear'
 * }
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generateContextId, mergeEventData } from '@/lib/analytics/utils';
import { useIsTestingMode } from '@/lib/analytics/hooks';

// ============================================================================
// PROPS & TYPES
// ============================================================================

interface CustomLoopEventProps {
  eventName: string;
  item: Record<string, any>;            // The loop item (auto-spread as properties)
  index: number;                        // Position in loop
  loopName?: string;                    // Identifier for the list
  loopTotal?: number;                   // Total items in loop
  eventData?: Record<string, any>;
  children: ReactNode;
  [key: string]: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomLoopEvent({
  eventName,
  item,
  index,
  loopName,
  loopTotal,
  eventData = {},
  children,
  ...additionalProps
}: CustomLoopEventProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
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
  
  // Build loop metadata
  const loopMetadata: Record<string, any> = {
    loopIndex: index,
  };
  
  if (loopName) {
    loopMetadata.loopName = loopName;
  }
  
  if (loopTotal !== undefined) {
    loopMetadata.loopTotal = loopTotal;
    loopMetadata.loopPosition = `${index + 1}/${loopTotal}`;
  }
  
  // Extract safe properties from item
  // Filter out functions, symbols, and large objects
  const itemProps: Record<string, any> = {};
  if (item && typeof item === 'object') {
    for (const [key, value] of Object.entries(item)) {
      // Only include primitive values and simple objects
      if (
        value !== null &&
        value !== undefined &&
        typeof value !== 'function' &&
        typeof value !== 'symbol'
      ) {
        // For objects/arrays, convert to string to avoid circular refs
        if (typeof value === 'object') {
          try {
            itemProps[key] = JSON.stringify(value);
          } catch {
            // Skip if can't stringify (circular reference)
          }
        } else {
          itemProps[key] = value;
        }
      }
    }
  }
  
  // Merge all data sources
  const finalEventData = mergeEventData(
    eventName,
    { ...eventData, ...loopMetadata, ...itemProps },
    additionalProps,
    isTestingMode
  );
  
  // ============================================================================
  // EVENT DELEGATION SETUP
  // ============================================================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let listenerAttached = false;
    
    const attachLoopListener = () => {
      if (listenerAttached || (window as any).__analyticsLoopListenerAttached) return;
      
      const clickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const loopItem = target.closest('[data-analytics-loop-item]');
        
        if (loopItem) {
          const eventName = loopItem.getAttribute('data-loop-event');
          const eventDataStr = loopItem.getAttribute('data-loop-data');
          
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
                console.log('[CustomLoopEvent] Event tracked:', eventData);
              }
            } catch (error) {
              console.error('[CustomLoopEvent] Error parsing event data:', error);
            }
          }
        }
      };
      
      document.addEventListener('click', clickHandler, { capture: true });
      (window as any).__analyticsLoopListenerAttached = true;
      listenerAttached = true;
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachLoopListener);
    } else {
      attachLoopListener();
    }
    
    return () => {
      // Global listener persists
    };
  }, []);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-analytics-loop-item
      data-loop-event={eventName}
      data-loop-data={JSON.stringify(finalEventData)}
      data-loop-index={index}
      {...(trackerId && { 'data-tracker-id': trackerId })}
    >
      {children}
    </span>
  );
}
