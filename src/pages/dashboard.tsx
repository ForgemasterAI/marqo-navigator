import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useDataProvider } from '@refinedev/core';

export const Dashboard = () => {
    const dataProvider = useDataProvider();
    const [data, setData] = useState(null);

    return (
        <Box p={2}>
            <Typography variant="h4">Dashboard</Typography>
            <Grid container spacing={2}>
                {/* Dashboard cards or charts here */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">Metric 1</Typography>
                            {/* Content here */}
                        </CardContent>
                    </Card>
                </Grid>
                {/* Repeat for more metrics/charts */}
            </Grid>
        </Box>
    );
};

export default Dashboard;
