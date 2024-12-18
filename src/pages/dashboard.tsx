import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Chip } from '@mui/material';
import { useDataProvider } from '@refinedev/core';
import DashboardAppBar from '../components/dashboard/device-bar';
import { Gauge, gaugeClasses } from '@mui/x-charts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const statusColors = {
    green: 'success',
    yellow: 'warning',
    red: 'error',
    null: 'default',
    undefined: 'default',
};

const statusIcons = {
    green: <CheckCircleIcon fontSize="small" />,
    yellow: <WarningIcon fontSize="small" />,
    red: <ErrorIcon fontSize="small" />,
    null: <ErrorIcon fontSize="small" />,
    undefined: <ErrorIcon fontSize="small" />,
};

export const Dashboard = () => {
    const dataProvider = useDataProvider();

    // Mock data for CPU and Memory usage
    const mockCpuInfo = {
        cpu_usage_percent: '1.0 %',
        memory_used_percent: '70.0 %',
        memory_used_gb: '11.2',
    };

    const [cpuUsagePercent] = useState(mockCpuInfo.cpu_usage_percent);
    const [memoryUsedPercent] = useState(mockCpuInfo.memory_used_percent);
    const [memoryUsedGb] = useState(mockCpuInfo.memory_used_gb);

    // Mock data for CUDA devices
    const cudaDevices = [
        {
            device_id: 0,
            device_name: 'Tesla T4',
            memory_used: '1.7 GiB',
            total_memory: '14.6 GiB',
            utilization: '11.0 %',
            memory_used_percent: '25.0 %',
        },
    ];

    // Mock data for Marqo indexes
    const mockMarqoIndexes = [
        {
            index_name: 'my-first-index',
            numberOfDocuments: 4,
            numberOfVectors: 500000000000,
            backend: {
                memoryUsedPercentage: 0.73484113083,
                storageUsedPercentage: 37.01321365493,
                status: 'green',
            },
        },
        {
            index_name: 'my-second-index',
            numberOfDocuments: 10,
            numberOfVectors: 500000000000,
            backend: {
                memoryUsedPercentage: 0.8,
                storageUsedPercentage: 60.0,
                status: 'yellow',
            },
        },
        {
            index_name: 'my-third-index',
            numberOfDocuments: 50,
            numberOfVectors: 500000000000,
            backend: {
                memoryUsedPercentage: 0.2,
                storageUsedPercentage: 10.0,
                status: 'red',
            },
        },
    ];

    return (
        <Box p={3}>
            <DashboardAppBar
                cpuUsagePercent={cpuUsagePercent}
                memoryUsedPercent={memoryUsedPercent}
                memoryUsedGb={memoryUsedGb}
                cudaDevices={cudaDevices}
            />

            <Grid container spacing={3} px={2}>
                {/* Marqo Index Cards */}
                {mockMarqoIndexes.map((index) => (
                    <Grid item xs={12} md={6} lg={4} key={index.index_name}>
                        <Card elevation={2}>
                            <CardContent>
                                <Grid container justifyContent="space-between">
                                    <Typography variant="h6" gutterBottom>
                                        {index.index_name}
                                    </Typography>
                                    <Chip
                                        label={index.backend.status || 'N/A'}
                                        color={statusColors[index.backend.status] || 'default'}
                                        icon={statusIcons[index.backend.status] || null}
                                    />
                                </Grid>
                                <Grid item xs={6} container alignItems="center" spacing={2}>
                                    <Grid item>
                                        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                                           Documents:
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h6" color="primary">
                                            {index?.numberOfDocuments}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={6} container alignItems="center" spacing={2}>
                                    <Grid item>
                                        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                                           Vectors:
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h6" color="primary">
                                            {index.numberOfVectors}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>Memory:</Typography>
                                    <Gauge
                                        height={100}
                                        width={100}
                                        value={index.backend.memoryUsedPercentage}
                                        startAngle={-110}
                                        sx={(theme) => {
                                            return {
                                                [`& .${gaugeClasses.valueText}`]: {
                                                    fontSize: 12,
                                                },
                                                [`& .${gaugeClasses.valueText} text`]: {
                                                    fill: theme.palette?.text?.primary ?? '#ffffff',
                                                },
                                                [`& .${gaugeClasses.valueArc}`]: {
                                                    fill: '#52b202',
                                                },
                                                [`& .${gaugeClasses.referenceArc}`]: {
                                                    fill: theme.palette.text.disabled,
                                                },
                                            };
                                        }}
                                        endAngle={110}
                                    />
                                    <Typography>{(index.backend.memoryUsedPercentage * 100).toFixed(2)}%</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>Storage:</Typography>
                                    <Gauge
                                        height={100}
                                        width={100}
                                        value={index.backend.storageUsedPercentage}
                                        startAngle={-110}
                                        sx={(theme) => {
                                            return {
                                                [`& .${gaugeClasses.valueText}`]: {
                                                    fontSize: 12,
                                                },
                                                [`& .${gaugeClasses.valueText} text`]: {
                                                    fill: theme.palette?.text?.primary ?? '#ffffff',
                                                },
                                                [`& .${gaugeClasses.valueArc}`]: {
                                                    fill: '#52b202',
                                                },
                                                [`& .${gaugeClasses.referenceArc}`]: {
                                                    fill: theme.palette.text.disabled,
                                                },
                                            };
                                        }}
                                        endAngle={110}
                                    />
                                    <Typography>{index.backend.storageUsedPercentage.toFixed(2)}%</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dashboard;
