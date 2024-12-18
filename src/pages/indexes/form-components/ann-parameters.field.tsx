import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';

export const AnnParametersSection = ({ control }: { control: Control<IIndexForm> }) => (
    <Grid item xs={12}>
        <Typography variant="subtitle1">ANN Parameters</Typography>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Controller
                    name="annParameters.spaceType"
                    control={control}
                    defaultValue="prenormalized-angular"
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel>Space Type</InputLabel>
                            <Select {...field}>
                                <MenuItem value="prenormalized-angular">prenormalized-angular</MenuItem>
                                <MenuItem value="ip">ip</MenuItem>
                                <MenuItem value="cosine">cosine</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />
            </Grid>
            <Grid item xs={6}>
                <Controller
                    name="annParameters.parameters.efConstruction"
                    control={control}
                    defaultValue={512}
                    render={({ field }) => <TextField {...field} type="number" label="EF Construction" fullWidth />}
                />
            </Grid>
            <Grid item xs={6}>
                <Controller
                    name="annParameters.parameters.m"
                    control={control}
                    defaultValue={16}
                    render={({ field }) => <TextField {...field} type="number" label="M" fullWidth />}
                />
            </Grid>
        </Grid>
    </Grid>
);
