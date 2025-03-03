import React from 'react';
import { 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    FormHelperText 
} from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import { IIndexForm } from '../types';

interface FieldTypeSelectProps {
    index: number;
    control: Control<IIndexForm>;
    error?: any;
}

export const FieldTypeSelect: React.FC<FieldTypeSelectProps> = ({ 
    index, 
    control, 
    error 
}) => {
    return (
        <FormControl margin="normal" variant="outlined" fullWidth>
            <InputLabel id={`type-label-${index}`}>Type</InputLabel>
            <Controller
                control={control}
                name={`allFields.${index}.type`}
                rules={{ required: 'This field is required' }}
                defaultValue=""
                render={({ field: controllerField }) => (
                    <Select labelId={`type-label-${index}`} label="Type" {...controllerField}>
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="int">Int</MenuItem>
                        <MenuItem value="float">Float</MenuItem>
                        <MenuItem value="long">Long</MenuItem>
                        <MenuItem value="double">Double</MenuItem>
                        <MenuItem value="array<text>">Array of Text</MenuItem>
                        <MenuItem value="array<int>">Array of Ints</MenuItem>
                        <MenuItem value="array<float>">Array of Floats</MenuItem>
                        <MenuItem value="array<long>">Array of Longs</MenuItem>
                        <MenuItem value="array<double>">Array of Doubles</MenuItem>
                        <MenuItem value="bool">Boolean</MenuItem>
                        <MenuItem value="multimodal_combination">Multimodal Combination</MenuItem>
                        <MenuItem value="image_pointer">Image Pointer</MenuItem>
                        <MenuItem value="video_pointer">Video Pointer</MenuItem>
                        <MenuItem value="audio_pointer">Audio Pointer</MenuItem>
                        <MenuItem value="custom_vector">Custom Vector</MenuItem>
                        <MenuItem value="map<text, int>">Map of Text to Ints</MenuItem>
                        <MenuItem value="map<text, long>">Map of Text to Longs</MenuItem>
                        <MenuItem value="map<text, float>">Map of Text to Floats</MenuItem>
                        <MenuItem value="map<text, double>">Map of Text to Doubles</MenuItem>
                    </Select>
                )}
            />
            {error && (
                <FormHelperText error>{error.message}</FormHelperText>
            )}
        </FormControl>
    );
};
