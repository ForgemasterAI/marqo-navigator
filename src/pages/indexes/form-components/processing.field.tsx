import { Grid, Typography, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';

export const PreprocessingSection = ({
    control,
    title,
    description,
    splitLengthName,
    splitOverlapName,
    splitMethodName,
    splitMethodOptions,
}: {
    control: Control<IIndexForm>;
    title: string;
    description?: string;
    splitLengthName: keyof IIndexForm;
    splitOverlapName: keyof IIndexForm;
    splitMethodName?: keyof IIndexForm;
    splitMethodOptions?: string[];
}) => (
    <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
            {title}
            <Tooltip title={description || `Configure how ${title.toLowerCase().replace(" preprocessing", "")} content is processed`}>
                <InfoOutlinedIcon fontSize="small" color="action" />
            </Tooltip>
        </Typography>
        {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
            </Typography>
        )}
        <Grid container spacing={2}>
            <Grid item xs={12} sm={splitMethodName ? 4 : 6}>
                <Controller
                    name={splitLengthName}
                    control={control}
                    defaultValue="6"
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <TextField 
                                {...field}
                                type="number" 
                                label="Split Length" 
                                fullWidth
                                InputProps={{ inputProps: { min: 1 } }} 
                            />
                            <FormHelperText>The size of each content chunk</FormHelperText>
                        </FormControl>
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={splitMethodName ? 4 : 6}>
                <Controller
                    name={splitOverlapName}
                    control={control}
                    defaultValue="1"
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <TextField 
                                {...field} 
                                type="number" 
                                label="Split Overlap" 
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}  
                            />
                            <FormHelperText>How much chunks should overlap</FormHelperText>
                        </FormControl>
                    )}
                />
            </Grid>
            {splitMethodName && splitMethodOptions && (
                <Grid item xs={12} sm={4}>
                    <Controller
                        name={splitMethodName}
                        control={control}
                        defaultValue="sentence"
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel id={`${splitMethodName}-label`}>Split Method</InputLabel>
                                <Select 
                                    {...field}
                                    labelId={`${splitMethodName}-label`}
                                    label="Split Method"
                                >
                                    {splitMethodOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>Method used to split content</FormHelperText>
                            </FormControl>
                        )}
                    />
                </Grid>
            )}
        </Grid>
    </Grid>
);
