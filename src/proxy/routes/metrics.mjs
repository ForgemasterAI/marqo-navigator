import client from 'prom-client';
import { initializeMetrics } from './metrics.config.mjs';

const metrics = initializeMetrics();

export async function fetchIndexStats(MARQO_API_URL) {
    try {
        const response = await fetch(`${MARQO_API_URL}/indexes`);
        const { results: indexes = [] } = await response.json();

        const indexPromises = indexes.map(async ({ indexName }) => {
            const statsResponse = await fetch(`${MARQO_API_URL}/indexes/${indexName}/stats`);
            const stats = await statsResponse.json();
            metrics.numberOfDocumentsGauge.set({ indexName }, stats.numberOfDocuments);
            metrics.numberOfVectorsGauge.set({ indexName }, stats.numberOfVectors);
        });

        await Promise.all(indexPromises);

        const modelsList = await fetch(`${MARQO_API_URL}/models`);
        const { models = [] } = await modelsList.json().catch(() => ({ models: [] }));

        if(models.filter(model => model.model_device === 'cuda').length > 0) {
            const cudaResponse = await fetch(`${MARQO_API_URL}/device/cuda`);
            const { cuda_devices = [] } = await cudaResponse.json().catch(() => ({ cuda_devices: [] }));

            const cudaPromises = cuda_devices.map(device => {
                const { device_id, memory_used, total_memory, utilization, device_name } = device;
                metrics.cudaMemoryUsedGauge.set({ device: device_id, device_name }, parseFloat(memory_used));
                metrics.cudaMemoryTotalGauge.set({ device: device_id, device_name }, parseFloat(total_memory));
                metrics.cudaUtilizationGauge.set({ device: device_id, device_name }, parseFloat(utilization));
            });

            await Promise.all(cudaPromises);
        }
    } catch (error) {
        console.error('Error fetching index or CUDA stats:', error);
    }
}

export const metricsMiddleware = async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
};