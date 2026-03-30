import Layout from "../../../components/Layout";
import { useEffect, useState } from "react";
import { useClients, useClientsMap, useRestoreClient } from "../hooks/useClients";
import { Client } from "../hooks/useClients";
import Searchbar from "../../../components/common/inputs/Searchbar";
import Select, { Option } from "../../../components/common/inputs/Select";
import TableDisplay from "../../../components/TableDisplay";
import { columns } from "./columns";
import { Download, Store } from "lucide-react";
import { getClientTypes } from "../../client_types/api/clientTypesService";
import { getClientExcel } from "../api/clientsServices";
import MapDisplay, { MarkerProps } from "../../../components/MapDisplay";
import MapConfigPanel, { useMapConfig } from "../../../components/MapConfigPanel";

import EditClientModal from "./modals/EditClientModal";
import DeleteClientModal from "./modals/DeleteClientModal";


const activeOptions: Option[] = [
    { id: "true", name: "Active" },
    { id: "false", name: "Inactive" },
];



export default function ClientsData() {
    const [client_types, setClient_types] = useState<Option[] | []>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [focusedClientId, setFocusedClientId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerProps[] | []>([]);
    const role = localStorage.getItem("role") || "";
    const isAdmin = role.toLowerCase() === "admin";


    const {
        clients,
        totalPages,
        pagination, setPagination,
        filters, updateFilters,
        sorting, setSorting,
        refresh,
        refreshKey
    } = useClients();



    const { restoreClient } = useRestoreClient(selectedClient, setSelectedClient, refresh, (msg) => setErrorMessage(msg));


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const filterKeys = [
            "code", "client_type", "municipality", "state",
            "sector", "market", "address", "name", "is_active"
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
        getClientTypes().then((data) => {
            const formattedClientTypes = data.map((client_type) => ({
                id: client_type.id,
                name: client_type.name,
            }));
            setClient_types(formattedClientTypes);
        });
    }, []);

    const { clientsMap } = useClientsMap(filters, refreshKey);
    const { clientTypeConfig, setClientTypeConfig } = useMapConfig();

    useEffect(() => {
        setMarkers(clientsMap.map((client) => ({
            lat: client.latitude,
            lng: client.longitude,
            popup: client.name,
            type: client.client_type,
            code: client.code,
            id: client.id,
            address: client.address,
            sector: client.sector,
            market: client.market,
            is_active: client.is_active,
        })));
    }, [clientsMap]);



    return (
        <Layout>
            <div className="animate-fade-in">
                <h1><Store size={34} className="flex-shrink-0 me-2 text-primary mb-1" />Clients Data</h1>
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
                            <Searchbar
                                name="client_market"
                                id="client_market"
                                value={filters.market}
                                onChange={(e) => updateFilters("market", e.target.value)}
                                placeholder="All markets"
                                label="Market"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="address"
                                id="address"
                                value={filters.address}
                                onChange={(e) => updateFilters("address", e.target.value)}
                                placeholder="Search by address..."
                                label="Address"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_name"
                                id="client_name"
                                value={filters.name}
                                onChange={(e) => updateFilters("name", e.target.value)}
                                placeholder="All names"
                                label="Name"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_code"
                                id="client_code"
                                value={filters.code}
                                onChange={(e) => updateFilters("code", e.target.value)}
                                placeholder="All codes"
                                label="Code"
                            />
                        </div>

                        <div className="col-md-4 col-lg-3">
                            <Select
                                name="is_active"
                                id="is_active"
                                value={filters.is_active}
                                onChange={(e) => updateFilters("is_active", e.target.value)}
                                options={activeOptions}
                                placeholder="All Status"
                                label="Active Status"
                            />
                        </div>
                        {isAdmin && (
                            <div className="col-md-4 col-lg-3 d-flex align-items-end">
                                <div className="form-check form-switch p-2 border rounded w-100 bg-light d-flex align-items-center" style={{ height: '48px' }}>
                                    <input
                                        className="form-check-input ms-2 me-2"
                                        type="checkbox"
                                        role="switch"
                                        id="show_deleted"
                                        checked={filters.is_deleted}
                                        onChange={(e) => updateFilters("is_deleted", e.target.checked)}
                                    />
                                    <label className="form-check-label mb-0" htmlFor="show_deleted">Show Deleted</label>
                                </div>
                            </div>
                        )}
                        <div className={`col-md-4 col-lg-3 d-flex align-items-end`}>
                            <button
                                className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                                style={{ height: '48px', fontWeight: '500' }}
                                onClick={() => {
                                    setErrorMessage(null);
                                    getClientExcel({
                                        ...filters,
                                        is_active: filters.is_active === "true" ? true : filters.is_active === "false" ? false : undefined,
                                    }).catch((err) => {
                                        setErrorMessage("Error exporting clients: " + (err.message || "Unknown error"));
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

                <MapDisplay markers={markers} config={clientTypeConfig} focusedVisitId={focusedClientId} setFocusedVisitId={setFocusedClientId} />

                <TableDisplay
                    columns={columns}
                    data={clients}
                    pageCount={totalPages}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    editEnabled={true}
                    onEdit={(client) => {
                        setErrorMessage(null);
                        setSelectedClient(client);
                        setShowEditModal(true);
                    }}
                    onDelete={(client) => {
                        setErrorMessage(null);
                        setSelectedClient(client);
                        setShowDeleteModal(true);
                    }}
                    onRestore={(client) => {
                        setErrorMessage(null);
                        setSelectedClient(client);
                        restoreClient(client);
                    }}
                    onLocate={(client) => {
                        setFocusedClientId((client as Client).id);
                        document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    focusedMarkerId={focusedClientId ?? undefined}
                />

            </div>

            <EditClientModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={refresh}
                client={selectedClient}
                client_types={client_types}
                key={`edit-${selectedClient?.id ?? 'closed'}-${showEditModal}`}
            />

            <DeleteClientModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onSuccess={refresh}
                client={selectedClient}
                key={`delete-${selectedClient?.id ?? 'closed'}-${showDeleteModal}`}
            />
        </Layout >
    );
}