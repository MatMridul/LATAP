// Error Handler - Maps error_code to UX behavior per ERROR_HANDLING_MAP.md

import { APIError } from './apiClient';

export interface ErrorAction {
  type: 'redirect' | 'modal' | 'toast' | 'inline' | 'banner';
  message: string;
  redirectTo?: string;
  ctaText?: string;
  ctaAction?: string;
}

export function handleAPIError(error: APIError): ErrorAction {
  const { error_code } = error;

  // Authentication Errors
  if (error_code === 'AUTH_MISSING_TOKEN' || error_code === 'AUTH_INVALID_TOKEN') {
    return {
      type: 'redirect',
      message: error_code === 'AUTH_INVALID_TOKEN' 
        ? 'Session invalid. Please log in again'
        : 'Please log in to continue',
      redirectTo: '/login',
    };
  }

  if (error_code === 'AUTH_EXPIRED') {
    return {
      type: 'redirect',
      message: 'Session expired. Please log in again',
      redirectTo: '/login',
    };
  }

  // Verification Errors
  if (error_code === 'VERIFICATION_INACTIVE') {
    return {
      type: 'modal',
      message: 'Institution Verification Required',
      ctaText: 'Verify Now',
      ctaAction: '/verification',
    };
  }

  if (error_code === 'VERIFICATION_EXPIRED') {
    return {
      type: 'banner',
      message: 'Your verification has expired',
      ctaText: 'Re-verify',
      ctaAction: '/verification',
    };
  }

  // Subscription Errors
  if (error_code === 'SUBSCRIPTION_EXPIRED') {
    return {
      type: 'modal',
      message: 'Premium Subscription Expired',
      ctaText: 'Renew Now',
      ctaAction: '/subscription/renew',
    };
  }

  if (error_code === 'SUBSCRIPTION_LIMIT_REACHED') {
    return {
      type: 'modal',
      message: "You've reached your monthly limit",
      ctaText: 'Upgrade to Premium',
      ctaAction: '/subscription/upgrade',
    };
  }

  if (error_code === 'SUBSCRIPTION_REQUIRED') {
    return {
      type: 'modal',
      message: 'Premium Feature',
      ctaText: 'Upgrade Now',
      ctaAction: '/subscription/plans',
    };
  }

  // Opportunity Errors
  if (error_code === 'OPPORTUNITY_NOT_FOUND') {
    return {
      type: 'inline',
      message: 'Opportunity not found. It may have been deleted or expired.',
    };
  }

  if (error_code === 'OPPORTUNITY_NOT_ACTIVE') {
    return {
      type: 'inline',
      message: 'This opportunity is no longer accepting applications',
    };
  }

  if (error_code === 'OPPORTUNITY_EXPIRED') {
    return {
      type: 'inline',
      message: 'Application deadline has passed',
    };
  }

  // Default
  return {
    type: 'toast',
    message: error.safe_message || 'Something went wrong. Please try again.',
  };
}
