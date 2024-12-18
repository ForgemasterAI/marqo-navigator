import { Grid, Typography, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';

export const PreprocessingSection = ({
    control,
    title,
    splitLengthName,
    splitOverlapName,
    splitMethodName,
    splitMethodOptions,
}: {
    control: Control<IIndexForm>;
    title: string;
    splitLengthName: keyof IIndexForm;
    splitOverlapName: keyof IIndexForm;
    splitMethodName?: keyof IIndexForm;
    splitMethodOptions?: string[];
}) => (
    <Grid item xs={12}>
        <Typography variant="subtitle1">{title}</Typography>
        <Grid container spacing={2}>
            <Grid item xs={splitMethodName ? 4 : 6}>
                <Controller
                    name={splitLengthName}
                    control={control}
                    defaultValue="6"
                    render={({ field }) => <TextField {...field} type="number" label="Split Length" fullWidth />}
                />
            </Grid>
            <Grid item xs={splitMethodName ? 4 : 6}>
                <Controller
                    name={splitOverlapName}
                    control={control}
                    defaultValue="1"
                    render={({ field }) => <TextField {...field} type="number" label="Split Overlap" fullWidth />}
                />
            </Grid>
            {splitMethodName && splitMethodOptions && (
                <Grid item xs={4}>
                    <Controller
                        name={splitMethodName}
                        control={control}
                        defaultValue="sentence"
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel>Split Method</InputLabel>
                                <Select {...field}>
                                    {splitMethodOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                </Grid>
            )}
        </Grid>
    </Grid>
);
