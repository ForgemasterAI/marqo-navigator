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
    Typography,
    Tooltip,
    Box,
    FormHelperText,
    Paper,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Controller, Control } from 'react-hook-form';
import { IIndexForm, IField } from '../types';

export const TensorFieldsSection = ({ control, fields, errors }: { control: Control<IIndexForm>; fields: IField[]; errors: any }) => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2">Tensor Fields</Typography>
                <Tooltip title="Fields that will be converted to vector embeddings for semantic search">
                    <InfoOutlinedIcon fontSize="small" color="action" />
                </Tooltip>
            </Box>
            <FormControl margin="normal" variant="outlined" sx={{ width: '100%' }}>
                <Controller
                    control={control}
                    name="tensorFields"
                    defaultValue={{ type: 'select', values: [] }}
                    rules={{ required: 'This field is required' }}
                    render={({ field }) => {
                        const currentValues = field.value?.values || [];
                        
                        return (
                            <Box>
                                <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 2, 
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Typography variant="body2">
                                        Select fields from your defined fields or enter custom field names
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value?.type === 'custom'}
                                                onChange={(e) => {
                                                    field.onChange({
                                                        type: e.target.checked ? 'custom' : 'select',
                                                        // Preserve the values when switching modes
                                                        values: currentValues
                                                    });
                                                }}
                                            />
                                        }
                                        label={field.value?.type === 'custom' ? "Custom Input" : "Choose from Fields"}
                                        sx={{ ml: 2 }}
                                    />
                                </Paper>

                                {field.value?.type === 'select' ? (
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="tensor-fields-label">Select Fields to Vectorize</InputLabel>
                                        <Select
                                            labelId="tensor-fields-label"
                                            multiple
                                            value={currentValues}
                                            onChange={(e) => field.onChange({ ...field.value, values: e.target.value })}
                                            input={<OutlinedInput label="Select Fields to Vectorize" />}
                                            renderValue={(selected) => selected.join(', ')}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 224,
                                                    },
                                                },
                                            }}
                                        >
                                            {/* Only show fields with valid names and skip empty fields */}
                                            {fields
                                                .filter((existingField: IField) => existingField.name && existingField.name.trim() !== '')
                                                .map((existingField: IField) => (
                                                    <MenuItem key={existingField.name} value={existingField.name || ''}>
                                                        <Checkbox checked={currentValues.includes(existingField.name as string)} />
                                                        <ListItemText primary={existingField.name} />
                                                    </MenuItem>
                                                ))}
                                            
                                            {/* Show message when no valid fields are available */}
                                            {fields.filter((f: IField) => f.name && f.name.trim() !== '').length === 0 && (
                                                <MenuItem disabled>
                                                    <ListItemText primary="No fields defined yet" />
                                                </MenuItem>
                                            )}
                                        </Select>
                                        <FormHelperText>
                                            Select which fields should be processed as vectors
                                        </FormHelperText>
                                    </FormControl>
                                ) : (
                                    <FormControl fullWidth>
                                        <TextField
                                            label="Tensor Fields (comma-separated)"
                                            value={currentValues.join(', ') || ''}
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
                                            helperText={errors.tensorFields?.message || "Enter field names separated by commas"}
                                        />
                                    </FormControl>
                                )}
                            </Box>
                        );
                    }}
                />
            </FormControl>
        </Grid>
    </Grid>
);
