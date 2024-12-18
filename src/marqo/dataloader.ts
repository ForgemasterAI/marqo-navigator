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
        debugger;
        const response = await fetch(`${url}/${resource}/${id}`);
        const data = await response.json();
        debugger;
        return {
            data,
        };
    },
    //ts-ignore
    create: async ({ resource, variables, meta }: any) => {
        let indexName = resource === 'indexes' ? variables.indexName : '';
        if (resource === 'indexes') {
            if (variables.tensorFields) {
                debugger;
                variables.tensorFields = variables.tensorFields.values;
                delete variables.indexName;
                debugger;
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
            debugger;
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
            debugger;
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
            if (resource === 'indexes') {
                const data: any[] = [];
                response = await fetch(`${url}/${resource}`);
                const { results = [] } = await response.json();
                const indexList = results.map(async ({ indexName, idx }: any) => {
                    const indexResponse = await fetch(`${url}/${resource}/${indexName}/settings`);
                    const detail = await indexResponse.json();
                    data.push({
                        id: indexName,
                        ...detail,
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

            if (pagination) {
                query.append('page', pagination.current.toString());
                query.append('pageSize', pagination.pageSize.toString());
            }

            if (filters) {
                filters.forEach((filter) => {
                    query.append(`filter[${filter.field}]`, filter.value);
                });
            }

            if (sorters) {
                sorters.forEach((sorter) => {
                    query.append(`sort[${sorter.field}]`, sorter.order);
                });
            }

            response = await fetch(`${url}/${resource}?${query.toString()}`);

            if (!response.ok) {
                const error: HttpError = {
                    message: response.statusText,
                    statusCode: response.status,
                };
                return Promise.reject(error);
            }

            const data = await response.json();
            return {
                data: data.items,
                total: data.total,
            };
        } catch (error) {
            const httpError: HttpError = {
                message: error?.message || 'Something went wrong',
                statusCode: error?.status || 500,
            };
            return Promise.reject(httpError);
        }
    },
    custom: async ({ url, method, filters, sorters, payload, query, headers, meta = {} }): Promise<any> => {
        // make meta required
        if (!meta.method) {
            throw new Error('meta.method is required');
        }
        switch (meta.method) {
            case 'fetchIndexSummaries': {
                // implement logic here
            }
            case 'searchDocuments': {
            }
            case 'recommendDocuments': {
            }
            case 'bulkDeleteDocuments': {
            }
            case 'cudaInfo': {
                // curl -XGET http://localhost:8882/device/cuda
            }
            case 'cpuInfo': {
                // curl -XGET http://localhost:8882/device/cpu
            }

            default: {
                throw new Error('Invalid method');
            }
        }

        return {
            data: {},
            total: 0,
        };
    },
    getApiUrl: () => url,
});
