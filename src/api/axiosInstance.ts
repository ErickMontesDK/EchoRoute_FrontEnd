import axios from "axios";
const baseURL = "/backend";

const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.response.use((response) => {
    return response;

}, async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.data) {
        const serverMessage = error.response.data.message || error.response.data.error;
        if (serverMessage) {
            error.message = serverMessage;
        }
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            await api.post("/auth/refresh/");

            return api(originalRequest);
        } catch (refreshError) {
            localStorage.removeItem("role");
            localStorage.removeItem("name");
            localStorage.removeItem("user_id");
            localStorage.removeItem("username");
            localStorage.removeItem("business_name");
            localStorage.removeItem("logo_url");
            localStorage.removeItem("business_data");
            window.location.href = "/login";
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
});

export { api };