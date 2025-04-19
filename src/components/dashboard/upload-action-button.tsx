import React, { useState } from 'react';
import { Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import UploadDocumentsDialog from './upload-documents';

interface UploadActionButtonProps {
  indexName: string;
  indexModel: string;
}

export const UploadActionButton: React.FC<UploadActionButtonProps> = ({ indexName, indexModel }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<UploadIcon />}
        onClick={handleOpenDialog}
      >
        Upload Documents
      </Button>
      
      <UploadDocumentsDialog 
        open={isDialogOpen}
        onClose={handleCloseDialog}
        indexName={indexName}
        indexModel={indexModel}
      />
    </>
  );
};
