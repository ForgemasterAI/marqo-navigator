import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';
import { FormControlLabel, Grid, Switch } from '@mui/material';

export const NormalizeEmbeddingsSwitch = ({ control }: { control: Control<IIndexForm> }) => (
    <Grid item xs={12}>
        <FormControlLabel
            control={
                <Controller
                    name="normalizeEmbeddings"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
                />
            }
            label="Normalize Embeddings"
        />
    </Grid>
);
