import Layout from "../../../components/Layout";
import TableDisplay from '../../../components/TableDisplay';
import { useEffect, useState } from "react";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import DatePicker from "../../../components/common/inputs/DatePicker";
import { useVisits, Visit, useRestoreVisit } from "../hooks/useVisits";
import { columns } from "./columns";
import { Download, MapPin } from "lucide-react";
import { getClientTypes } from "../../client_types/api/clientTypesService";
import { Option } from "../../../components/common/inputs/Select";
import { getVisitExcel } from "../api/visitsService";
import MapDisplay from "../../../components/MapDisplay";
import { MarkerProps } from "../../../components/MapDisplay";
import MapConfigPanel, { useMapConfig } from "../../../components/MapConfigPanel";

import EditVisitModal from "./modals/EditVisitModal";
import DeleteVisitModal from "./modals/DeleteVisitModal";


const productivityOptions: Option[] = [
    { id: "true", name: "Productive" },
    { id: "false", name: "Non-Productive" },
];

const validationOptions: Option[] = [
    { id: "true", name: "Valid" },
    { id: "false", name: "Invalid" },
];


export default function VisitsData() {
    const [client_types, setClient_types] = useState<Option[] | []>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerProps[] | []>([]);
    const [focusedVisitId, setFocusedVisitId] = useState<number | null>(null);
    const role = localStorage.getItem("role") || "";
    const isAdmin = role.toLowerCase() === "admin";
    const { clientTypeConfig, setClientTypeConfig } = useMapConfig();

    const {
        visits,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting,
        refresh
    } = useVisits();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const filterKeys = [
            "client_type", "municipality", "state", "sector",
            "search_term", "date_from", "date_to", "is_productive", "is_valid"
        ];

        filterKeys.forEach((key) => {
            const value = params.get(key);
            if (value) updateFilters(key as keyof typeof filters, value);
        });

        if (params.get("is_deleted") === "true") {
            updateFilters("is_deleted", true);
        }
    }, [updateFilters]);


    useEffect(() => {
        const markers: MarkerProps[] = visits.map((visit) => ({
            lat: visit.visit_coordinates[0] || 0,
            lng: visit.visit_coordinates[1] || 0,
            popup: visit.client__name,
            type: visit.client_type_id?.toString() || "",
            code: visit.client__code,
            id: visit.client_id,
            visit_id: visit.id,
            visit_date: visit.visited_at,
            visit_time: visit.time,
            is_productive: visit.is_productive,
            notes: visit.notes,
            deliverer_name: `${visit.deliverer__last_name}`,
            address: visit.address,
            sector: visit.client__sector,
            is_valid: visit.is_validated,
        }));
        setMarkers(markers);
    }, [visits]);


    const { restoreVisit } = useRestoreVisit(selectedVisit, setSelectedVisit, refresh, (msg) => setErrorMessage(msg));


    useEffect(() => {
        getClientTypes().then((data) => {
            const formattedClientTypes = data.map((client_type) => ({
                id: client_type.id,
                name: client_type.name,
            }));
            setClient_types(formattedClientTypes);
        });
    }, []);



    return (
        <Layout>
            <div className="animate-fade-in">
                <h1><MapPin size={34} className="flex-shrink-0 me-2 text-primary mb-1" />Visits Data</h1>
                <div className="filters-card p-4 mb-4 shadow-sm border rounded bg-white">

                    {errorMessage && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {errorMessage}
                        </div>
                    )}


                    <h5 className="mb-3 text-secondary">Filters</h5>

                    <div className="row g-3 mb-4">
                        <div className="col-md-4 col-lg-3">
                            <Select
                                name="client_type"
                                id="client_type"
                                value={filters.client_type}
                                onChange={(e) => updateFilters("client_type", e.target.value)}
                                options={client_types}
                                placeholder="All"
                                label="Client Type"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_municipality"
                                id="client_municipality"
                                value={filters.municipality}
                                onChange={(e) => updateFilters("municipality", e.target.value)}
                                placeholder="All municipalities"
                                label="Municipality"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_state"
                                id="client_state"
                                value={filters.state}
                                onChange={(e) => updateFilters("state", e.target.value)}
                                placeholder="All states"
                                label="State"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_sector"
                                id="client_sector"
                                value={filters.sector}
                                onChange={(e) => updateFilters("sector", e.target.value)}
                                placeholder="All sectors"
                                label="Sector"
                            />
                        </div>

                        <div className="col-md-4 col-lg-3">
                            <Select
                                name="is_productive"
                                id="is_productive"
                                value={filters.is_productive}
                                onChange={(e) => updateFilters("is_productive", e.target.value)}
                                options={productivityOptions}
                                placeholder="All Status"
                                label="Productivity"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Select
                                name="is_valid"
                                id="is_valid"
                                value={filters.is_valid}
                                onChange={(e) => updateFilters("is_valid", e.target.value)}
                                options={validationOptions}
                                placeholder="All Status"
                                label="Validation"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <DatePicker
                                name="date_from"
                                id="date_from"
                                value={filters.date_from}
                                onChange={(iso) => updateFilters("date_from", iso)}
                                label="Date From"
                                mode="start"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <DatePicker
                                name="date_to"
                                id="date_to"
                                value={filters.date_to}
                                onChange={(iso) => updateFilters("date_to", iso)}
                                label="Date To"
                                mode="end"
                            />
                        </div>

                        <div className="col-md-8 col-lg-6">
                            <Searchbar
                                name="search"
                                id="search"
                                value={filters.search_term}
                                onChange={(e) => updateFilters("search_term", e.target.value)}
                                placeholder="Search by name, code, address..."
                                label="Search Term"
                            />
                        </div>
                        {isAdmin && (
                            <div className="col-md-4 col-lg-3 d-flex align-items-end">
                                <div className="form-check form-switch p-2 border rounded w-100 bg-light d-flex align-items-center" style={{ height: '48px' }}>
                                    <input
                                        className="form-check-input ms-2 me-2"
                                        type="checkbox"
                                        role="switch"
                                        id="show_deleted_visits"
                                        checked={filters.is_deleted}
                                        onChange={(e) => updateFilters("is_deleted", e.target.checked)}
                                    />
                                    <label className="form-check-label mb-0" htmlFor="show_deleted_visits">Show Deleted</label>
                                </div>
                            </div>
                        )}
                        <div className={`col-md-4 col-lg-3 d-flex align-items-end`}>
                            <button
                                className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                                style={{ height: '48px', fontWeight: '500' }}
                                onClick={() => {
                                    setErrorMessage(null);
                                    getVisitExcel({
                                        ...filters,
                                        is_productive: filters.is_productive === "true" ? true : filters.is_productive === "false" ? false : undefined,
                                        is_valid: filters.is_valid === "true" ? true : filters.is_valid === "false" ? false : undefined,
                                    }).catch((err) => {
                                        setErrorMessage("Error exporting visits: " + (err.message || "Unknown error"));
                                    });
                                }}
                            >
                                <Download size={20} />
                                Export to Excel
                            </button>
                        </div>
                    </div>
                </div>
                <MapConfigPanel
                    clientTypes={client_types}
                    clientTypeConfig={clientTypeConfig}
                    setClientTypeConfig={setClientTypeConfig}
                />

                <MapDisplay markers={markers} config={clientTypeConfig} focusedVisitId={focusedVisitId} setFocusedVisitId={setFocusedVisitId} />

                <TableDisplay
                    columns={columns}
                    data={visits}
                    pageCount={totalPages}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    editEnabled={true}
                    onEdit={(visit) => {
                        setErrorMessage(null);
                        setSelectedVisit(visit);
                        setShowEditModal(true);
                    }}
                    onDelete={(visit) => {
                        setErrorMessage(null);
                        setSelectedVisit(visit);
                        setShowDeleteModal(true);
                    }}
                    onRestore={(visit) => {
                        setErrorMessage(null);
                        setSelectedVisit(visit);
                        restoreVisit(visit);
                    }}
                    onLocate={(visit) => {
                        setFocusedVisitId((visit as Visit).id);
                        document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    setFocusedVisitId={setFocusedVisitId}
                    focusedMarkerId={focusedVisitId ?? undefined}
                />
            </div>

            <EditVisitModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={refresh}
                visit={selectedVisit}
            />

            <DeleteVisitModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onSuccess={refresh}
                visit={selectedVisit}
            />
        </Layout>
    );
}
