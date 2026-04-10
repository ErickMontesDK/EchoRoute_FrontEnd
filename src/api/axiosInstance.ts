import axios from "axios";
// Use /api in local dev (due to setupProxy.js) and /backend in production (due to vercel.json)
const baseURL = process.env.NODE_ENV === 'production' ? "/backend" : "/api";

const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

const clearAuthData = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("business_name");
    localStorage.removeItem("logo_url");
    localStorage.removeItem("business_data");
};

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

        // If a refresh is already in progress, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return api(originalRequest);
            }).catch((err) => {
                return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
            await axios.post(`${baseURL}/auth/refresh/`, null, { withCredentials: true });
            processQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            clearAuthData();
            // Only redirect to /login if we're not already there (avoids infinite reload)
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }

    return Promise.reject(error);
});

export { api, clearAuthData };