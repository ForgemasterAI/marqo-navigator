import { useShow } from '@refinedev/core';
import { Show, TextFieldComponent as TextField } from '@refinedev/mui';
import { Typography, Stack, Accordion, AccordionSummary, AccordionDetails, Grid, Card, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Gauge, gaugeClasses } from '@mui/x-charts';
export const IndexesShow = () => {
    const { query } = useShow();
    const { data, isLoading } = query;

    const record = data?.data;
    if (record) {
        console.log(JSON.stringify(record, null, 2));
    }

    return (
        <Show isLoading={isLoading}>
            <Stack gap={2}>
                <Typography variant="h6" fontWeight="bold">
                    Index Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">ID</Typography>
                        <Typography variant="body2">{record?.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">Type</Typography>
                        <Typography variant="body2">{record?.type}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">Model</Typography>
                        <Typography variant="body2">{record?.model}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">Normalize Embeddings</Typography>
                        <Typography variant="body2">{record?.normalizeEmbeddings ? 'True' : 'False'}</Typography>
                    </Grid>
                </Grid>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>All Fields</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {record?.allFields?.length > 0 ? (
                            record?.allFields.map((field: any, index: number) => (
                                <Card key={index} variant="outlined" sx={{ padding: 2, marginBottom: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {field.name}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Type:</strong> {field.type}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Features:</strong> {field.features.join(', ')}
                                    </Typography>
                                </Card>
                            ))
                        ) : (
                            <Typography>No fields availabl for unstructured index</Typography>
                        )}
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Stats</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle1">Number of Documents:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>{record?.stats.numberOfDocuments}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle1">Number of Vectors:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>{record?.stats.numberOfVectors}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle1">Memory Used Percentage:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Gauge
                                    height={100}
                                    width={100}
                                    value={record?.stats.backend.memoryUsedPercentage}
                                    startAngle={-110}
                                    sx={(theme) => {
                                        console.log(theme.palette);
                                        return {
                                            [`& .${gaugeClasses.valueText}`]: {
                                                fontSize: 12,
                                            },
                                            [`& .${gaugeClasses.valueText} text`]: {
                                                fill: theme.palette?.text?.primary ?? '#ffffff',
                                            },
                                            [`& .${gaugeClasses.valueArc}`]: {
                                                fill: '#52b202',
                                            },
                                            [`& .${gaugeClasses.referenceArc}`]: {
                                                fill: theme.palette.text.disabled,
                                            },
                                        };
                                    }}
                                    endAngle={110}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle1">Storage Used Percentage:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Gauge
                                    height={100}
                                    width={100}
                                    value={record?.stats.backend.storageUsedPercentage}
                                    startAngle={-110}
                                    sx={(theme) => {
                                        return {
                                            [`& .${gaugeClasses.valueText}`]: {
                                                fontSize: 12,
                                            },
                                            [`& .${gaugeClasses.valueText} text`]: {
                                                fill: theme.palette.text.primary,
                                            },
                                            [`& .${gaugeClasses.valueArc}`]: {
                                                fill: '#52b202',
                                            },
                                            [`& .${gaugeClasses.referenceArc}`]: {
                                                fill: theme.palette.text.disabled,
                                            },
                                        };
                                    }}
                                    endAngle={110}
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Text Preprocessing</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1">Split Length</Typography>
                                <Typography variant="body2">{record?.textPreprocessing.splitLength}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1">Split Overlap</Typography>
                                <Typography variant="body2">{record?.textPreprocessing.splitOverlap}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1">Split Method</Typography>
                                <Typography variant="body2">{record?.textPreprocessing.splitMethod}</Typography>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>ANN Parameters</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1">Space Type</Typography>
                                <Typography variant="body2">{record?.annParameters.spaceType}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1">EF Construction</Typography>
                                <Typography variant="body2">{record?.annParameters.parameters.efConstruction}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle1">M</Typography>
                                <Typography variant="body2">{record?.annParameters.parameters.m}</Typography>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Show>
    );
};
