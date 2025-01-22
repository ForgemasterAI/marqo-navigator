import client from 'prom-client';

export const initializeMetrics = () => {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    collectDefaultMetrics();

    return {
        numberOfDocumentsGauge: new client.Gauge({
            name: 'index_number_of_documents',
            help: 'Number of documents in the index',
            labelNames: ['indexName'],
        }),
        numberOfVectorsGauge: new client.Gauge({
            name: 'index_number_of_vectors',
            help: 'Number of vectors in the index',
            labelNames: ['indexName'],
        }),
        cudaUtilizationGauge: new client.Gauge({
            name: 'cuda_utilization',
            help: 'CUDA device utilization',
            labelNames: ['device', 'device_name'],
        }),
        cudaMemoryUsedGauge: new client.Gauge({
            name: 'cuda_memory_used',
            help: 'CUDA device memory used',
            labelNames: ['device', 'device_name'],
        }),
        cudaMemoryTotalGauge: new client.Gauge({
            name: 'cuda_memory_total',
            help: 'CUDA device total memory',
            labelNames: ['device', 'device_name'],
        })
    };
};