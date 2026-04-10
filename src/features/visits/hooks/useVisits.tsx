import { useEffect, useState } from "react";
import { usePaginatedData } from "../../../hooks/usePaginatedData";
import { deleteVisit as deleteVisitService, getVisits, updateVisit as updateVisitService, restoreVisit as restoreVisitService } from "../api/visitsService";
import { visitMapper } from "../utils/visitMapper";
import { parseApiError } from "../../../utils/errorHandler";

export interface Visit {
    id: number;
    client__name: string;
    client__code: string;
    client__sector: string;
    client__client_type__name: string;
    client_type_id: number;
    client_id: number;
    deliverer__last_name: string;
    deliverer_id: number;
    is_productive_label: string;
    is_validated_label: string;
    is_productive: boolean;
    is_validated: boolean;
    notes: string;
    visited_at: string;
    time: string;
    address: string;
    cellClassName: {
        is_productive: string;
        is_validated: string;
    };
    client_coordinates: [number, number];
    visit_coordinates: [number, number];
    isDeleted: boolean;
}

interface filters {
    client_type: string;
    municipality: string;
    state: string;
    sector: string;
    search_term: string;
    date_from: string;
    date_to: string;
    page: number;
    page_size: number;
    sorting: string;
    is_deleted: boolean;
    is_productive: string;
    is_valid: string;
}

const DEFAULT_FILTERS: filters = {
    client_type: "",
    municipality: "",
    state: "",
    sector: "",
    search_term: "",
    date_from: "",
    date_to: "",
    page: 1,
    page_size: 15,
    sorting: "",
    is_deleted: false,
    is_productive: "",
    is_valid: "",
}
const business = localStorage.getItem("business_data");
let timezone = "America/Mexico_City";
let locale = "es-ES";
try {
    if (business) {
        const parsed = JSON.parse(business);
        timezone = parsed.time_zone || timezone;
        locale = parsed.locale || locale;
    }
} catch { /* ignore */ }

export const useVisits = () => {
    const { data: visits, ...rest } = usePaginatedData({
        defaultFilters: DEFAULT_FILTERS,
        fetchData: getVisits,
        mapData: (visit) => visitMapper(visit, timezone, locale),
        formatFilters: (filters) => ({
            client_type: filters.client_type || undefined,
            municipality: filters.municipality || undefined,
            state: filters.state || undefined,
            sector: filters.sector || undefined,
            search_term: filters.search_term || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            is_deleted: filters.is_deleted || undefined,
            is_productive: filters.is_productive === "true" ? true : filters.is_productive === "false" ? false : undefined,
            is_valid: filters.is_valid === "true" ? true : filters.is_valid === "false" ? false : undefined,
        })
    });

    return {
        visits,
        ...rest
    };
}



export const useUpdateVisitNotes = (visit: Visit | null, setVisit: (visit: Visit | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [formData, setFormData] = useState({
        notes: "",
        is_productive: false,
        is_valid: false
    });

    useEffect(() => {
        if (!visit) return;

        setFormData({
            notes: visit.notes || "",
            is_productive: visit.is_productive || false,
            is_valid: visit.is_validated || false
        });

    }, [visit]);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateVisit = () => {
        updateVisitService(visit!.id, {
            notes: formData.notes,
            is_productive: formData.is_productive,
            is_valid: formData.is_valid
        })
            .then(() => {
                setFormData({ notes: "", is_productive: false, is_valid: false });
                setVisit(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error updating visit:", error);
                if (onError) onError(parseApiError(error));
            });
    }

    return {
        formData,
        setFormData,
        handleChange,
        updateVisit
    };
}

export const useDeleteVisit = (visit: Visit | null, setVisit: (visit: Visit | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const deleteVisit = () => {
        if (!visit) return;

        deleteVisitService(visit.id)
            .then(() => {
                setVisit(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error deleting visit:", error);
                if (onError) onError(parseApiError(error));
            });
    }


    return {
        deleteVisit
    };
}

export const useRestoreVisit = (visitState: Visit | null, setVisit: (visit: Visit | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const restoreVisit = (visitToRestore?: Visit) => {
        const targetVisit = visitToRestore || visitState;
        if (!targetVisit) return;

        restoreVisitService(targetVisit.id)
            .then(() => {
                setVisit(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error restoring visit:", error);
                if (onError) onError(parseApiError(error));
            });
    }

    return {
        restoreVisit
    };
}
