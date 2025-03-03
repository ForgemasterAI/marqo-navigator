import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    FormHelperText
} from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import { IIndexForm } from '../types';

interface FieldFeaturesSelectProps {
    index: number;
    control: Control<IIndexForm>;
    error?: any;
}

export const FieldFeaturesSelect: React.FC<FieldFeaturesSelectProps> = ({
    index,
    control,
    error
}) => {
    return (
        <FormControl margin="normal" variant="outlined" fullWidth>
            <InputLabel id={`features-label-${index}`}>{`Field ${index + 1} Features`}</InputLabel>
            <Controller
                control={control}
                name={`allFields.${index}.features`}
                defaultValue={[]}
                render={({ field: controllerField }) => (
                    <Select
                        {...controllerField}
                        labelId={`features-label-${index}`}
                        label={`Field ${index + 1} Features`}
                        multiple
                        error={!!error}
                        renderValue={(selected: string[]) => selected.join(', ')}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 48 * 4.5 + 8,
                                    width: 250,
                                },
                            },
                        }}
                    >
                        {['lexical_search', 'filter', 'score_modifier'].map((feature) => (
                            <MenuItem key={feature} value={feature}>
                                <Checkbox checked={controllerField.value?.includes(feature)} />
                                <ListItemText primary={feature} />
                            </MenuItem>
                        ))}
                    </Select>
                )}
            />
            {error && (
                <FormHelperText error>{error.message}</FormHelperText>
            )}
        </FormControl>
    );
};
