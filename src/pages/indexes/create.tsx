// Refactored code for IndexesCreate
import { Create } from '@refinedev/mui';
import { Box, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';
import { useForm } from '@refinedev/react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';
import React from 'react';
import { IIndexForm } from './types';
import { AllFieldsSection } from './form-components/all-fields.field';
import { AnnParametersSection } from './form-components/ann-parameters.field';
import { IndexNameField, IndexTypeField } from './form-components/index.field';
import { ModelField } from './form-components/model.field';
import { PreprocessingSection } from './form-components/processing.field';
import { NormalizeEmbeddingsSwitch } from './form-components/normalize-embeddings.field';
import { TensorFieldsSection } from './form-components/tensor-fields.field';

// --- Utility Function
const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: any) => {
    const newWeight = parseFloat(e.target.value);
    field.onChange(newWeight);
};

// --- Main Component
export const IndexesCreate = () => {
    const {
        saveButtonProps,
        refineCore: { formLoading },
        register,
        control,
        formState: { errors },
        handleSubmit,
    } = useForm<IIndexForm>({
        defaultValues: {
            indexName: '', // Added default value for indexName
            type: 'unstructured',
            model: '',
            allFields: [],
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
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'allFields',
    });

    const onFinish = async (data: IIndexForm) => {
        try {
            // Assuming you're using refine's dataProvider
            await saveButtonProps.onClick(data);
        } catch (error) {
            console.error('Error saving index:', error);
        }
    };

    return (
        <Create
            isLoading={formLoading}
            saveButtonProps={{
                ...saveButtonProps,
                onClick: handleSubmit(onFinish),
            }}
        >
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }} autoComplete="off">
                <Grid container spacing={2}>
                    <IndexNameField register={register} errors={errors} />
                    <IndexTypeField control={control} errors={errors} />
                    <ModelField register={register} errors={errors} />
                    <AllFieldsSection
                        control={control}
                        fields={fields}
                        append={append}
                        remove={remove}
                        errors={errors}
                        register={register}
                        setValue={(name, value) => {
                            register(name).onChange(value);
                        }}
                    />
                    <TensorFieldsSection control={control} fields={fields} errors={errors} />
                    <NormalizeEmbeddingsSwitch control={control} />
                    <PreprocessingSection
                        control={control}
                        title="Text Preprocessing"
                        splitLengthName="textPreprocessing.splitLength"
                        splitOverlapName="textPreprocessing.splitOverlap"
                        splitMethodName="textPreprocessing.splitMethod"
                        splitMethodOptions={['sentence', 'word', 'character']}
                    />
                    <PreprocessingSection
                        control={control}
                        title="Video Preprocessing"
                        splitLengthName="videoPreprocessing.splitLength"
                        splitOverlapName="videoPreprocessing.splitOverlap"
                    />
                    <PreprocessingSection
                        control={control}
                        title="Audio Preprocessing"
                        splitLengthName="audioPreprocessing.splitLength"
                        splitOverlapName="audioPreprocessing.splitOverlap"
                    />

                    <Grid item xs={12}>
                        <Controller
                            name="vectorNumericType"
                            control={control}
                            defaultValue="bfloat16"
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>Vector Numeric Type</InputLabel>
                                    <Select {...field}>
                                        <MenuItem value="bfloat16">bfloat16</MenuItem>
                                        <MenuItem value="float32">float32</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <AnnParametersSection control={control} />
                </Grid>
            </Box>
        </Create>
    );
};
