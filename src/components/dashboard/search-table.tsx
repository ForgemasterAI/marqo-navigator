import React, { useState, useEffect, useRef } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Box, Grid, Link, TextField, Typography } from '@mui/material';
import { useDataProvider } from '@refinedev/core';
import { useLocation } from 'react-router-dom';

const SearchTable = () => {
    const dataProvider = useDataProvider();
    const [searchQuery, setSearchQuery] = useState('');
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [selectedRow, setSelectedRow] = useState<any>(null); // Added state
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const activeIndex = query.get('active-index');
    const isFetchingRef = useRef(false);

    useEffect(() => {
        const fetchSearchData = async () => {
            if (!searchQuery) {
                setRows([]);
                setTotalCount(0);
                return;
            }
            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            setLoading(true);
            try {
                const response = await fetch(`${dataProvider('default').getApiUrl()}/indexes/${activeIndex}/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: searchQuery,
                        searchMethod: 'HYBRID',
                        limit: pageSize,
                        offset: (page - 1) * pageSize,
                    }),
                });
                const data = await response.json();
                if (page === 1) {
                    setRows(data.hits);
                } else {
                    setRows((prevRows) => [...prevRows, ...data.hits]);
                }
                setHasNextPage(true);
                setTotalCount(99999);
            } catch (error) {
                setRows([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
                isFetchingRef.current = false;
            }
        };

        const handler = setTimeout(() => {
            fetchSearchData();
        }, 200);

        return () => clearTimeout(handler);
    }, [searchQuery, page, activeIndex, dataProvider, pageSize]);

    const columns: GridColDef[] = [
        { field: '_id', headerName: 'ID', width: 400 },
        {
            field: '_random',
            headerName: 'Value',
            width: 1080,
            renderCell: function render({ row }) {
                return (
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{JSON.stringify(row, null, 2)}</div>
                );
            },
        },
    ];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box sx={{ mb: 2, mt: 2 }}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                            setRows([]);
                            setSelectedRow(null); // Reset selected row
                        }}
                    />
                </Box>
            </Grid>
            <Grid item xs={12} md={8}>
                <Box sx={{ height: 800, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row._id}
                        loading={loading}
                        disableColumnFilter
                        disableDensitySelector
                        rowCount={totalCount}
                        paginationMode="server"
                        pageSizeOptions={[25, 50, 100]}
                        paginationModel={{ page: page - 1, pageSize }}
                        onPaginationModelChange={(model: GridPaginationModel) => {
                            setPage(model.page + 1);
                            setPageSize(model.pageSize);
                        }}
                        onRowClick={(params) => setSelectedRow(params.row)} // Handle row click
                    />
                </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ height: 800 }}>
                <Box
                    sx={{
                        padding: 2,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="h6">Row Preview</Typography>
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            maxHeight: 'calc(100% - 48px)',
                        }}
                    >
                        {selectedRow ? (
                            Object.entries(selectedRow).map(([key, value]) => {
                                if (typeof value === 'string') {
                                    if (value.startsWith('http://') || value.startsWith('https://')) {
                                        // Check file types for rendering
                                        if (value.match(/\.(jpeg|jpg|png)/)) {
                                            return (
                                                <div key={key}>
                                                    <strong>{key}:</strong> <img src={value} alt={key} style={{ maxWidth: '100%' }} />
                                                </div>
                                            );
                                        }
                                        if (value.match(/\.(mp3|wav)/)) {
                                            return (
                                                <div key={key}>
                                                    <strong>{key}:</strong>
                                                    <audio controls>
                                                        <source src={value} type={`audio/${value.split('.').pop()}`} />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                </div>
                                            );
                                        }
                                        if (value.match(/\.(mp4)/)) {
                                            return (
                                                <div key={key}>
                                                    <strong>{key}:</strong>
                                                    <video controls style={{ maxWidth: '100%' }}>
                                                        <source src={value} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={key}>
                                                <strong>{key}:</strong>{' '}
                                                <Link
                                                    style={{
                                                        color: window.matchMedia('(prefers-color-scheme: dark)').matches
                                                            ? '#aqua'
                                                            : '#0000ee',
                                                    }}
                                                    component="a"
                                                    href={value}
                                                >
                                                    {value}
                                                </Link>
                                            </div>
                                        );
                                    }
                                }
                                return (
                                    <div key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                    </div>
                                );
                            })
                        ) : (
                            <Typography variant="body2">Select a row to see details</Typography>
                        )}
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default SearchTable;
