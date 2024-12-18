import { FormControl, Grid, TextField } from '@mui/material';

export const ModelField = ({ register, errors }: { register: any; errors: any }) => (
    <Grid item xs={12}>
        <FormControl margin="normal" variant="outlined" required>
            <TextField
                label="Model"
                {...register('model', { required: 'This field is required' })}
                error={!!errors.model}
                helperText={errors.model ? errors.model.message : ''}
            />
        </FormControl>
    </Grid>
);
