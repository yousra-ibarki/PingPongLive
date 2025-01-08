// Import Web Vitals measurement functions
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

// Initialize a metrics object to store all measurements
let metrics = {
    CLS: 0,    // Cumulative Layout Shift - measures visual stability
    FID: 0,    // First Input Delay - measures interactivity
    LCP: 0,    // Largest Contentful Paint - measures loading performance
    FCP: 0,    // First Contentful Paint - measures when first content appears
    TTFB: 0,   // Time to First Byte - measures server response time
    pageViews: 0,         // Counter for page views
    jsErrors: 0,          // Counter for JavaScript errors
    routeChangeErrors: 0,  // Counter for navigation errors
    authErrors: 0         // Counter for authentication errors
};

// Function to set up Web Vitals measurement
export function reportWebVitals() {
    // Each of these sets up a callback that updates the corresponding metric
    onCLS((metric) => metrics.CLS = metric.value);  // Track layout shifts
    onFID((metric) => metrics.FID = metric.value);  // Track input delay
    onLCP((metric) => metrics.LCP = metric.value);  // Track largest content paint
    onFCP((metric) => metrics.FCP = metric.value);  // Track first content paint
    onTTFB((metric) => metrics.TTFB = metric.value);// Track time to first byte
}

// Function to increment page view counter
export function trackPageView() {
    metrics.pageViews++;
}

// Function to track JavaScript errors
export function trackJsError(error) {
    metrics.jsErrors++;
    console.error('JS Error:', error);
}

// Function to track authentication errors
export function trackAuthError(error) {
    metrics.authErrors++;
    console.error('Auth Error:', error);
}

// Function to track route change (navigation) errors
export function trackRouteChangeError(error) {
    metrics.routeChangeErrors++;
    console.error('Route Change Error:', error);
}

// Function to get all metrics in Prometheus-friendly format
export function getMetrics() {
    return {
        // Returns all metrics with standardized naming convention
        nextjs_cls_value: metrics.CLS,
        nextjs_fid_value: metrics.FID,
        nextjs_lcp_value: metrics.LCP,
        nextjs_fcp_value: metrics.FCP,
        nextjs_ttfb_value: metrics.TTFB,
        nextjs_page_views_total: metrics.pageViews,
        nextjs_js_errors_total: metrics.jsErrors,
        nextjs_auth_errors_total: metrics.authErrors,
        nextjs_route_change_errors_total: metrics.routeChangeErrors
    };
}