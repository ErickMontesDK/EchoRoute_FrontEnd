import { api } from "../../../api/axiosInstance";

interface VisitParams {
    client_type?: string;
    municipality?: string;
    state?: string;
    sector?: string;
    search_term?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
    sorting?: string;
    is_deleted?: boolean;
    is_productive?: boolean;
    is_valid?: boolean;
    signal?: AbortSignal;
}

const getVisits = async (params: VisitParams) => {
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/visits/", { params: restParams, signal });
        return response.data as {
            count: number;
            results: any[];
            total_pages: number;
        }

    } catch (error) {
        console.error("Error fetching visits:", error);
        throw error;
    }
}

const getVisitById = async (id: number) => {
    try {
        const response = await api.get(`/visits/${id}/`);
        return response.data

    } catch (error) {
        console.error("Error fetching visits:", error);
        throw error;
    }
}

const updateVisit = async (id: number, data: { notes?: string, is_productive?: boolean, is_valid?: boolean }) => {
    try {
        const response = await api.patch(`/visits/${id}/`, data);
        return response.data

    } catch (error) {
        console.error("Error updating visit:", error);
        throw error;
    }
}

const restoreVisit = async (id: number) => {
    try {
        const response = await api.patch(`/visits/${id}/restore/`);
        return response.data

    } catch (error) {
        console.error("Error restoring visit:", error);
        throw error;
    }
}

const deleteVisit = async (id: number) => {
    try {
        const response = await api.delete(`/visits/${id}/`);
        return response.data

    } catch (error) {
        console.error("Error deleting visit:", error);
        throw error;
    }
}

export const registerVisit = async (data: {
    client: number,
    visited_at: string,
    latitude_recorded: number,
    longitude_recorded: number,
    is_productive: boolean,
    notes: string,
}) => {
    try {
        const response = await api.post("/visits/", data);
        return response.data

    } catch (error) {
        console.error("Error registering visit:", error);
        throw error;
    }
}

const getVisitExcel = async (params: VisitParams) => {
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/visits/export/", { params: restParams, signal, responseType: "blob" });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `visits_report_${new Date().toISOString().split("T")[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error fetching visits:", error);
        throw error;
    }
}

export { getVisits, getVisitById, updateVisit, deleteVisit, getVisitExcel, restoreVisit };
