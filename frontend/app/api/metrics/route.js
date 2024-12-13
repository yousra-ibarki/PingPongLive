import { getMetrics } from '../../../lib/monitoring';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const metrics = getMetrics();
        let prometheusMetrics = '';

        // Convert metrics to Prometheus format
        Object.entries(metrics).forEach(([key, value]) => {
            prometheusMetrics += `# TYPE ${key} gauge\n${key} ${value}\n`;
        });

        // Return metrics in Prometheus format
        return new NextResponse(prometheusMetrics, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        console.error('Metrics error:', error);
        return new NextResponse('Error generating metrics', {
            status: 500,
        });
    }
}