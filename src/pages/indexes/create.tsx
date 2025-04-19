// Refactored code for IndexesCreate
import { Create } from '@refinedev/mui';
import { 
    Box, 
    Grid, 
    Typography, 
    Divider, 
    Paper, 
    MenuItem, 
    Select, 
    FormControl, 
    FormHelperText,
    InputLabel, 
    Stepper, 
    Step, 
    StepLabel,
    Button,
    useTheme
} from '@mui/material';
import { useForm } from '@refinedev/react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';
import React, { useState } from 'react';
import { IIndexForm } from './types';
import { 
    AllFieldsSection,
    AnnParametersSection,
    IndexNameField, 
    IndexTypeField,
    ModelField,
    PreprocessingSection,
    NormalizeEmbeddingsSwitch,
    TensorFieldsSection
} from './form-components';

// Form sections for stepper
const steps = ['Basic Settings', 'Fields Configuration', 'Processing Settings', 'Advanced Settings'];

export const IndexesCreate = () => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    
    const {
        saveButtonProps,
        refineCore: { formLoading, onFinish: refineOnFinish },
        register,
        control,
        formState: { errors, isValid },
        handleSubmit,
        setValue,
        trigger,
        watch,
    } = useForm<IIndexForm>({
        defaultValues: {
            indexName: '',
            type: 'unstructured',
            model: '',
            modelInputType: 'select',
            modelPropertiesJson: '',
            allFields: [] as any[],
            tensorFields: {
                type: 'select',
                values: [],
            },
            normalizeEmbeddings: true,
            textPreprocessing: {
                splitLength: 6,
                splitOverlap: 1,
                splitMethod: 'sentence',
            },
            imagePreprocessing: {},
            videoPreprocessing: {
                splitLength: 20,
                splitOverlap: 3,
            },
            audioPreprocessing: {
                splitLength: 10,
                splitOverlap: 3,
            },
            vectorNumericType: 'bfloat16',
            annParameters: {
                spaceType: 'prenormalized-angular',
                parameters: {
                    efConstruction: 512,
                    m: 16,
                },
            },
        },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'allFields',
    });

    const handleNext = async () => {
        // Validate current section fields before proceeding
        let canProceed = false;
        
        if (activeStep === 0) {
            canProceed = await trigger(['indexName', 'type', 'model']);
        } else if (activeStep === 1) {
            canProceed = await trigger(['allFields', 'tensorFields']);
        } else {
            canProceed = true;
        }
        
        if (canProceed) {
            setActiveStep(prevStep => Math.min(prevStep + 1, steps.length - 1));
        }
    };

    const handleBack = () => {
        setActiveStep(prevStep => Math.max(prevStep - 1, 0));
    };

    const onFinish = async (data: IIndexForm) => {
        const payload: any = { ...data };

        if (data.modelInputType === 'customJson' && data.modelPropertiesJson) {
            try {
                payload.modelProperties = JSON.parse(data.modelPropertiesJson);
            } catch (error) {
                console.error('Error parsing modelProperties JSON:', error);
                return;
            }
        }

        delete payload.modelInputType;
        delete payload.modelPropertiesJson;

        try {
            await refineOnFinish(payload);
        } catch (error) {
            console.error('Error saving index:', error);
        }
    };

    // Watch form values
    const indexType = watch('type');

    return (
        <Create
            isLoading={formLoading}
            saveButtonProps={{
                ...saveButtonProps,
                onClick: handleSubmit(onFinish),
                style: { display: activeStep === steps.length - 1 ? 'inline-flex' : 'none' }
            }}
            title="Create New Index"
            wrapperProps={{
                sx: {
                    '& .MuiPaper-root': {
                        paddingX: { xs: 2, md: 4 },
                        paddingBottom: 3
                    }
                }
            }}
        >
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }} autoComplete="off">
                {/* Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 3, pb: 2 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step 1: Basic Settings */}
                <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                            Basic Index Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Enter the core details for your index. These settings define how your index will be identified and structured.
                        </Typography>
                        <Grid container spacing={3}>
                            <IndexNameField register={register} errors={errors} />
                            <IndexTypeField control={control} errors={errors} />
                            <ModelField control={control} errors={errors} setValue={setValue} />
                        </Grid>
                    </Paper>
                </Box>

                {/* Step 2: Fields Configuration */}
                <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                            Fields Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Define the fields for your index and their properties. These fields will determine how data is structured and indexed.
                        </Typography>
                        <AllFieldsSection
                            control={control}
                            fields={fields}
                            append={append}
                            remove={remove}
                            errors={errors}
                            register={register}
                            setValue={setValue}
                        />
                    </Paper>
                    
                    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
                            Tensor Fields
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Select which fields should be processed as tensors for vector search capabilities.
                        </Typography>
                        <TensorFieldsSection control={control} fields={fields} errors={errors} />
                        <NormalizeEmbeddingsSwitch control={control} />
                    </Paper>
                </Box>

                {/* Step 3: Processing Settings */}
                <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
                    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                            Content Processing Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Configure how different content types should be processed and split for optimal indexing.
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <PreprocessingSection
                                control={control}
                                title="Text Preprocessing"
                                description="Define how text content should be split for processing."
                                splitLengthName="textPreprocessing.splitLength"
                                splitOverlapName="textPreprocessing.splitOverlap"
                                splitMethodName="textPreprocessing.splitMethod"
                                splitMethodOptions={['sentence', 'word', 'character']}
                            />
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            
                            <PreprocessingSection
                                control={control}
                                title="Video Preprocessing"
                                description="Define how video content should be split for processing."
                                splitLengthName="videoPreprocessing.splitLength"
                                splitOverlapName="videoPreprocessing.splitOverlap"
                            />
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            
                            <PreprocessingSection
                                control={control}
                                title="Audio Preprocessing"
                                description="Define how audio content should be split for processing."
                                splitLengthName="audioPreprocessing.splitLength"
                                splitOverlapName="audioPreprocessing.splitOverlap"
                            />
                        </Grid>
                    </Paper>
                </Box>

                {/* Step 4: Advanced Settings */}
                <Box sx={{ display: activeStep === 3 ? 'block' : 'none' }}>
                    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                            Advanced Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Configure advanced technical settings for your index.
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="vectorNumericType"
                                    control={control}
                                    defaultValue="bfloat16"
                                    render={({ field }) => (
                                        <FormControl fullWidth>
                                            <InputLabel id="vector-numeric-type-label">Vector Numeric Type</InputLabel>
                                            <Select
                                                {...field}
                                                labelId="vector-numeric-type-label"
                                                label="Vector Numeric Type"
                                            >
                                                <MenuItem value="bfloat16">bfloat16</MenuItem>
                                                <MenuItem value="float32">float32</MenuItem>
                                            </Select>
                                            <FormHelperText>
                                                Determines the precision of vector storage
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            
                            <AnnParametersSection control={control} />
                        </Grid>
                    </Paper>
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                    >
                        Back
                    </Button>
                    {activeStep < steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            color="primary"
                        >
                            Next
                        </Button>
                    ) : null}
                </Box>
            </Box>
        </Create>
    );
};
