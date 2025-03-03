import React, { useEffect, useMemo } from 'react';
import {
    Grid,
    Button,
} from '@mui/material';
import { Control, useWatch, UseFormSetValue } from 'react-hook-form';
import { IIndexForm } from '../types';
import { FieldRow } from './field-row';

interface AllFieldsSectionProps {
    control: Control<IIndexForm>;
    fields: any[];
    append: (value: any) => void;
    remove: (index: number) => void;
    errors: any;
    register: any;
    setValue: UseFormSetValue<IIndexForm>;
}

export const AllFieldsSection: React.FC<AllFieldsSectionProps> = ({ 
    control, 
    fields, 
    append, 
    remove, 
    errors, 
    register, 
    setValue 
}) => {
    // Watch allFields to detect changes
    const allFieldsValues = useWatch({
        control,
        name: 'allFields',
    });

    // Initialize multimodal_combination fields with empty dependentFields object if needed
    useEffect(() => {
        try {
            fields.forEach((field: any, index: number) => {
                if (field.type === 'multimodal_combination' && (!field.dependentFields || Object.keys(field.dependentFields || {}).length === 0)) {
                    setValue(`allFields.${index}.dependentFields`, {}, { shouldValidate: true });
                }
            });
        } catch (error) {
            console.error("Error initializing multimodal fields:", error);
        }
    }, [fields, setValue]);

    // Get all available field names for dependent field selection
    const availableFieldNames = useMemo(() => {
        return allFieldsValues?.filter((field: any) => 
            field?.name && field.type !== 'multimodal_combination'
        ).map((field: any) => field.name) || [];
    }, [allFieldsValues]);

    return (
        <Grid container spacing={2}>
            {fields.map((field, index) => {
                const currentField = allFieldsValues[index] || {};
                return (
                    <FieldRow
                        key={field.id}
                        index={index}
                        field={field}
                        currentField={currentField}
                        control={control}
                        errors={errors}
                        register={register}
                        remove={remove}
                        setValue={setValue}
                        availableFieldNames={availableFieldNames}
                    />
                );
            })}
            <Grid item xs={12}>
                <Button
                    variant="outlined"
                    onClick={() => append({ name: '', type: '', features: [], dependentFields: {} })}
                    sx={{ mt: 3 }}
                >
                    Add Field
                </Button>
            </Grid>
        </Grid>
    );
};
