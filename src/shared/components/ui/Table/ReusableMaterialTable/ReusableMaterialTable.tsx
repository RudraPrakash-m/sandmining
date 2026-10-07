import { useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import { Box, Typography, Select, MenuItem, Pagination, Menu } from '@mui/material';
import { Upload, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import CommonButton from '@/shared/components/ui/Button';
import { exportToExcel, exportToPDF } from '@/shared/utils/exportUtils';

export interface ReusableMaterialTableProps<T extends Record<string, any>> {
    columns: MRT_ColumnDef<T>[];
    data: T[];
    loading?: boolean;
    enableRowActions?: boolean;
    renderRowActionMenuItems?: (props: any) => React.ReactNode[];
    renderRowActions?: (props: any) => React.ReactNode;
    renderTopToolbarCustomActions?: (props: any) => React.ReactNode;
    enableExport?: boolean;
    onExportPDF?: (rows: any[]) => void;
    onExportExcel?: (rows: any[]) => void;
    exportFileName?: string;
    serverSidePagination?: {
        totalRows: number;
        pageIndex: number;
        pageSize: number;
        onPageChange: (newPageIndex: number) => void;
        onPageSizeChange: (newPageSize: number) => void;
    };
}

interface ExportMenuProps {
    table: any;
    onExportPDF?: (rows: any[]) => void;
    onExportExcel?: (rows: any[]) => void;
}

const ExportMenu = ({ table, onExportPDF, onExportExcel }: Readonly<ExportMenuProps>) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const rows = table.getFilteredRowModel().rows;

    return (
        <Box>
            <CommonButton
                onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
                icon={<Upload size={18} />}
                className="bg-[#DC983F] hover:bg-[#9B340D] text-white font-semibold rounded-lg px-4 h-[40px] flex items-center gap-1.5 cursor-pointer border-none shadow-sm text-sm"
            >
                Export
                <ChevronDown size={16} className="ml-0.5" />
            </CommonButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            borderRadius: '12px',
                            minWidth: '160px',
                        },
                    },
                }}
            >
                <MenuItem onClick={() => { onExportPDF?.(rows); setAnchorEl(null); }} sx={{ gap: 2 }}>
                    <FileText size={18} color="#64748b" />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>PDF</Typography>
                </MenuItem>
                <MenuItem onClick={() => { onExportExcel?.(rows); setAnchorEl(null); }} sx={{ gap: 2 }}>
                    <FileSpreadsheet size={18} color="#64748b" />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>Excel</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};

function ReusableMaterialTable<T extends Record<string, any>>({
    columns, data, loading, enableRowActions, renderRowActionMenuItems,
    renderRowActions, renderTopToolbarCustomActions, enableExport = true,
    onExportPDF, onExportExcel, exportFileName, serverSidePagination,
}: Readonly<ReusableMaterialTableProps<T>>) {

    const handleExportPDF = onExportPDF || ((rows: any[]) => {
        exportToPDF(columns, rows, exportFileName || "export_data");
    });
    const handleExportExcel = onExportExcel || ((rows: any[]) => {
        exportToExcel(columns, rows, exportFileName || "export_data");
    });

    const table = useMaterialReactTable({
        columns,
        data,
        state: { isLoading: loading },
        manualPagination: !!serverSidePagination,
        muiTablePaperProps: {
            elevation: 0,
            sx: { border: '1px solid var(--color-table-border)', borderRadius: '0', boxShadow: 'none', backgroundColor: 'var(--background)' },
        },
        muiTableHeadCellProps: {
            align: 'left',
            sx: {
                backgroundColor: 'var(--color-table-header-bg)',
                color: 'var(--color-table-header-text)',
                fontWeight: 'bold',
                fontSize: '13px',
                borderRight: '1px solid var(--color-table-border)',
                borderBottom: '2px solid var(--color-table-border)',
                py: 1,
                '& .Mui-TableHeadCell-Content': { justifyContent: 'flex-start' },
                '&:last-child': { borderRight: 'none' },
            },
        },
        muiTableBodyRowProps: () => ({
            sx: {
                backgroundColor: 'var(--background)',
                borderBottom: '1px solid var(--color-table-border)',
                '&:hover td': { backgroundColor: 'var(--color-table-row-hover)' },
            },
        }),
        muiTableBodyCellProps: {
            align: 'left',
            sx: {
                borderRight: '1px solid var(--color-table-border)',
                color: 'var(--foreground)',
                padding: '8px 12px',
                fontSize: '13px',
                '&:last-child': { borderRight: 'none' },
            },
        },
        muiTopToolbarProps: { sx: { backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-table-border)', minHeight: '48px' } },
        enableDensityToggle: true,
        enableFullScreenToggle: true,
        enableGlobalFilter: true,
        renderBottomToolbar: ({ table }) => {
            const currentPageSize = serverSidePagination
                ? serverSidePagination.pageSize
                : table.getState().pagination.pageSize;

            const totalRowsCount = serverSidePagination
                ? serverSidePagination.totalRows
                : data.length;

            const selectValue = (currentPageSize >= totalRowsCount || currentPageSize > 150)
                ? 'All'
                : currentPageSize;

            return (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, p: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "13px", color: 'var(--foreground)' }}>Rows per page:</Typography>
                        <Select
                            size="small"
                            value={selectValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'All') {
                                    const allSize = Math.max(totalRowsCount, 100000);
                                    if (serverSidePagination) {
                                        serverSidePagination.onPageSizeChange(allSize);
                                    } else {
                                        table.setPageSize(allSize);
                                    }
                                } else {
                                    const newSize = Number(val);
                                    if (serverSidePagination) {
                                        serverSidePagination.onPageSizeChange(newSize);
                                    } else {
                                        table.setPageSize(newSize);
                                    }
                                }
                            }}
                            sx={{
                                minWidth: 70, height: 30,
                                fontSize: '13px',
                                color: 'var(--foreground)',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-table-border)' },
                                '.MuiSelect-icon': { color: 'var(--foreground)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-input-border)' },
                            }}
                        >
                            {[10, 20, 30, 50, 100, 150, 200, "All"].map((size) => <MenuItem key={size} value={size} sx={{ fontSize: '13px' }}>{size}</MenuItem>)}
                        </Select>
                    </Box>
                    <Pagination
                        count={serverSidePagination ? Math.ceil(serverSidePagination.totalRows / serverSidePagination.pageSize) : table.getPageCount()}
                        page={(serverSidePagination ? serverSidePagination.pageIndex : table.getState().pagination.pageIndex) + 1}
                        onChange={(_, value) => {
                            if (serverSidePagination) {
                                serverSidePagination.onPageChange(value - 1);
                            } else {
                                table.setPageIndex(value - 1);
                            }
                        }}
                        variant="outlined" shape="rounded" size="small" color="primary"
                    />
                </Box>
            );
        },
        initialState: { pagination: { pageSize: 10, pageIndex: 0 }, density: 'compact' },
        renderEmptyRowsFallback: () => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">No records to display</Typography>
            </Box>
        ),
        enableRowActions,
        renderRowActionMenuItems,
        renderRowActions,
        renderTopToolbarCustomActions: (props) => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {renderTopToolbarCustomActions?.(props)}
                {enableExport && <ExportMenu table={table} onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />}
            </Box>
        ),
        positionActionsColumn: 'last',
        enableColumnOrdering: true,
        displayColumnDefOptions: { 'mrt-row-actions': { header: 'Action' } },
    });

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <MaterialReactTable table={table} />
        </div>
    );
}

export default ReusableMaterialTable;
