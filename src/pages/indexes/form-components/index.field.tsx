// Refactored code for IndexesCreate
import { TextField, FormControl, Grid, InputLabel, Select, MenuItem } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';

export const IndexNameField = ({ register, errors }: { register: any; errors: any }) => (
    <Grid item xs={12}>
        <FormControl margin="normal" variant="outlined" required>
            <TextField
                label="Index Name"
                {...register('indexName', { required: 'Index Name is required' })}
                error={!!errors.indexName}
                helperText={errors.indexName ? errors.indexName.message : ''}
            />
        </FormControl>
    </Grid>
);

export const IndexTypeField = ({ control, errors }: { control: Control<IIndexForm>; errors: any }) => (
    <Grid item xs={12}>
        <FormControl margin="normal" variant="outlined" required error={!!errors.type}>
            <InputLabel id="type-label">Type</InputLabel>
            <Controller
                control={control}
                name="type"
                rules={{ required: 'This field is required' }}
                defaultValue="unstructured"
                render={({ field }) => (
                    <Select labelId="type-label" label="Type" {...field}>
                        <MenuItem value="structured">Structured</MenuItem>
                        <MenuItem value="unstructured">Unstructured</MenuItem>
                    </Select>
                )}
            />
            {errors.type && <p>{errors.type.message}</p>}
        </FormControl>
    </Grid>
);
