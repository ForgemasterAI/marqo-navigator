import React from 'react';
import { useShow } from '@refinedev/core';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { UploadActionButton } from '../components/dashboard';

export const IndexDetailsPage = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  
  const indexData = data?.data;
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Index: {indexData?.name}
        </Typography>
        
        <UploadActionButton 
          indexName={indexData?.name} 
          indexModel={indexData?.model_name || ''} 
        />
      </Box>
      
      <Card>
        <CardContent>
          {/* Index details content */}
        </CardContent>
      </Card>
    </Box>
  );
};
