import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, useTheme, Paper, Tabs, Tab, Divider } from '@mui/material';
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
    const [cpuInfo, setCpuInfo] = useState<any>(null);
    const [cudaDevices, setCudaDevices] = useState<any[]>([]);
    const [indexes, setIndexes] = useState<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const query = new URLSearchParams(location.search);
    const activeIndexId = query.get('active-index');

    const handleIndexClick = (indexId: string) => {
        const newQuery = new URLSearchParams(location.search);
        newQuery.set('active-index', indexId);
        navigate(`${location.pathname}?${newQuery.toString()}`);
        
        // Also update the selectedIndex state
        const index = indexes.find(idx => idx.id === indexId);
        setSelectedIndex(index);
    };

    useEffect(() => {
        const fetchData = async () => {
            const promises = [
                //@ts-ignore
                dataProvider('default')
                   //@ts-ignore
                    .custom({
                        url: dataProvider('default').getApiUrl(),
                        meta: {
                            action: 'cudaInfo',
                        }
                    })
                    .catch(() => ({
                        // handle for case where cuda is not available
                        //@ts-ignore
                        data: {
                            cuda_devices: [],
                        },
                    })),
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

    useEffect(() => {
        const fetchIndexes = async () => {
            //@ts-ignore
            const response = await dataProvider('default').getList({
                resource: 'indexes',
            });
            // larger document count first
            const sortedIndexes = response.data.sort((a: any, b: any) => Number(b.numberOfDocuments) - Number(a.numberOfDocuments));
            setIndexes(sortedIndexes);
            
            // Set active index either from URL or first index
            const indexId = activeIndexId || (sortedIndexes.length > 0 ? sortedIndexes[0].id : null);
            if (indexId) {
                const index = sortedIndexes.find((idx: any) => idx.id === indexId);
                setSelectedIndex(index);
                if (!activeIndexId && index) {
                    handleIndexClick(index.id);
                }
            }
        };
        fetchIndexes();
    }, []);

    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    System Metrics
                </Typography>
                <DashboardAppBar
                    cpuUsagePercent={cpuInfo?.cpu_usage_percent ?? '0'}
                    memoryUsedPercent={cpuInfo?.memory_used_percent ?? '0'}
                    memoryUsedGb={cpuInfo?.memory_used_gb ?? '0'}
                    cudaDevices={cudaDevices}
                />
            </Paper>
            
            <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Marqo Indexes
                </Typography>
                
                {/* Index Selector Tabs */}
                <Tabs 
                    value={activeIndexId || ''}
                    onChange={(_, value) => handleIndexClick(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 2 }}
                >
                    {indexes.map((index) => (
                        <Tab 
                            key={index.id}
                            label={index.id}
                            value={index.id}
                            icon={statusIcons[index.backend.status] || null}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>
                
                <Divider sx={{ mb: 3 }} />
                
                {/* Selected Index Details */}
                {selectedIndex && (
                    <Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle1">Documents</Typography>
                                                <Typography variant="h4" color="primary">{selectedIndex.numberOfDocuments}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle1">Vectors</Typography>
                                                <Typography variant="h4" color="primary">{selectedIndex.numberOfVectors}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    Status: <Chip
                                                        label={selectedIndex.backend.status || 'N/A'}
                                                        color={statusColors[selectedIndex.backend.status as keyof typeof statusColors] || 'default'}
                                                        icon={statusIcons[selectedIndex.backend.status] || null}
                                                        size="small"
                                                    />
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Backend type: {selectedIndex.backend.type || 'N/A'}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2">Memory Usage</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Gauge
                                                        height={100}
                                                        width={100}
                                                        value={selectedIndex.backend.memoryUsedPercentage}
                                                        startAngle={-110}
                                                        endAngle={110}
                                                        sx={(theme) => ({
                                                            [`& .${gaugeClasses.valueText}`]: { fontSize: 12 },
                                                            [`& .${gaugeClasses.valueText} text`]: { fill: theme.palette?.text?.primary ?? '#ffffff' },
                                                            [`& .${gaugeClasses.valueArc}`]: { fill: '#52b202' },
                                                            [`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.text.disabled },
                                                        })}
                                                    />
                                                </Box>
                                                <Typography align="center">{(selectedIndex.backend.memoryUsedPercentage * 100).toFixed(1)}%</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2">Storage Usage</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Gauge
                                                        height={100}
                                                        width={100}
                                                        value={selectedIndex.backend.storageUsedPercentage / 100}
                                                        startAngle={-110}
                                                        endAngle={110}
                                                        sx={(theme) => ({
                                                            [`& .${gaugeClasses.valueText}`]: { fontSize: 12 },
                                                            [`& .${gaugeClasses.valueText} text`]: { fill: theme.palette?.text?.primary ?? '#ffffff' },
                                                            [`& .${gaugeClasses.valueArc}`]: { fill: '#52b202' },
                                                            [`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.text.disabled },
                                                        })}
                                                    />
                                                </Box>
                                                <Typography align="center">{selectedIndex.backend.storageUsedPercentage.toFixed(1)}%</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>
            
            {/* Search Section */}
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Search {selectedIndex ? `"${selectedIndex.id}"` : ''}
                </Typography>
                
                {selectedIndex ? (
                    <SearchTable 
                        activeIndex={selectedIndex} 
                        indexId={selectedIndex.id} 
                    />
                ) : (
                    <Typography color="text.secondary" align="center" py={4}>
                        Please select an index to search
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default Dashboard;
