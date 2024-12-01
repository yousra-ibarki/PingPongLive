import { getMetrics } from '../../lib/monitoring';

export default function handler(req, res) {
    if (req.method === 'GET') {
        const metrics = getMetrics();
        let prometheusMetrics = '';

        Object.entries(metrics).forEach(([key, value]) => {
            prometheusMetrics += `# TYPE ${key} gauge\n${key} ${value}\n`;
        });

        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(prometheusMetrics);
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}