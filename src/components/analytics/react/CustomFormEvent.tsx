/**
 * CustomFormEvent REACT COMPONENT
 * 
 * PURPOSE: Track form interactions (start, submit, errors) with detailed validation info
 * PATTERN: Headless with ValidityState API integration
 * DEPENDENCIES: utils.ts, hooks.ts
 * OUTPUT: Invisible wrapper that tracks form events
 * 
 * TRACKED EVENTS:
 * - Form start: User focuses first field
 * - Form submit: Form submitted successfully
 * - Form error: Validation errors on submit
 * 
 * VALIDATION TRACKING:
 * - Uses browser's ValidityState API
 * - Tracks specific error types (valueMissing, typeMismatch, etc.)
 * - Captures field names (safe) and optionally values (risky)
 * - Tracks timing: how long to complete, how many attempts
 * 
 * USAGE EXAMPLES:
 * 
 * Basic:
 * <CustomFormEvent
 *   eventNameSubmit="contact_form_submit"
 *   eventNameError="contact_form_error"
 * >
 *   <form>
 *     <input type="email" name="email" required />
 *     <button type="submit">Send</button>
 *   </form>
 * </CustomFormEvent>
 * 
 * With custom data:
 * <CustomFormEvent
 *   eventNameSubmit="newsletter_subscribe"
 *   formName="newsletter"
 *   formLocation="footer"
 * >
 *   <form>...</form>
 * </CustomFormEvent>
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generateContextId, mergeEventData } from '@/lib/analytics/utils';
import { useIsTestingMode } from '@/lib/analytics/hooks';

// ============================================================================
// PROPS & TYPES
// ============================================================================

interface CustomFormEventProps {
  eventNameSubmit: string;
  eventNameError: string;
  eventNameStart?: string;
  eventData?: Record<string, any>;
  trackFieldNames?: boolean;            // Track field names? (default true, safe)
  trackFieldValues?: boolean;           // Track field values? (default false, risky)
  children: ReactNode;
  [key: string]: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomFormEvent({
  eventNameSubmit,
  eventNameError,
  eventNameStart,
  eventData = {},
  trackFieldNames = true,
  trackFieldValues = false,
  children,
  ...additionalProps
}: CustomFormEventProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const isTestingMode = useIsTestingMode();
  
  // Form metrics
  const metrics = useRef({
    startTime: 0,
    submitAttempts: 0,
    fieldsInteracted: new Set<string>(),
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
  
  const baseEventData = mergeEventData(
    'form_event',
    eventData,
    additionalProps,
    isTestingMode
  );
  
  // ============================================================================
  // HELPER: GET FIELD ERROR DETAILS
  // ============================================================================
  
  const getFieldErrorDetails = (field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
    const validity = field.validity;
    const errors: string[] = [];
    const details: Record<string, any> = {};
    
    if (validity.valueMissing) {
      errors.push('valueMissing');
      details.required = true;
    }
    if (validity.typeMismatch) {
      errors.push('typeMismatch');
      details.expectedType = (field as HTMLInputElement).type;
    }
    if (validity.patternMismatch) {
      errors.push('patternMismatch');
      details.pattern = field.getAttribute('pattern') || 'unknown';
    }
    if (validity.tooShort) {
      errors.push('tooShort');
      details.minLength = (field as HTMLInputElement).minLength;
      details.currentLength = field.value.length;
    }
    if (validity.tooLong) {
      errors.push('tooLong');
      details.maxLength = (field as HTMLInputElement).maxLength;
    }
    if (validity.rangeUnderflow) {
      errors.push('rangeUnderflow');
      details.min = (field as HTMLInputElement).min;
    }
    if (validity.rangeOverflow) {
      errors.push('rangeOverflow');
      details.max = (field as HTMLInputElement).max;
    }
    if (validity.stepMismatch) {
      errors.push('stepMismatch');
      details.step = (field as HTMLInputElement).step;
    }
    if (validity.badInput) {
      errors.push('badInput');
    }
    if (validity.customError) {
      errors.push('customError');
      details.customMessage = field.validationMessage;
    }
    
    return { errors, details };
  };
  
  // ============================================================================
  // FORM EVENT HANDLERS
  // ============================================================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current) return;
    
    // Get form element
    formRef.current = wrapperRef.current.querySelector('form');
    if (!formRef.current) return;
    
    const form = formRef.current;
    
    // Track form start (first focus)
    const handleFocus = (e: FocusEvent) => {
      const field = e.target as HTMLElement;
      
      // Only track form fields
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(field.tagName)) return;
      
      // Track start time on first interaction
      if (metrics.current.startTime === 0) {
        metrics.current.startTime = Date.now();
        
        // Fire start event if configured
        if (eventNameStart) {
          const startEventData = {
            ...baseEventData,
            event: isTestingMode ? `[TEST] ${eventNameStart}` : eventNameStart,
            formStartTime: new Date().toISOString(),
          };
          
          if (window.dataLayer) window.dataLayer.push(startEventData);
          if (window.posthog) {
            const { event, ...properties } = startEventData;
            window.posthog.capture(event, properties);
          }
        }
      }
      
      // Track interacted fields
      const fieldName = (field as HTMLInputElement).name;
      if (fieldName) {
        metrics.current.fieldsInteracted.add(fieldName);
      }
    };
    
    // Track form submit
    const handleSubmit = (e: Event) => {
      metrics.current.submitAttempts++;
      
      // Check if form is valid
      const isValid = form.checkValidity();
      
      if (isValid) {
        // SUCCESS - Form submitted
        const timeToComplete = metrics.current.startTime 
          ? Date.now() - metrics.current.startTime 
          : 0;
        
        const submitEventData = {
          ...baseEventData,
          event: isTestingMode ? `[TEST] ${eventNameSubmit}` : eventNameSubmit,
          formTimeToComplete: timeToComplete,
          formSubmitAttempts: metrics.current.submitAttempts,
          formFieldsInteracted: metrics.current.fieldsInteracted.size,
        };
        
        if (trackFieldNames) {
          submitEventData.formFields = Array.from(metrics.current.fieldsInteracted);
        }
        
        if (window.dataLayer) window.dataLayer.push(submitEventData);
        if (window.posthog) {
          const { event, ...properties } = submitEventData;
          window.posthog.capture(event, properties);
        }
        
        if (import.meta.env.PUBLIC_ANALYTICS_DEBUG === 'true') {
          console.log('[CustomFormEvent] Form submitted:', submitEventData);
        }
      } else {
        // ERROR - Validation failed
        const invalidFields: any[] = [];
        const formElements = form.elements;
        
        for (let i = 0; i < formElements.length; i++) {
          const field = formElements[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          
          if (field.validity && !field.validity.valid) {
            const { errors, details } = getFieldErrorDetails(field);
            
            const fieldError: any = {
              fieldName: trackFieldNames ? field.name : 'redacted',
              fieldType: (field as HTMLInputElement).type || field.tagName.toLowerCase(),
              errors,
              ...details,
            };
            
            if (trackFieldValues) {
              fieldError.fieldValue = field.value;
            }
            
            invalidFields.push(fieldError);
          }
        }
        
        const errorEventData = {
          ...baseEventData,
          event: isTestingMode ? `[TEST] ${eventNameError}` : eventNameError,
          formSubmitAttempts: metrics.current.submitAttempts,
          formErrorCount: invalidFields.length,
          formInvalidFields: invalidFields,
        };
        
        if (window.dataLayer) window.dataLayer.push(errorEventData);
        if (window.posthog) {
          const { event, ...properties } = errorEventData;
          window.posthog.capture(event, properties);
        }
        
        if (import.meta.env.PUBLIC_ANALYTICS_DEBUG === 'true') {
          console.log('[CustomFormEvent] Form errors:', errorEventData);
        }
      }
    };
    
    // Attach listeners
    form.addEventListener('focusin', handleFocus, { capture: true });
    form.addEventListener('submit', handleSubmit);
    
    // Cleanup
    return () => {
      form.removeEventListener('focusin', handleFocus, { capture: true });
      form.removeEventListener('submit', handleSubmit);
    };
  }, [
    eventNameSubmit, 
    eventNameError, 
    eventNameStart, 
    trackFieldNames, 
    trackFieldValues,
    baseEventData,
    isTestingMode
  ]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <span
      ref={wrapperRef}
      style={{ display: 'contents' }}
      data-analytics-form
      data-form-event-submit={eventNameSubmit}
      data-form-event-error={eventNameError}
      {...(trackerId && { 'data-tracker-id': trackerId })}
    >
      {children}
    </span>
  );
}
