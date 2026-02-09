/**
 * ANALYTICS REACT COMPONENTS - BARREL EXPORT
 * 
 * Centralized export for all React analytics components.
 * Allows clean imports like:
 * 
 * import { CustomClickEvent, CustomViewEvent } from '@/components/analytics/react';
 * 
 * instead of:
 * 
 * import { CustomClickEvent } from '@/components/analytics/react/CustomClickEvent';
 * import { CustomViewEvent } from '@/components/analytics/react/CustomViewEvent';
 */

// ============================================================================
// HEADLESS TRACKER COMPONENTS
// ============================================================================

export { CustomClickEvent } from './CustomClickEvent';
export { CustomViewEvent } from './CustomViewEvent';
export { CustomFormEvent } from './CustomFormEvent';
export { CustomLoopEvent } from './CustomLoopEvent';
export { CustomScrollEvent } from './CustomScrollEvent';
export { CustomHoverEvent } from './CustomHoverEvent';
export { CustomTimeEvent } from './CustomTimeEvent';

// ============================================================================
// RE-EXPORT HOOKS
// ============================================================================

// Re-export hooks for convenience
// Users can import from the same place
export {
  useIsTestingMode,
  useTrackEvent,
  useIdentifyUser,
  useAnalyticsReady,
  usePageView,
} from '@/lib/analytics/hooks';

// ============================================================================
// RE-EXPORT TYPES
// ============================================================================

// Re-export commonly used types
export type {
  AnalyticsEventData,
  PageData,
} from '@/lib/analytics/types';
