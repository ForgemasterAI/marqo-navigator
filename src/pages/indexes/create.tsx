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



// --- Main Component
export const IndexesCreate = () => {
    const {
        saveButtonProps,
        refineCore: { formLoading },
        register,
        control,
        formState: { errors },
        handleSubmit,
    } = useForm({
        defaultValues: {
            indexName: '', // Added default value for indexName
            type: 'unstructured',
            model: '',
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
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'allFields',
    });

    const onFinish = async (data: IIndexForm) => {
        try {
            // Assuming you're using refine's dataProvider
            //@ts-expect-error
            saveButtonProps.onClick(data);
        } catch (error) {
            console.error('Error saving index:', error);
        }
    };

    return (
        <Create
            isLoading={formLoading}
            saveButtonProps={{
                ...saveButtonProps,
                //@ts-expect-error
                onClick: handleSubmit(onFinish),
            }}
        >
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }} autoComplete="off">
                <Grid container spacing={2}>
                    <IndexNameField register={register} errors={errors} />
                    <IndexTypeField control={control as any} errors={errors} />
                    <ModelField register={register} errors={errors} />
                    <AllFieldsSection
                        control={control  as any}
                        fields={fields}
                        append={append}
                        remove={remove}
                        errors={errors}
                        register={register}
                        setValue={(name, value) => {
                            register(name as keyof IIndexForm).onChange(value);
                        }}
                    />
                    <TensorFieldsSection control={control  as any} fields={fields} errors={errors} />
                    <NormalizeEmbeddingsSwitch control={control  as any} />
                    <PreprocessingSection
                        control={control  as any}
                        title="Text Preprocessing"
                        //@ts-ignore
                        splitLengthName="textPreprocessing.splitLength"
                             //@ts-ignore
                        splitOverlapName="textPreprocessing.splitOverlap"
                             //@ts-ignore
                        splitMethodName="textPreprocessing.splitMethod"
                        splitMethodOptions={['sentence', 'word', 'character']}
                    />
                    <PreprocessingSection
                        control={control  as any}
                        title="Video Preprocessing"
                             //@ts-ignore
                        splitLengthName="videoPreprocessing.splitLength"
                             //@ts-ignore
                        splitOverlapName="videoPreprocessing.splitOverlap"
                    />
                    <PreprocessingSection
                        control={control  as any}
                        title="Audio Preprocessing"
                             //@ts-ignore
                        splitLengthName="audioPreprocessing.splitLength"
                             //@ts-ignore
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
                    <AnnParametersSection control={control  as any} />
                </Grid>
            </Box>
        </Create>
    );
};
