// frontend/app/Components/MetricsInitializer.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pageViews, navigationTiming, userInteractions } from '@/lib/metrics';

export default function MetricsInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Track page views
      pageViews.inc({ page: pathname });

      // Track performance metrics
      if (typeof window !== 'undefined' && window.performance) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              navigationTiming.observe(
                { metric: 'load_time' }, 
                navEntry.loadEventEnd / 1000
              );
            }
          });
        });

        observer.observe({ entryTypes: ['navigation'] });

        // Track user interactions
        const handleClick = () => {
          userInteractions.inc({ type: 'click' });
        };

        window.addEventListener('click', handleClick);

        return () => {
          observer.disconnect();
          window.removeEventListener('click', handleClick);
        };
      }
    } catch (error) {
      console.error('Error in MetricsInitializer:', error);
    }
  }, [pathname]);

  return null;
}