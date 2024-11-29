// frontend/lib/metrics.ts
class CustomMetric {
  private value: number = 0;
  private labels: Record<string, string>[] = [];

  constructor(
    private name: string,
    private help: string,
    private type: 'counter' | 'gauge' | 'histogram'
  ) {}

  inc(labels: Record<string, string> = {}) {
    this.value++;
    this.labels.push(labels);
  }

  observe(labels: Record<string, string> = {}, value: number) {
    this.value = value;
    this.labels.push(labels);
  }

  getMetrics() {
    return `# HELP ${this.name} ${this.help}
# TYPE ${this.name} ${this.type}
${this.name} ${this.value}`;
  }
}

// Create custom metrics
export const pageViews = new CustomMetric(
  'frontend_page_views_total',
  'Total number of page views',
  'counter'
);

export const navigationTiming = new CustomMetric(
  'frontend_navigation_timing_seconds',
  'Navigation timing metrics',
  'histogram'
);

export const userInteractions = new CustomMetric(
  'frontend_user_interactions_total',
  'Total number of user interactions',
  'counter'
);

// Function to get all metrics
export async function getMetrics() {
  const metrics = [
    pageViews,
    navigationTiming,
    userInteractions
  ].map(metric => metric.getMetrics()).join('\n\n');

  return metrics;
}