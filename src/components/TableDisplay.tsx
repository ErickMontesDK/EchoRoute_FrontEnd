import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    OnChangeFn,
} from '@tanstack/react-table';
import { ArrowDownUp, ChevronDown, ChevronUp, EllipsisVertical, Key, Pencil, RotateCcw, Trash, MapPin } from 'lucide-react';
import './../styles/table.css';

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData, TValue> {
        breakAll?: boolean;
    }
}

interface TableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    pageCount?: number;
    pagination?: {
        pageIndex: number;
        pageSize: number;
    };
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    onPaginationChange?: (updater: any) => void;
    editEnabled?: boolean;
    onLocate?: (data: TData) => void;
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
    onRestore?: (data: TData) => void;
    onChangePassword?: (data: TData) => void;
    focusedMarkerId?: number;
    setFocusedVisitId?: (id: number) => void;
}

export default function TableDisplay<TData>({
    columns,
    data,
    pageCount,
    pagination,
    sorting,
    onSortingChange,
    onPaginationChange,
    editEnabled = false,
    onLocate,
    onEdit,
    onDelete,
    onRestore,
    onChangePassword,
    focusedMarkerId,
    setFocusedVisitId
}: TableProps<TData>) {
    const user_id = localStorage.getItem('user_id');
    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount,
        state: {
            pagination,
            sorting,
        },
        onSortingChange: onSortingChange,
        onPaginationChange: onPaginationChange,
        manualPagination: true,
        manualSorting: true,
        getCoreRowModel: getCoreRowModel(),
    });



    return (
        <>
            <div className="table-responsive rounded-3">
                <table className="table table-bordered table-hover mb-0">

                    <thead className="table-dark">
                        {table.getHeaderGroups().map(headerGroup => {
                            return (
                                <tr key={headerGroup.id}>
                                    {editEnabled && (
                                        <th className="text-center actions-column">
                                            Actions
                                        </th>
                                    )}

                                    {onLocate && (
                                        <th className="text-center" style={{ width: 80 }}>
                                            <MapPin size={16} /> Locate
                                        </th>
                                    )}

                                    {headerGroup.headers.map(header => {
                                        return (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                style={{
                                                    width: header.column.getSize(),
                                                }}
                                                className={`text-center ${header.column.getCanSort() ? 'sortable-header' : 'default-header'}`}
                                            >
                                                <div className="header-cell">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}

                                                    {header.column.getCanSort() && (
                                                        <span className="ms-2">
                                                            {{
                                                                asc: <ChevronUp size={16} className="text-secondary" />,
                                                                desc: <ChevronDown size={16} className="text-secondary" />,
                                                            }[header.column.getIsSorted() as string] ?? <ArrowDownUp size={16} className="text-secondary" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map(row => {
                            const rowData: any = row.original;
                            let rowClassName = rowData.rowClassName || '';
                            const cellClassName = rowData.cellClassName || {};


                            if (focusedMarkerId && rowData.id === focusedMarkerId) {
                                rowClassName += ' table-primary';
                            }

                            return (
                                <tr key={row.id} className={rowClassName}>

                                    {editEnabled && (
                                        <td className="text-center px-0 py-">
                                            <div className="dropdown">
                                                <button
                                                    className="btn btn-outline-dark dropdown-toggle"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                    data-bs-boundary="viewport"
                                                    aria-expanded="false"
                                                    disabled={parseInt(user_id || "") === parseInt(rowData.id || "")}
                                                >
                                                    <EllipsisVertical size={16} />
                                                </button>
                                                <ul className="dropdown-menu p-0 rounded-3">
                                                    {rowData.isDeleted && (
                                                        <li>
                                                            <button
                                                                className="dropdown-item py-2"
                                                                onClick={() => onRestore?.(rowData)}
                                                            >
                                                                Restore <RotateCcw size={16} />
                                                            </button>
                                                        </li>
                                                    )}
                                                    {!rowData.isDeleted && (parseInt(user_id || "") !== rowData.id) && (
                                                        <>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item py-2"
                                                                    onClick={() => onEdit?.(rowData)}
                                                                >
                                                                    Edit <Pencil size={16} />
                                                                </button>
                                                            </li>
                                                            {onChangePassword && (
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item py-2"
                                                                        onClick={() => onChangePassword(rowData)}
                                                                    >
                                                                        Change Password <Key size={16} />
                                                                    </button>
                                                                </li>
                                                            )}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-white bg-danger py-2"
                                                                    onClick={() => onDelete?.(rowData)}
                                                                >
                                                                    Delete <Trash size={16} />
                                                                </button>
                                                            </li>
                                                        </>
                                                    )}


                                                </ul>
                                            </div>
                                        </td>
                                    )}

                                    {onLocate && (
                                        <td className="text-center px-0">
                                            <div className="d-flex align-items-center h-100 w-100 d-flex justify-content-center">
                                                <button
                                                    className="locate-btn btn btn-sm btn-outline-primary p-1 d-flex nowrap align-items-center justify-content-center"
                                                    title="Locate on map"
                                                    onClick={() => onLocate(row.original)}
                                                >
                                                    <MapPin size={14} /> Locate
                                                </button>
                                            </div>
                                        </td>
                                    )}

                                    {row.getVisibleCells().map(cell => {
                                        let variantClassName = ""
                                        if (cell.column.id in cellClassName) {
                                            variantClassName = cellClassName[cell.column.id];
                                        }

                                        return (
                                            <td
                                                key={cell.id}
                                                className={`text-dark text-center ${variantClassName} table-cell`}
                                                style={{ minWidth: cell.column.getSize() }}
                                            >
                                                <div className="table-cell-inner" style={{
                                                    wordBreak: cell.column.columnDef.meta?.breakAll ? 'break-all' : 'normal',
                                                    overflowWrap: cell.column.columnDef.meta?.breakAll ? 'anywhere' : 'normal',
                                                }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {data.length === 0 && (
                    <div className="text-center p-5 text-muted bg-white border-top">
                        <p>There is no data to display</p>
                    </div>
                )}
            </div>

            {pageCount !== undefined && pageCount > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3 bg-white p-3 border rounded shadow-sm">
                    <div className="text-muted small">
                        Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong>
                    </div>
                    <div className="btn-group shadow-sm">
                        <button
                            className={`btn  btn-sm px-3 ${!table.getCanPreviousPage() ? 'disabled btn-outline-secondary' : 'btn-outline-primary'}`}
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </button>
                        <button
                            className={`btn  btn-sm px-3 ${!table.getCanNextPage() ? 'disabled btn-outline-secondary' : 'btn-outline-primary'}`}
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

