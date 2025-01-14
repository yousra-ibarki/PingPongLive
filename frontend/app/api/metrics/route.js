// // Import statements
// import { getMetrics } from '../../../lib/monitoring';  // Imports a custom function that collects metrics
// import { NextResponse } from 'next/server';           // Imports Next.js response handler

// // Define an async GET endpoint handler
// export async function GET() {
//     try {
//         // Get metrics data from your monitoring library
//         const metrics = getMetrics();
//         // Initialize an empty string to store formatted metrics
//         let prometheusMetrics = '';

//         // Convert metrics object into Prometheus format
//         Object.entries(metrics).forEach(([key, value]) => {
//             // For each metric:
//             // 1. '# TYPE {key} gauge' - Declares the metric type as a gauge
//             // 2. '{key} {value}'      - Provides the actual metric value
//             // \n adds newlines between entries
//             prometheusMetrics += `# TYPE ${key} gauge\n${key} ${value}\n`;
//         });

//         // Return the formatted metrics with proper headers
//         return new NextResponse(prometheusMetrics, {
//             status: 200,                    // Success status code
//             headers: {
//                 'Content-Type': 'text/plain', // Prometheus expects plain text format
//             },
//         });

//     } catch (error) {
//         // Error handling
//         console.error('Metrics error:', error);  // Log the error
//         return new NextResponse('Error generating metrics', {
//             status: 500,                        // Return 500 Internal Server Error
//         });
//     }
// }