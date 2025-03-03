import React from 'react';
import {
    FormControl,
    Typography,
    Grid,
    Button,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    TextField
} from '@mui/material';
import { Controller, Control, UseFormSetValue } from 'react-hook-form';
import { IIndexForm } from '../types';

interface MultimodalFieldProps {
    index: number;
    control: Control<IIndexForm>;
    currentField: any;
    availableFieldNames: string[];
    setValue: UseFormSetValue<IIndexForm>; // Use the correct type
}

export const MultimodalField: React.FC<MultimodalFieldProps> = ({
    index,
    control,
    currentField,
    availableFieldNames,
    setValue
}) => {
    const dependentFields = currentField?.dependentFields || {};
    
    return (
        <FormControl margin="normal" variant="outlined" fullWidth>
            <Typography 
                variant="subtitle2" 
                sx={{ mb: 1 }}
            >
                Dependent Fields & Weights
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {currentField.dependentFields &&
                    Object.entries(currentField.dependentFields || {}).map(([depName, weight], depIndex) => (
                        <Grid container spacing={1} key={depIndex} alignItems="center" sx={{ mb: 1 }}>
                            <Grid item xs={5}>
                                <Typography variant="body2">{depName}</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Controller
                                    control={control}
                                    name={`allFields.${index}.dependentFields.${depName}`}
                                    defaultValue={weight || 0}
                                    render={({ field: controllerField }) => (
                                        <Slider
                                            {...controllerField}
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            valueLabelDisplay="auto"
                                            onChange={(_, value) => {
                                                controllerField.onChange(value);
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Controller
                                    control={control}
                                    name={`allFields.${index}.dependentFields.${depName}`}
                                    render={({ field }) => (
                                        <TextField
                                            value={field.value}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                if (!isNaN(value) && value >= 0 && value <= 1) {
                                                    field.onChange(value);
                                                }
                                            }}
                                            type="number"
                                            inputProps={{
                                                min: 0,
                                                max: 1,
                                                step: 0.1,
                                            }}
                                            size="small"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="text"
                                    color="error"
                                    size="small"
                                    onClick={() => {
                                        const updatedDependentFields = { ...currentField.dependentFields };
                                        delete updatedDependentFields[depName];
                                        setValue(`allFields.${index}.dependentFields`, updatedDependentFields);
                                    }}
                                >
                                    Remove
                                </Button>
                            </Grid>
                        </Grid>
                    ))}
            </Grid>
            
            <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
                <InputLabel id={`add-field-label-${index}`}>Add Field</InputLabel>
                <Select
                    labelId={`add-field-label-${index}`}
                    label="Add Field"
                    value=""
                    onChange={(e) => {
                        const fieldName = e.target.value;
                        if (fieldName && typeof fieldName === 'string') {
                            try {
                                // Safely add the new field with defensive programming
                                const existingDependentFields = currentField?.dependentFields || {};
                                if (!existingDependentFields[fieldName]) {
                                    setValue(`allFields.${index}.dependentFields`, {
                                        ...existingDependentFields,
                                        [fieldName]: 0.5
                                    });
                                }
                            } catch (error) {
                                console.error("Error setting dependent field:", error);
                            }
                        }
                    }}
                >
                    {availableFieldNames
                        .filter(name => !currentField.dependentFields || !(name in currentField.dependentFields))
                        .map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))
                    }
                    {availableFieldNames.length === 0 || 
                     (currentField.dependentFields && 
                      Object.keys(currentField.dependentFields).length >= availableFieldNames.length) ? (
                        <MenuItem disabled value="">
                            No available fields
                        </MenuItem>
                    ) : null}
                </Select>
            </FormControl>
            
            {(currentField.dependentFields && Object.keys(currentField.dependentFields).length > 0) && (
                <Button
                    variant="contained" 
                    color="primary"
                    size="small"
                    onClick={() => {
                        // Normalize weights to sum to 1
                        const weights = Object.values(currentField.dependentFields) as number[];
                        const sum = weights.reduce((a, b) => a + b, 0);
                        
                        if (sum > 0) {
                            const normalizedFields = Object.fromEntries(
                                Object.entries(currentField.dependentFields).map(
                                    ([key, value]) => [key, Number((Number(value) / sum).toFixed(2))]
                                )
                            );
                            
                            setValue(`allFields.${index}.dependentFields`, normalizedFields);
                        }
                    }}
                >
                    Normalize Weights
                </Button>
            )}
        </FormControl>
    );
};
