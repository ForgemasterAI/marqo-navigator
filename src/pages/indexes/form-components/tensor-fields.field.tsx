import {
    TextField,
    Checkbox,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    ListItemText,
    FormControlLabel,
    Switch,
    OutlinedInput,
} from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import { IIndexForm } from '../types';

export const TensorFieldsSection = ({ control, fields, errors }: { control: Control<IIndexForm>; fields: any; errors: any }) => (
    <Grid item xs={12}>
        <InputLabel>Tensor Fields</InputLabel>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <FormControl margin="normal" variant="outlined" sx={{ width: '100%' }}>
                    <Controller
                        control={control}
                        name="tensorFields"
                        defaultValue={{ type: 'select', values: [] }}
                        rules={{ required: 'This field is required' }}
                        render={({ field }) => (
                            <>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={field.value?.type === 'custom'}
                                            onChange={(e) => {
                                                field.onChange({
                                                    type: e.target.checked ? 'custom' : 'select',
                                                    values: [],
                                                });
                                            }}
                                        />
                                    }
                                    defaultValue={'custom'}
                                    label="Custom Input"
                                />
                                {field.value?.type === 'select' ? (
                                    <Select
                                        multiple
                                        value={field.value?.values || []}
                                        onChange={(e) => field.onChange({ ...field.value, values: e.target.value })}
                                        input={<OutlinedInput label="Tensor Fields" />}
                                        renderValue={(selected) => selected.join(', ')}
                                    >
                                        {fields
                                            .filter((existingField) => existingField.name)
                                            .map((existingField) => (
                                                <MenuItem key={existingField.name} value={existingField.name}>
                                                    <Checkbox checked={field.value?.values?.includes(existingField.name)} />
                                                    <ListItemText primary={existingField.name} />
                                                </MenuItem>
                                            ))}
                                    </Select>
                                ) : (
                                    <TextField
                                        label="Tensor Fields (comma-separated)"
                                        value={field.value?.values?.join(', ') || ''}
                                        onChange={(e) =>
                                            field.onChange({
                                                ...field.value,
                                                values: e.target.value
                                                    .split(',')
                                                    .map((s) => s.trim())
                                                    .filter(Boolean),
                                            })
                                        }
                                        error={!!errors.tensorFields}
                                        helperText={errors.tensorFields?.message}
                                    />
                                )}
                            </>
                        )}
                    />
                </FormControl>
            </Grid>
        </Grid>
    </Grid>
);
