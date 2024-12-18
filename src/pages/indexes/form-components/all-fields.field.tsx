import React, { useEffect } from 'react';
import {
    TextField,
    Checkbox,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Button,
    FormHelperText,
    ListItemText,
    Typography,
} from '@mui/material';
import { Controller, Control, useWatch } from 'react-hook-form';
import { IIndexForm } from '../types';

interface AllFieldsSectionProps {
    control: Control<IIndexForm>;
    fields: any;
    append: any;
    remove: any;
    errors: any;
    register: any;
    setValue: (name: string, value: any, options?: any) => void;
}

export const AllFieldsSection: React.FC<AllFieldsSectionProps> = ({ control, fields, append, remove, errors, register, setValue }) => {
    // Watch allFields to detect changes
    const allFieldsValues = useWatch({
        control,
        name: 'allFields',
    });

    useEffect(() => {
        fields.forEach((field: any, index: number) => {
            if (field.type === 'multimodal_combination' && (!field.dependentFields || Object.keys(field.dependentFields).length === 0)) {
                setValue(`allFields.${index}.dependentFields`, {});
            }
        });
    }, [fields, setValue]);

    return (
        <Grid item xs={12}>
            <InputLabel>All Fields</InputLabel>
            {fields.map((field: any, index: number) => {
                const currentField = allFieldsValues?.[index] || field;

                return (
                    <Grid container spacing={2} key={field.id} alignItems="center">
                        {/* Field Name */}
                        <Grid item xs={3}>
                            <FormControl margin="normal" variant="outlined" fullWidth>
                                <TextField
                                    label={`Field ${index + 1} Name`}
                                    {...register(`allFields.${index}.name`, { required: 'This field is required' })}
                                    error={!!errors.allFields?.[index]?.name}
                                    helperText={errors.allFields?.[index]?.name?.message}
                                />
                            </FormControl>
                        </Grid>

                        {/* Field Type */}
                        <Grid item xs={3}>
                            <FormControl margin="normal" variant="outlined" sx={{ minWidth: 200 }} fullWidth>
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
                                {errors.allFields?.[index]?.type && (
                                    <FormHelperText error>{errors.allFields[index].type.message}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Features or Dependent Fields */}
                        <Grid item xs={3}>
                            {currentField.type !== 'multimodal_combination' && (
                                <FormControl margin="normal" variant="outlined" sx={{ minWidth: 200 }} fullWidth>
                                    <InputLabel id={`features-label-${index}`}>{`Field ${index + 1} Features`}</InputLabel>
                                    <Controller
                                        control={control}
                                        name={`allFields.${index}.features`}
                                        defaultValue={[]}
                                        render={({ field: controllerField }) => (
                                            <Select
                                                {...controllerField}
                                                labelId={`features-label-${index}`}
                                                label={`Field ${index + 1} Features`}
                                                multiple
                                                error={!!errors.allFields?.[index]?.features}
                                                renderValue={(selected: string[]) => selected.join(', ')}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8,
                                                            width: 250,
                                                        },
                                                    },
                                                }}
                                            >
                                                {['lexical_search', 'filter', 'score_modifier'].map((feature) => (
                                                    <MenuItem key={feature} value={feature}>
                                                        <Checkbox checked={controllerField.value?.includes(feature)} />
                                                        <ListItemText primary={feature} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.allFields?.[index]?.features && (
                                        <FormHelperText error>{errors.allFields[index].features.message}</FormHelperText>
                                    )}
                                </FormControl>
                            )}
                            {currentField.type === 'multimodal_combination' && (
                                <FormControl margin="normal" variant="outlined" sx={{ minWidth: 200 }} fullWidth>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ mb: 3, mt: 3 }}
                                    >{`Field ${index + 1} Dependent Fields`}</Typography>

                                    <Grid container spacing={2}>
                                        {currentField.dependentFields &&
                                            Object.keys(currentField.dependentFields).map((depName, depIndex) => (
                                                <Grid container spacing={1} key={depIndex} alignItems="center">
                                                    <Grid item xs={6}>
                                                        <Controller
                                                            control={control}
                                                            name={`allFields.${index}.dependentFields.${depName}`}
                                                            defaultValue={0}
                                                            render={({ field: controllerField }) => (
                                                                <TextField
                                                                    {...controllerField}
                                                                    type="text"
                                                                    label="Field Name"
                                                                    fullWidth
                                                                    helperText={errors.model ? errors.model.message : ''}
                                                                />
                                                            )}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Controller
                                                            control={control}
                                                            name={`allFields.${index}.dependentFields.${depName}`}
                                                            defaultValue={0}
                                                            render={({ field: controllerField }) => (
                                                                <TextField
                                                                    {...controllerField}
                                                                    type="number"
                                                                    label="Weight"
                                                                    fullWidth
                                                                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                                                                />
                                                            )}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        {/* Optionally, add a button to add new dependent fields */}
                                    </Grid>
                                </FormControl>
                            )}
                        </Grid>

                        {/* Delete Button */}
                        <Grid item xs={3}>
                            <Button onClick={() => remove(index)} color="error" variant="outlined" sx={{ mt: 2 }}>
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                );
            })}
            <Button
                type="button"
                onClick={() => append({ name: '', type: '', features: [] })}
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
            >
                Add Field
            </Button>
        </Grid>
    );
};
