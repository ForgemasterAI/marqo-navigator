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
import { Controller, useFieldArray, Control, UseFormSetValue, SubmitHandler, FieldValues } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { IIndexForm, IField } from './types';
import { 
    AllFieldsSection,
    AnnParametersSection,
    IndexNameField, 
    IndexTypeField,
    ModelField,
    PreprocessingSection,
    NormalizeEmbeddingsSwitch,
    TensorFieldsSection,
    TreatUrlsAsImagesSwitch
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
            treatUrlsAndPointersAsImages: false, // Add default value here
            allFields: [] as IField[],
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

    const currentModel = watch('model');
    const modelInputType = watch('modelInputType');

    // Effect to automatically set treatUrlsAndPointersAsImages for specific models
    useEffect(() => {
        if (modelInputType === 'select') {
            const isMarqoEcommerce = 
                currentModel === 'Marqo/marqo-ecommerce-embeddings-B' || 
                currentModel === 'Marqo/marqo-ecommerce-embeddings-L';
            
            // Set the toggle state based on the model
            setValue('treatUrlsAndPointersAsImages', isMarqoEcommerce, { shouldDirty: true });
        }
    }, [currentModel, modelInputType, setValue]);

    const handleNext = async () => {
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

        // Handle specific Marqo models selected via dropdown
        if (data.modelInputType === 'select') {
            if (data.model === 'Marqo/marqo-ecommerce-embeddings-B') {
                payload.modelProperties = {
                    name: "hf-hub:Marqo/marqo-ecommerce-embeddings-B",
                    dimensions: 768,
                    type: "open_clip"
                };
                payload.treatUrlsAndPointersAsImages = true; // Ensure this is true
            } else if (data.model === 'Marqo/marqo-ecommerce-embeddings-L') {
                payload.modelProperties = {
                    name: "hf-hub:Marqo/marqo-ecommerce-embeddings-L",
                    dimensions: 1024,
                    type: "open_clip"
                };
                payload.treatUrlsAndPointersAsImages = true; // Ensure this is true
            }
        } 
        // Handle custom JSON input
        else if (data.modelInputType === 'customJson' && data.modelPropertiesJson) {
            try {
                payload.modelProperties = JSON.parse(data.modelPropertiesJson);
            } catch (error) {
                console.error('Error parsing modelProperties JSON:', error);
                return; // Prevent submission with invalid JSON
            }
        }

        // Clean up form-specific fields before sending
        delete payload.modelInputType;
        delete payload.modelPropertiesJson;

        // Ensure treatUrlsAndPointersAsImages is only sent if true
        if (!payload.treatUrlsAndPointersAsImages) {
             delete payload.treatUrlsAndPointersAsImages; // Remove if false
        }

        try {
            await refineOnFinish(payload);
        } catch (error) {
            console.error('Error saving index:', error);
        }
    };

    return (
        <Create
            isLoading={formLoading}
            saveButtonProps={{
                ...saveButtonProps,
                onClick: handleSubmit(onFinish as unknown as SubmitHandler<FieldValues>),
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
                <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 3, pb: 2 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

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
                            <IndexTypeField control={control as unknown as Control<IIndexForm>} errors={errors} />
                            <ModelField control={control as unknown as Control<IIndexForm>} errors={errors} setValue={setValue as unknown as UseFormSetValue<IIndexForm>} />
                            
                            {/* Add the new toggle component */}
                            <TreatUrlsAsImagesSwitch 
                                control={control as unknown as Control<IIndexForm>}
                                model={currentModel}
                            />
                        </Grid>
                    </Paper>
                </Box>

                <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                            Fields Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Define the fields for your index and their properties. These fields will determine how data is structured and indexed.
                        </Typography>
                        <AllFieldsSection
                            control={control as unknown as Control<IIndexForm>}
                            fields={fields as unknown as IField[]}
                            append={append}
                            remove={remove}
                            errors={errors}
                            register={register}
                            setValue={setValue as unknown as UseFormSetValue<IIndexForm>}
                        />
                    </Paper>
                    
                    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
                            Tensor Fields
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Select which fields should be processed as tensors for vector search capabilities.
                        </Typography>
                        <TensorFieldsSection control={control as unknown as Control<IIndexForm>} fields={fields as unknown as IField[]} errors={errors} />
                        <NormalizeEmbeddingsSwitch control={control as unknown as Control<IIndexForm>} />
                    </Paper>
                </Box>

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
                                control={control as unknown as Control<IIndexForm>}
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
                                control={control as unknown as Control<IIndexForm>}
                                title="Video Preprocessing"
                                description="Define how video content should be split for processing."
                                splitLengthName="videoPreprocessing.splitLength"
                                splitOverlapName="videoPreprocessing.splitOverlap"
                            />
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            
                            <PreprocessingSection
                                control={control as unknown as Control<IIndexForm>}
                                title="Audio Preprocessing"
                                description="Define how audio content should be split for processing."
                                splitLengthName="audioPreprocessing.splitLength"
                                splitOverlapName="audioPreprocessing.splitOverlap"
                            />
                        </Grid>
                    </Paper>
                </Box>

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
                            
                            <AnnParametersSection control={control as unknown as Control<IIndexForm>} />
                        </Grid>
                    </Paper>
                </Box>

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
