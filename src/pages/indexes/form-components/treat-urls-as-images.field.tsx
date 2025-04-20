import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';
import { 
    FormControlLabel, 
    Grid, 
    Switch, 
    Typography, 
    Tooltip, 
    Box 
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export const TreatUrlsAsImagesSwitch = ({ control, model }: { control: Control<IIndexForm>; model: string }) => {
    // Check if the model is likely an image model (CLIP, ViT, etc.)
    const isImageModel = 
        model?.toLowerCase().includes('clip') || 
        model?.toLowerCase().includes('vit') || 
        model?.toLowerCase().includes('image') || 
        model?.startsWith('open_clip/') ||
        model?.includes('fashionCLIP') ||
        model?.includes('fashionSigLIP') ||
        model?.includes('siglip') ||
        model === 'Marqo/marqo-ecommerce-embeddings-B' || // Explicitly include Marqo model B
        model === 'Marqo/marqo-ecommerce-embeddings-L';   // Explicitly include Marqo model L
    
    // Only show this switch for image models
    if (!isImageModel) return null;

    return (
        <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormControlLabel
                    control={
                        <Controller
                            name="treatUrlsAndPointersAsImages"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
                        />
                    }
                    label="Treat URLs and Pointers as Images"
                />
                <Tooltip title="When enabled, URLs and file paths in your data will be processed as images by the model">
                    <InfoOutlinedIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                </Tooltip>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Enable this option if your data contains image URLs or file paths that should be processed as images
            </Typography>
        </Grid>
    );
};
