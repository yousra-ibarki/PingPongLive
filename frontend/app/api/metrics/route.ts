// frontend/app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';

export async function GET() {
  try {
    const metrics = await getMetrics();
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    // Return a fallback metric indicating service is down
    return new NextResponse(
      '# HELP frontend_up Frontend availability\n# TYPE frontend_up gauge\nfrontend_up 0',
      {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        },
      }
    );
  }
}