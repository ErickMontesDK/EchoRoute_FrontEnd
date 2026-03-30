import { ColumnDef } from '@tanstack/react-table';
import { Visit } from "../hooks/useVisits";

export const columns: ColumnDef<Visit>[] = [
    { header: 'ID', accessorKey: 'id', size: 50 },
    { header: 'Client', accessorKey: 'client__name', size: 150 },
    { header: 'Code', accessorKey: 'client__code', size: 100, meta: { breakAll: true } },
    { header: 'Type', accessorKey: 'client__client_type__name', size: 130 },
    { header: 'Sector', accessorKey: 'client__sector', size: 120 },
    { header: 'Deliverer', accessorKey: 'deliverer__last_name', size: 150 },
    { header: 'Date', accessorKey: 'visited_at', size: 140 },
    { header: 'Time', accessorKey: 'time', size: 120, enableSorting: false },
    { header: 'Address', accessorKey: 'address', size: 250, enableSorting: false },
    { id: 'is_productive', header: 'Prod.', accessorKey: 'is_productive_label', size: 80 },
    { id: 'is_validated', header: 'Valid.', accessorKey: 'is_validated_label', size: 80 },
    { header: 'Notes', accessorKey: 'notes', size: 350, enableSorting: false },
];
