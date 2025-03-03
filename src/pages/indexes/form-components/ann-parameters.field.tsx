import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Tooltip, FormHelperText, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Control, Controller } from 'react-hook-form';
import { IIndexForm } from '../types';

export const AnnParametersSection = ({ control }: { control: Control<IIndexForm> }) => (
    <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>ANN Parameters</Typography>
            <Tooltip title="Approximate Nearest Neighbors algorithm settings that control search behavior">
                <InfoOutlinedIcon fontSize="small" color="action" />
            </Tooltip>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure how the vector search index behaves. These settings affect search accuracy and performance.
        </Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Controller
                    name="annParameters.spaceType"
                    control={control}
                    defaultValue="prenormalized-angular"
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel id="space-type-label">Space Type</InputLabel>
                            <Select 
                                {...field}
                                labelId="space-type-label"
                                label="Space Type"
                            >
                                <MenuItem value="prenormalized-angular">prenormalized-angular</MenuItem>
                                <MenuItem value="ip">ip (Inner Product)</MenuItem>
                                <MenuItem value="cosine">cosine</MenuItem>
                            </Select>
                            <FormHelperText>
                                Determines how vector similarity is calculated
                            </FormHelperText>
                        </FormControl>
                    )}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>HNSW Parameters</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="annParameters.parameters.efConstruction"
                            control={control}
                            defaultValue={512}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <TextField 
                                        {...field} 
                                        type="number" 
                                        label="EF Construction" 
                                        fullWidth 
                                        InputProps={{ inputProps: { min: 1 } }}
                                    />
                                    <FormHelperText>
                                        Size of the dynamic candidate list during index building
                                    </FormHelperText>
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="annParameters.parameters.m"
                            control={control}
                            defaultValue={16}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <TextField 
                                        {...field} 
                                        type="number" 
                                        label="M" 
                                        fullWidth 
                                        InputProps={{ inputProps: { min: 2 } }}
                                    />
                                    <FormHelperText>
                                        Number of bi-directional links created per element
                                    </FormHelperText>
                                </FormControl>
                            )}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
);
