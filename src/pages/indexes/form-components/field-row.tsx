import React from 'react';
import {
    TextField,
    Grid,
    Button,
    Box,
} from '@mui/material';
import { Control, UseFormSetValue } from 'react-hook-form';
import { IIndexForm } from '../types';
import { FieldTypeSelect } from './field-type-select';
import { FieldFeaturesSelect } from './field-features-select';
import { MultimodalField } from './multimodal-field';

interface FieldRowProps {
    index: number;
    field: any;
    currentField: any;
    control: Control<IIndexForm>;
    errors: any;
    register: any;
    remove: (index: number) => void;
    setValue: UseFormSetValue<IIndexForm>;
    availableFieldNames: string[];
}

export const FieldRow: React.FC<FieldRowProps> = ({
    index,
    field,
    currentField,
    control,
    errors,
    register,
    remove,
    setValue,
    availableFieldNames,
}) => {
    return (
        <Grid container spacing={2} key={field.id} alignItems="center">
            <Grid item xs={3}>
                <Box sx={{ mt: 2, mb: 1 }}>
                    <TextField
                        label={`Field ${index + 1} Name`}
                        {...register(`allFields.${index}.name`, { required: 'This field is required' })}
                        error={!!errors.allFields?.[index]?.name}
                        helperText={errors.allFields?.[index]?.name?.message}
                        fullWidth
                    />
                </Box>
            </Grid>
            <Grid item xs={3}>
                <Box sx={{ mt: 2, mb: 1 }}>
                    <FieldTypeSelect 
                        index={index} 
                        control={control} 
                        error={errors.allFields?.[index]?.type}
                    />
                </Box>
            </Grid>

            {/* Features or Dependent Fields */}
            <Grid item xs={3}>
                <Box sx={{ mt: 2, mb: 1 }}>
                    {currentField.type !== 'multimodal_combination' && (
                        <FieldFeaturesSelect 
                            index={index} 
                            control={control} 
                            error={errors.allFields?.[index]?.features} 
                        />
                    )}
                    {currentField.type === 'multimodal_combination' && (
                        <MultimodalField
                            index={index}
                            control={control}
                            currentField={currentField}
                            availableFieldNames={availableFieldNames}
                            setValue={setValue}
                        />
                    )}
                </Box>
            </Grid>

            <Grid item xs={3}>
                <Box sx={{ mt: 2, mb: 1 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => remove(index)}
                        fullWidth
                    >
                        Remove Field
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
};
