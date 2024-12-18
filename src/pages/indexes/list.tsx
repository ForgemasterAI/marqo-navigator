import React from 'react';
import { useDataGrid, ShowButton, List, DeleteButton } from '@refinedev/mui';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export const IndexesList = () => {
    const { dataGridProps } = useDataGrid();

    const columns = React.useMemo<GridColDef[]>(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                type: 'number',
                sortable: false,
                filterable: false,
                minWidth: 50,
            },
            {
                field: 'type',
                headerName: 'Type',
                sortable: false,
                filterable: false,
                minWidth: 150,
            },
            {
                field: 'tensorFields',
                headerName: 'Tensor Fields',
                sortable: false,
                filterable: false,
                minWidth: 150,
            },
            {
                field: 'model',
                headerName: 'Model',
                sortable: false,
                filterable: false,
                minWidth: 150,
            },
            {
                field: 'normalizeEmbeddings',
                headerName: 'Normalize Embeddings',
                sortable: false,
                filterable: false,
                minWidth: 280,
            },
            {
                field: 'vectorNumericType',
                headerName: 'Vector Numeric Type',
                sortable: false,
                filterable: false,
                minWidth: 150,
            },
            {
                field: 'actions',
                headerName: 'Actions',
                sortable: false,
                filterable: false,
                renderCell: function render({ row }) {
                    return (
                        <>
                            <ShowButton hideText recordItemId={row.id} />
                            <DeleteButton hideText recordItemId={row.id} />
                        </>
                    );
                },
                align: 'center',
                headerAlign: 'center',
                minWidth: 80,
            },
        ],
        [],
    );

    return (
        <List>
            <DataGrid {...dataGridProps} getRowId={(row) => row?.id} columns={columns} autoHeight />
        </List>
    );
};
