import {
    FormControl,
    Grid,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormHelperText,
    RadioGroup,
    FormControlLabel,
    Radio,
    ListSubheader,
    Typography,
    Box,
    Tooltip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import { IIndexForm } from '../types';
import { MODEL_OPTIONS } from './model.constants';
import React from 'react'; // Import React

// Helper function to validate JSON
const isValidJson = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

// Placeholder JSON structure
const customJsonPlaceholder = `{
  "name": "<your-public-huggingface-model-card-name>",
  "dimensions": 384,
  "type": "hf",
  "tokens": 128
}`;

export const ModelField = ({
    control,
    errors,
    setValue,
}: {
    control: Control<IIndexForm>;
    errors: any;
    setValue: UseFormSetValue<IIndexForm>;
}) => {
    return (
        <Grid item xs={12}>
            <FormControl component="fieldset" margin="normal" fullWidth>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    Model Configuration
                    <Tooltip title="Choose a pre-defined model, enter a custom model name, or provide full custom settings in JSON format.">
                        <InfoOutlinedIcon fontSize="small" color="action" />
                    </Tooltip>
                </Typography>
                <Controller
                    name="modelInputType"
                    control={control}
                    defaultValue="select"
                    render={({ field }) => (
                        <RadioGroup
                            row
                            {...field}
                            onChange={(e) => {
                                field.onChange(e.target.value);
                                // Reset model and properties when changing type
                                setValue('model', '');
                                setValue('modelPropertiesJson', '');
                            }}
                        >
                            <FormControlLabel value="select" control={<Radio />} label="Select Predefined Model" />
                            <FormControlLabel value="customName" control={<Radio />} label="Custom Model Name" />
                            <FormControlLabel value="customJson" control={<Radio />} label="Custom JSON Settings" />
                        </RadioGroup>
                    )}
                />
            </FormControl>

            <Controller
                name="modelInputType"
                control={control}
                render={({ field: { value: modelInputType } }) => (
                    <>
                        {modelInputType === 'select' && (
                            <FormControl margin="normal" variant="outlined" required fullWidth error={!!errors.model}>
                                <InputLabel id="model-select-label">Select Model</InputLabel>
                                <Controller
                                    name="model"
                                    control={control}
                                    rules={{ required: 'Model selection is required' }}
                                    render={({ field }) => (
                                        <Select labelId="model-select-label" label="Select Model" {...field}>
                                            {MODEL_OPTIONS.map((group) => [
                                                <ListSubheader key={group.label}>{group.label}</ListSubheader>,
                                                ...group.options.map((option) => (
                                                    <MenuItem key={option} value={option}>
                                                        {option}
                                                    </MenuItem>
                                                )),
                                            ])}
                                        </Select>
                                    )}
                                />
                                <FormHelperText error={!!errors.model}>{errors.model ? errors.model.message : 'Choose a model from the list'}</FormHelperText>
                            </FormControl>
                        )}

                        {modelInputType === 'customName' && (
                            <FormControl margin="normal" variant="outlined" required fullWidth>
                                <Controller
                                    name="model"
                                    control={control}
                                    rules={{ required: 'Custom model name is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            label="Custom Model Name"
                                            {...field}
                                            error={!!errors.model}
                                            helperText={errors.model ? errors.model.message : 'Enter the exact name of your custom model (e.g., hf/my-model)'}
                                            placeholder="hf/my-custom-model"
                                        />
                                    )}
                                />
                            </FormControl>
                        )}

                        {modelInputType === 'customJson' && (
                            <Box>
                                <FormControl margin="normal" variant="outlined" required fullWidth>
                                    <Controller
                                        name="model"
                                        control={control}
                                        rules={{ required: 'Model name is required for custom settings' }}
                                        render={({ field }) => (
                                            <TextField
                                                label="Model Name (for custom settings)"
                                                {...field}
                                                error={!!errors.model}
                                                helperText={errors.model ? errors.model.message : 'Enter the model identifier used in your custom settings'}
                                                placeholder="your-own-sentence-transformers-model"
                                            />
                                        )}
                                    />
                                </FormControl>
                                <FormControl margin="normal" variant="outlined" required fullWidth>
                                    <Controller
                                        name="modelPropertiesJson"
                                        control={control}
                                        rules={{
                                            required: 'Custom JSON settings are required',
                                            validate: (value) => (value && isValidJson(value)) || 'Invalid JSON format',
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                label="Custom Model Properties (JSON)"
                                                multiline
                                                rows={6}
                                                {...field}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                                                    // Check if Tab key is pressed and the field is empty or whitespace
                                                    if (e.key === 'Tab' && (!field.value || field.value.trim() === '')) {
                                                        e.preventDefault(); // Prevent default Tab behavior (focus change)
                                                        setValue('modelPropertiesJson', customJsonPlaceholder, { shouldValidate: true });
                                                    }
                                                }}
                                                error={!!errors.modelPropertiesJson}
                                                helperText={
                                                    errors.modelPropertiesJson
                                                        ? errors.modelPropertiesJson.message
                                                        : 'Enter the model properties as a valid JSON object (see documentation for structure). Press Tab in empty field to fill placeholder.'
                                                }
                                                placeholder={`Press Tab to fill example...\n${customJsonPlaceholder}`} // Updated placeholder
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Box>
                        )}
                    </>
                )}
            />
        </Grid>
    );
};
