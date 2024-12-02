import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

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
    onCLS((metric) => metrics.CLS = metric.value);
    onFID((metric) => metrics.FID = metric.value);
    onLCP((metric) => metrics.LCP = metric.value);
    onFCP((metric) => metrics.FCP = metric.value);
    onTTFB((metric) => metrics.TTFB = metric.value);
}

// Rest of your code remains the same
export function trackPageView() {
    metrics.pageViews++;
}

export function trackJsError(error) {
    metrics.jsErrors++;
    console.error('JS Error:', error);
}

export function trackAuthError(error) {
    metrics.authErrors++;
    console.error('Auth Error:', error);
}

export function trackRouteChangeError(error) {
    metrics.routeChangeErrors++;
    console.error('Route Change Error:', error);
}

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