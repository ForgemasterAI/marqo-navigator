import React from 'react';
import { DataProvider, HttpError } from '@refinedev/core';

export const dataProvider = (url: string): DataProvider => ({
    getOne: async ({ id, resource }) => {
        if (resource === 'indexes') {
            const response = await fetch(`${url}/${resource}/${id}/settings`);
            const statsResponse = await fetch(`${url}/${resource}/${id}/stats`);
            const data = await response.json();
            const stats = await statsResponse.json();
            return {
                data: {
                    id,
                    ...data,
                    stats,
                },
            };
        }

        const response = await fetch(`${url}/${resource}/${id}`);
        const data = await response.json();

        return {
            data,
        };
    },
    //ts-ignore
    create: async ({ resource, variables, meta }: any) => {
        let indexName = resource === 'indexes' ? variables.indexName : '';
        if (resource === 'indexes') {
            if (variables.tensorFields) {
                variables.tensorFields = variables.tensorFields.values;
                delete variables.indexName;
            }
            if (variables.type === 'unstructured') {
                // delete all fields
                delete variables.allFields;
                delete variables.tensorFields;
            }
        }
        const response = await fetch(`${url}/${resource}/${indexName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(variables),
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        return { data };
    },
    update: async () => {
        throw new Error('Not implemented');
    },
    deleteOne: async ({ resource, id, meta }: any) => {
        let result = {
            data: { id } as any,
        };
        if (resource === 'indexes') {
            const response = await fetch(`${url}/${resource}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            result = { data: { id } };
        }
        return result;
    },
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
        try {
            const query = new URLSearchParams();
            let response;
            if (pagination) {
                //ts-expect-error
                if (pagination.current !== undefined) {
                    query.append('page', pagination.current.toString());
                }
                //ts-expect-error
                if (pagination.pageSize !== undefined) {
                    query.append('pageSize', pagination.pageSize.toString());
                }
            }

            if (sorters) {
                sorters.forEach((sorter) => {
                    query.append(`sort[${sorter.field}]`, sorter.order);
                });
            }
            if (resource === 'indexes') {
                const data: any[] = [];
                response = await fetch(`${url}/${resource}`);
                const { results = [] } = await response.json();
                const indexList = results.map(async ({ indexName, idx }: any) => {
                    const indexSettings = await fetch(`${url}/${resource}/${indexName}/settings`);
                    const detail = await indexSettings.json();
                    const indexStats = await fetch(`${url}/${resource}/${indexName}/stats`);
                    const { numberOfDocuments, numberOfVectors, backend: statsBackend } = await indexStats.json();
                    const indexHealth = await fetch(`${url}/${resource}/${indexName}/health`);
                    const { status, inference, backend: healthBackend } = await indexHealth.json();

                    data.push({
                        id: indexName,
                        ...detail,
                        numberOfDocuments,
                        numberOfVectors,
                        status,
                        inference,
                        backend: {
                            ...statsBackend,
                            ...healthBackend,
                        },
                    });
                });

                await Promise.all(indexList);

                return {
                    data: data
                        .map((item: any) => ({
                            id: item.indexName,
                            ...item,
                        }))
                        .sort(),
                    total: results.length,
                };
            }
            if (resource === 'documents') {
                const { index } = filters as any;
                console.debug('fetching documents', index);

                response = await fetch(`${url}/indexes/${index}/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: '',
                        searchMethod: 'HYBRID',
                        limit: 10,
                    }),
                });
                const { hits: data = [] } = await response.json();

                return (response = {
                    data: data.map((item: any) => ({
                        id: item._id,
                        ...item,
                    })),
                    total: 0,
                });
            }

            return response ?? { data: [], total: 0 };
        } catch (error) {
            const httpError: HttpError = {
                message: (error as any)?.message || 'Something went wrong',
                statusCode: (error as any)?.status || 500,
            };
            return Promise.reject(httpError);
        }
    },
    custom: async ({ url, method, filters, sorters, payload, query, headers, meta = {} }: any): Promise<any> => {
        // make meta required
        if (!meta.action) {
            throw new Error('Meta action is required');
        }
        switch (meta.action) {
            case 'cudaInfo': {
                const result = await fetch(`${url}/device/cuda`);

                const data = await result.json().catch((error) => {
                    console.error('Error fetching cuda info', error);
                    return {
                        cuda: {
                            version: 'N/A',
                            devices: [],
                        },
                    };
                })
                return {
                    data,
                };
            }
            case 'cpuInfo': {
                const result = await fetch(`${url}/device/cpu`);

                const data = await result.json();
                return {
                    data,
                };
            }
            case 'addDocuments': {
                // Handle document uploads to an index
                const response = await fetch(url, {
                    method: method || 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(headers || {}),
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || response.statusText || `Failed to add documents (${response.status})`);
                }

                const data = await response.json();
                return { data };
            }
            default: {
                throw new Error('Invalid method');
            }
        }
    },
    getApiUrl: () => url,
});
