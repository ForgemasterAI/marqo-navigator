import { TextField, FormControl, Grid, InputLabel, Select, MenuItem, FormHelperText, Tooltip, Box, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';

export const IndexNameField = ({ register, errors }: { register: any; errors: any }) => (
    <Grid item xs={12} md={6}>
        <FormControl margin="normal" variant="outlined" required fullWidth>
            <TextField
                label="Index Name"
                {...register('indexName', { required: 'Index Name is required' })}
                error={!!errors.indexName}
                helperText={errors.indexName ? errors.indexName.message : 'A unique identifier for your index'}
                placeholder="my-search-index"
                InputLabelProps={{ shrink: true }}
            />
        </FormControl>
    </Grid>
);

export const IndexTypeField = ({ control, errors }: { control: Control<IIndexForm>; errors: any }) => (
    <Grid item xs={12} md={6}>
        <FormControl margin="normal" variant="outlined" required fullWidth error={!!errors.type}>
            <InputLabel id="type-label">Index Type</InputLabel>
            <Controller
                control={control}
                name="type"
                rules={{ required: 'This field is required' }}
                defaultValue="unstructured"
                render={({ field }) => (
                    <Select 
                        labelId="type-label" 
                        label="Index Type" 
                        {...field}
                    >
                        <MenuItem value="structured">Structured</MenuItem>
                        <MenuItem value="unstructured">Unstructured</MenuItem>
                    </Select>
                )}
            />
            <FormHelperText error={!!errors.type}>
                {errors.type ? errors.type.message : 'Choose structured for schema-enforced data or unstructured for flexible data'}
            </FormHelperText>
        </FormControl>
    </Grid>
);
