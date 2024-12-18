import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, useTheme } from '@mui/material';
import { useDataProvider } from '@refinedev/core';
import DashboardAppBar from '../components/dashboard/device-bar';
import { Gauge, gaugeClasses } from '@mui/x-charts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchTable from '../components/dashboard/search-table';

const statusColors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
    green: 'success',
    yellow: 'warning',
    red: 'error',
    null: 'default',
    undefined: 'default',
};

const statusIcons: { [key: string]: JSX.Element } = {
    green: <CheckCircleIcon fontSize="small" />,
    yellow: <WarningIcon fontSize="small" />,
    red: <ErrorIcon fontSize="small" />,
    null: <ErrorIcon fontSize="small" />,
    undefined: <ErrorIcon fontSize="small" />,
};

export const Dashboard = () => {
    const dataProvider = useDataProvider();
    // Mock data for CPU and Memory usage
    const [cpuInfo, setCpuInfo] = useState<any>(null);
    const [cudaDevices, setCudaDevices] = useState<any[]>([]);
    const [indexes, setIndexes] = useState<any[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const activeIndex = query.get('active-index');

    const handleIndexClick = (indexId: string) => {
        const newQuery = new URLSearchParams(location.search);
        newQuery.set('active-index', indexId);
        navigate(`${location.pathname}?${newQuery.toString()}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            const promises = [
                //@ts-ignore
                dataProvider('default').custom({
                    url: dataProvider('default').getApiUrl(),
                    meta: {
                        action: 'cudaInfo',
                    },
                }),
                //@ts-ignore
                dataProvider('default').custom({
                    url: dataProvider('default').getApiUrl(),
                    meta: {
                        action: 'cpuInfo',
                    },
                }),
            ];
            const [{ data: cudaInfo }, { data: cpuInfo }] = await Promise.all(promises);

            setCudaDevices(cudaInfo.cuda_devices || []);
            setCpuInfo(cpuInfo);
        };
        fetchData();
    }, []);

    // Mock data for Marqo indexes
    useEffect(() => {
        const fetchIndexes = async () => {
            //@ts-ignore
            const response = await dataProvider('default').getList({
                resource: 'indexes',
            });
            // larger document count first
            setIndexes(response.data.sort((a: any, b: any) => Number(b.numberOfDocuments) - Number(a.numberOfDocuments)));
            if(!activeIndex && response.data.length > 0) {
                //@ts-expect-error
                handleIndexClick(response.data[0].id);
            }
        };
        fetchIndexes();
    }, []);
    const theme = useTheme();
    return (
        <Box p={3}>
            <DashboardAppBar
                cpuUsagePercent={cpuInfo?.cpu_usage_percent ?? '0'}
                memoryUsedPercent={cpuInfo?.memory_used_percent ?? '0'}
                memoryUsedGb={cpuInfo?.memory_used_gb ?? '0'}
                cudaDevices={cudaDevices}
            />

            <Grid container spacing={3} px={2}>
                {/* Marqo Index Cards */}
                {indexes.map((index) => (
                    <Grid item xs={12} md={6} lg={4} key={index.id}>
                        <Card
                            elevation={2}
                            onClick={() => {
                                handleIndexClick(index.id);
                            }}
                            style={{
                                cursor: 'pointer',
                                border: activeIndex === index.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                            }}
                        >
                            <CardContent>
                                <Grid container justifyContent="space-between">
                                    <Typography variant="h6" gutterBottom>
                                        {index.id}
                                    </Typography>
                                    <Chip
                                        label={index.backend.status || 'N/A'}
                                        color={statusColors[index.backend.status as keyof typeof statusColors] || 'default'}
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
                                    <Typography>{(index.backend.memoryUsedPercentage * 100).toFixed(2)}</Typography>
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
            <SearchTable />
        </Box>
    );
};

export default Dashboard;
