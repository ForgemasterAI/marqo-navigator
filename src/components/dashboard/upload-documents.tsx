import React, { useState, useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    TextField,
    Grid,
    FormControlLabel,
    Switch,
    Divider,
    CircularProgress,
    Alert,
    Tooltip,
    LinearProgress,
    Box as MuiBox,
    Paper,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloseIcon from '@mui/icons-material/Close';
import Papa from 'papaparse';
import { useDataProvider } from '@refinedev/core';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface UploadDocumentsDialogProps {
    open: boolean;
    onClose: () => void;
    indexName: string;
    indexModel: string;
}

interface CsvRow {
    [key: string]: string | number;
}

interface MappingField {
    name: string;
    type: 'multimodal_combination';
    weights: { [key: string]: number };
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
    open: boolean;
    message: string;
    type: NotificationType;
    requireConfirmation?: boolean;
}

const UploadDocumentsDialog: React.FC<UploadDocumentsDialogProps> = ({ open, onClose, indexName, indexModel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<CsvRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [tensorFields, setTensorFields] = useState<string[]>([]);
    const [mappings, setMappings] = useState<MappingField[]>([]);
    const [newMappingName, setNewMappingName] = useState<string>('');
    const [newMappingWeights, setNewMappingWeights] = useState<{ [key: string]: number }>({});
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isImageModel, setIsImageModel] = useState<boolean>(false);
    const [totalBatches, setTotalBatches] = useState<number>(0);
    const [currentBatch, setCurrentBatch] = useState<number>(0);
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        type: 'info',
        requireConfirmation: false,
    });

    const BATCH_SIZE = 24;

    const dataProvider = useDataProvider();

    const showNotification = (message: string, type: NotificationType, requireConfirmation: boolean = false) => {
        setNotification({
            open: true,
            message,
            type,
            requireConfirmation,
        });
    };

    const handleCloseNotification = () => {
        if (!notification.requireConfirmation) {
            setNotification((prev) => ({
                ...prev,
                open: false,
            }));
        }
    };

    const handleAcknowledgeNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
            requireConfirmation: false,
        }));

        if (notification.type === 'success') {
            handleDialogClose();
        }
    };

    useEffect(() => {
        if (indexModel?.toLowerCase().includes('clip') || indexModel?.toLowerCase().includes('vit')) {
            setIsImageModel(true);
        } else {
            setIsImageModel(false);
        }
        setMappings([]);
        setNewMappingName('');
        setNewMappingWeights({});
    }, [indexModel, open]);

    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setHeaders([]);
        setSelectedFields([]);
        setTensorFields([]);
        setMappings([]);
        setNewMappingName('');
        setNewMappingWeights({});
        setIsUploading(false);
        setUploadProgress(0);
        setTotalBatches(0);
        setCurrentBatch(0);
        setError(null);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        resetState();
        const currentFile = acceptedFiles[0];
        if (currentFile) {
            setFile(currentFile);
            setError(null);

            if (currentFile.type === 'text/csv') {
                Papa.parse(currentFile, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            setError(`Error parsing CSV: ${results.errors[0].message}`);
                            return;
                        }
                        if (results.data.length === 0 || !results.meta.fields) {
                            setError('CSV file is empty or has no headers.');
                            return;
                        }
                        setHeaders(results.meta.fields);
                        setSelectedFields(results.meta.fields);
                        setTensorFields([]);
                        setParsedData(results.data as CsvRow[]);
                    },
                    error: (err) => {
                        setError(`Error parsing CSV: ${err.message}`);
                    },
                });
            } else if (currentFile.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const jsonContent = event.target?.result as string;
                        const jsonData = JSON.parse(jsonContent);

                        if (!Array.isArray(jsonData)) {
                            setError('JSON file must contain an array of objects.');
                            return;
                        }
                        if (jsonData.length === 0) {
                            setError('JSON array is empty.');
                            return;
                        }
                        const firstItemKeys = Object.keys(jsonData[0]);
                        setHeaders(firstItemKeys);
                        setSelectedFields(firstItemKeys);
                        setTensorFields([]);
                        setParsedData(jsonData);
                    } catch (e: any) {
                        setError(`Error parsing JSON: ${e.message}`);
                    }
                };
                reader.onerror = () => {
                    setError('Error reading JSON file.');
                };
                reader.readAsText(currentFile);
            } else {
                setError('Unsupported file type. Please upload a CSV or JSON file.');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/json': ['.json'],
        },
        maxFiles: 1,
    });

    const handleFieldSelectionChange = (field: string) => {
        setSelectedFields((prev) =>
            prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
        );
        if (!selectedFields.includes(field)) {
            setTensorFields((prev) => prev.filter((f) => f !== field));
            setNewMappingWeights((prev) => {
                const newWeights = { ...prev };
                delete newWeights[field];
                return newWeights;
            });
        }
    };

    const handleTensorFieldChange = (field: string) => {
        const newTensorFields = tensorFields.includes(field)
            ? tensorFields.filter((f) => f !== field)
            : [...tensorFields, field];

        setTensorFields(newTensorFields);

        if (tensorFields.includes(field) && !newTensorFields.includes(field)) {
            if (newMappingWeights[field]) {
                setNewMappingWeights((prev) => {
                    const newWeights = { ...prev };
                    delete newWeights[field];
                    return newWeights;
                });
            }

            setMappings((prev) => {
                return prev
                    .map((mapping) => {
                        if (mapping.weights[field]) {
                            const newWeights = { ...mapping.weights };
                            delete newWeights[field];

                            if (Object.keys(newWeights).length === 0) {
                                return null;
                            }

                            return {
                                ...mapping,
                                weights: newWeights,
                            };
                        }
                        return mapping;
                    })
                    .filter(Boolean) as MappingField[];
            });
        }
    };

    const handleAddMapping = () => {
        if (newMappingName && Object.keys(newMappingWeights).length > 0) {
            if (headers.includes(newMappingName)) {
                setError(
                    `Mapping name "${newMappingName}" conflicts with an existing document field. Please choose a different name.`
                );
                return;
            }

            const nonTensorFields = Object.keys(newMappingWeights).filter(
                (field) => !tensorFields.includes(field)
            );
            if (nonTensorFields.length > 0) {
                setError(
                    `All fields used in mappings must be tensor fields. Please add ${nonTensorFields.join(
                        ', '
                    )} to tensor fields first.`
                );
                return;
            }

            const weightSum = Object.values(newMappingWeights).reduce((sum, w) => sum + w, 0);
            if (Math.abs(weightSum - 1) > 0.01) {
                setError('Weights in a mapping must sum to 1.');
                return;
            }
            setError(null);

            setMappings((prev) => [
                ...prev,
                { name: newMappingName, type: 'multimodal_combination', weights: { ...newMappingWeights } },
            ]);
            setTensorFields((prev) => [...new Set([...prev, newMappingName])]);
            setNewMappingName('');
            setNewMappingWeights({});
        } else {
            setError('Mapping name and at least one weighted field are required.');
        }
    };

    const handleMappingWeightChange = (field: string, weight: string) => {
        const numWeight = parseFloat(weight);
        if (!isNaN(numWeight) && numWeight >= 0 && numWeight <= 1) {
            setNewMappingWeights((prev) => ({ ...prev, [field]: numWeight }));
        } else if (weight === '') {
            setNewMappingWeights((prev) => {
                const newWeights = { ...prev };
                delete newWeights[field];
                return newWeights;
            });
        }
    };

    const handleRemoveMapping = (mappingNameToRemove: string) => {
        setMappings((prev) => prev.filter((m) => m.name !== mappingNameToRemove));
        setTensorFields((prev) => prev.filter((tf) => tf !== mappingNameToRemove));
    };

    const handleUpload = async () => {
        if (!file || parsedData.length === 0 || selectedFields.length === 0) {
            setError('Please select a valid file and ensure fields are selected.');
            return;
        }

        const mappingNames = mappings.map((m) => m.name);
        const conflictingFields = selectedFields.filter((field) => mappingNames.includes(field));

        if (conflictingFields.length > 0) {
            setError(
                `Field name conflict detected: ${conflictingFields.join(
                    ', '
                )} exist as both document fields and mapping names. Please rename your mappings.`
            );
            return;
        }

        setError(null);
        setIsUploading(true);
        setUploadProgress(0);

        const documents = parsedData.map((row) => {
            const doc: { [key: string]: any } = {};
            selectedFields.forEach((field) => {
                if (field === '_id') {
                    doc._id = row[field]?.toString();
                } else if (row[field] !== undefined && row[field] !== null) {
                    doc[field] = row[field];
                }
            });
            return doc;
        });

        const validDocuments = documents.filter(
            (doc) =>
                Object.keys(doc).length > 0 &&
                (doc._id || Object.keys(doc).some((k) => k !== '_id'))
        );

        if (validDocuments.length === 0) {
            setError('No valid documents found after filtering based on selected fields.');
            setIsUploading(false);
            return;
        }

        const batches: Array<typeof validDocuments> = [];
        for (let i = 0; i < validDocuments.length; i += BATCH_SIZE) {
            batches.push(validDocuments.slice(i, i + BATCH_SIZE));
        }

        setTotalBatches(batches.length);
        setCurrentBatch(0);

        const basePayload: any = {
            tensorFields: tensorFields,
        };

        if (mappings.length > 0) {
            const fieldsUsedInMappings = new Set<string>();
            mappings.forEach((mapping) => {
                Object.keys(mapping.weights).forEach((field) => {
                    fieldsUsedInMappings.add(field);
                    if (!tensorFields.includes(field)) {
                        throw new Error(
                            `Field "${field}" is used in mapping "${mapping.name}" but is not a tensor field.`
                        );
                    }
                });
            });

            const allTensorFields = new Set([...tensorFields]);
            mappings.forEach((mapping) => {
                allTensorFields.add(mapping.name);
            });

            basePayload.tensorFields = Array.from(allTensorFields);

            basePayload.mappings = mappings.reduce((acc, mapping) => {
                acc[mapping.name] = { type: mapping.type, weights: mapping.weights };
                return acc;
            }, {} as { [key: string]: any });
        }

        try {
            let successCount = 0;

            for (let i = 0; i < batches.length; i++) {
                setCurrentBatch(i + 1);
                const batchDocuments = batches[i];
                const batchPayload = {
                    ...basePayload,
                    documents: batchDocuments,
                };

                try {
                    const provider = dataProvider('default');
                    if (!provider) {
                        throw new Error('Data provider is undefined');
                    }
                    
                    // Explicitly check and call custom method with proper type handling
                    if (typeof provider.custom === 'function') {
                        await provider.custom({
                            url: `${provider.getApiUrl()}/indexes/${indexName}/documents`,
                            method: 'post',
                            payload: batchPayload,
                            meta: {
                                action: 'addDocuments',
                            },
                        });
                    } else {
                        throw new Error('Custom method not available on data provider');
                    }

                    successCount += batchDocuments.length;
                    const progress = Math.floor(((i + 1) / batches.length) * 100);
                    setUploadProgress(progress);
                } catch (batchErr: any) {
                    console.error(`Error uploading batch ${i + 1}/${batches.length}:`, batchErr);
                    const errorMessage =
                        batchErr?.response?.data?.message ||
                        batchErr?.message ||
                        `Error in batch ${i + 1}`;
                    showNotification(`Batch ${i + 1} failed: ${errorMessage}`, 'warning');
                }
            }

            if (successCount === validDocuments.length) {
                showNotification('All documents uploaded successfully!', 'success', true);
            } else if (successCount > 0) {
                showNotification(
                    `Uploaded ${successCount} of ${validDocuments.length} documents`,
                    'warning',
                    true
                );
            } else {
                throw new Error('Failed to upload any documents');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'An unknown error occurred during upload.';
            setError(`Upload failed: ${errorMessage}`);
            showNotification(`Upload failed: ${errorMessage}`, 'error', true);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDialogClose = () => {
        resetState();
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
                <DialogTitle>
                    Upload Documents to "{indexName}"
                    <IconButton
                        aria-label="close"
                        onClick={handleDialogClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {notification.open && (
                        <Box sx={{ mb: 2 }}>
                            <Alert
                                severity={notification.type}
                                action={
                                    notification.requireConfirmation && (
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={handleAcknowledgeNotification}
                                        >
                                            {notification.type === 'success' ? 'Done' : 'Acknowledge'}
                                        </Button>
                                    )
                                }
                            >
                                {notification.message}
                            </Alert>
                        </Box>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box
                        {...getRootProps()}
                        sx={{
                            border: '2px dashed grey',
                            padding: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            mb: 3,
                            backgroundColor: isDragActive ? 'action.hover' : 'transparent',
                        }}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <Typography>Drop the CSV/JSON file here...</Typography>
                        ) : file ? (
                            <Typography>Selected file: {file.name}</Typography>
                        ) : (
                            <Typography>Drag 'n' drop a CSV or JSON file here, or click to select</Typography>
                        )}
                    </Box>

                    {headers.length > 0 && (
                        <>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                    Configure Fields
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                                            Select Fields to Include
                                        </Typography>
                                        <Paper variant="outlined" sx={{ height: 250, overflow: 'auto' }}>
                                            <List dense>
                                                {headers.map((header) => (
                                                    <ListItem key={header} dense>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={selectedFields.includes(header)}
                                                                    onChange={() => handleFieldSelectionChange(header)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label={header}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                                            Select Tensor Fields
                                            <Tooltip title="Fields selected here will be vectorized by Marqo.">
                                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                            </Tooltip>
                                        </Typography>
                                        <Paper variant="outlined" sx={{ height: 250, overflow: 'auto' }}>
                                            <List dense>
                                                {selectedFields.map((header) => (
                                                    <ListItem key={header} dense>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={tensorFields.includes(header)}
                                                                    onChange={() => handleTensorFieldChange(header)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label={header}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    </ListItem>
                                                ))}
                                                {isImageModel && mappings.map((mapping) => (
                                                    <ListItem key={mapping.name} dense>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={tensorFields.includes(mapping.name)}
                                                                    disabled
                                                                    size="small"
                                                                />
                                                            }
                                                            label={`${mapping.name} (Mapping)`}
                                                            sx={{ width: '100%', fontStyle: 'italic' }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>

                            {isImageModel && (
                                <Box sx={{ mt: 2 }}>
                                    <Divider sx={{ my: 3 }} />
                                    
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                        Multimodal Mappings
                                        <Tooltip title="Define combination fields (e.g., image + text) and their weights. These become new tensor fields.">
                                            <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                        </Tooltip>
                                    </Typography>

                                    {mappings.length > 0 && (
                                        <Paper variant="outlined" sx={{ mb: 3, p: 1 }}>
                                            <List dense>
                                                {mappings.map((mapping) => (
                                                    <ListItem
                                                        key={mapping.name}
                                                        secondaryAction={
                                                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveMapping(mapping.name)}>
                                                                <CloseIcon />
                                                            </IconButton>
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={mapping.name}
                                                            secondary={`Type: ${mapping.type}, Weights: ${JSON.stringify(mapping.weights)}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    )}

                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                                        Add New Mapping
                                    </Typography>
                                    
                                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                            Mapping Configuration
                                            <Tooltip title="Define combination fields with weights that must sum to 1.0">
                                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                            </Tooltip>
                                        </Typography>
                                        
                                        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label="Mapping Field Name"
                                                    value={newMappingName}
                                                    onChange={(e) => setNewMappingName(e.target.value)}
                                                    fullWidth
                                                    size="small"
                                                    helperText="Must be unique and not match any document field"
                                                    error={headers.includes(newMappingName) && newMappingName !== ''}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} sm={8}>
                                                {tensorFields.filter(field => selectedFields.includes(field)).length === 0 ? (
                                                    <Alert severity="warning">
                                                        No tensor fields selected. Please select fields as tensor fields first.
                                                    </Alert>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Assign weights to fields below (weights must sum to 1.0)
                                                    </Typography>
                                                )}
                                            </Grid>
                                        </Grid>
                                        
                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            {tensorFields.filter(field => selectedFields.includes(field)).map((field) => (
                                                <Grid item xs={6} sm={4} md={3} key={field}>
                                                    <TextField
                                                        label={field}
                                                        type="number"
                                                        value={newMappingWeights[field] ?? ''}
                                                        onChange={(e) => handleMappingWeightChange(field, e.target.value)}
                                                        fullWidth
                                                        size="small"
                                                        inputProps={{ step: "0.1", min: "0", max: "1" }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleAddMapping}
                                                disabled={!newMappingName || Object.keys(newMappingWeights).length === 0}
                                                size="small"
                                            >
                                                Add Mapping
                                            </Button>
                                        </Box>
                                    </Paper>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleDialogClose} 
                        color="secondary" 
                        disabled={isUploading || (notification.open && notification.requireConfirmation)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        color="primary"
                        disabled={!file || parsedData.length === 0 || selectedFields.length === 0 || isUploading || (notification.open && notification.requireConfirmation)}
                        startIcon={isUploading ? <CircularProgress size={20} /> : null}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UploadDocumentsDialog;
