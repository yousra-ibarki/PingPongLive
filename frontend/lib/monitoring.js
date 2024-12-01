import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

// Initialize metrics
let metrics = {
    CLS: 0,
    FID: 0,
    LCP: 0,
    FCP: 0,
    TTFB: 0,
    pageViews: 0,
    jsErrors: 0,
    routeChangeErrors: 0,
    authErrors: 0
};

// Report Web Vitals
export function reportWebVitals() {
    getCLS((metric) => metrics.CLS = metric.value);
    getFID((metric) => metrics.FID = metric.value);
    getLCP((metric) => metrics.LCP = metric.value);
    getFCP((metric) => metrics.FCP = metric.value);
    getTTFB((metric) => metrics.TTFB = metric.value);
}

// Track page views
export function trackPageView() {
    metrics.pageViews++;
}

// Track JS errors
export function trackJsError(error) {
    metrics.jsErrors++;
    console.error('JS Error:', error);
}

// Track authentication errors
export function trackAuthError(error) {
    metrics.authErrors++;
    console.error('Auth Error:', error);
}

// Track route change errors
export function trackRouteChangeError(error) {
    metrics.routeChangeErrors++;
    console.error('Route Change Error:', error);
}

// Get metrics endpoint
export function getMetrics() {
    return {
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