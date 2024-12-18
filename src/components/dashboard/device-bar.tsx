import React from 'react';
import { AppBar, Toolbar, Grid, Typography, Card, CardContent, LinearProgress, Box } from '@mui/material';

interface CudaDevice {
    device_id: number;
    device_name: string;
    memory_used: string;
    total_memory: string;
    utilization: string;
    memory_used_percent: string;
}

interface DashboardAppBarProps {
    cpuUsagePercent: string;
    memoryUsedPercent: string;
    memoryUsedGb: string;
    cudaDevices: CudaDevice[];
}

const DashboardAppBar: React.FC<DashboardAppBarProps> = ({ cpuUsagePercent, memoryUsedPercent, memoryUsedGb, cudaDevices }) => {
    return (
        <AppBar position="static" color="default" sx={{ marginBottom: 2, boxShadow: 3 }}>
            <Toolbar>
                <Grid container spacing={3} alignItems="center" justifyContent="space-around"  >
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="textPrimary">
                                    CPU Usage
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <Box width="100%" mr={1}>
                                        <LinearProgress variant="determinate" value={parseFloat(cpuUsagePercent)} color="primary" />
                                    </Box>
                                    <Box minWidth={35}>
                                        <Typography variant="body2" color="textSecondary">
                                            {cpuUsagePercent}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    Memory Used: {memoryUsedGb} GB ({memoryUsedPercent})
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {cudaDevices.map((device) => (
                        <Grid item xs={12} sm={4} key={device.device_id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="textPrimary">
                                        {device.device_name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Utilization: {device.utilization}
                                    </Typography>
                                    <Box display="flex" alignItems="center" mt={1}>
                                        <Box width="100%" mr={1}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={parseFloat(device.utilization)}
                                                color="secondary"
                                            />
                                        </Box>
                                        <Box minWidth={35}>
                                            <Typography variant="body2" color="textSecondary">
                                                {device.utilization}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        Memory Used: {device.memory_used} / {device.total_memory} ({device.memory_used_percent})
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Toolbar>
        </AppBar>
    );
};

export default DashboardAppBar;
