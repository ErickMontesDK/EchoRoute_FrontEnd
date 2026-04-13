import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api, clearAuthData } from "../api/axiosInstance";
import { getBusinessInfo } from "../features/business/api/businessServices";

export default function ProtectedRoutes({ allowedRoles }: { allowedRoles: string[] }) {

    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/users/me/")
            .then((res) => {
                const userRole = res.data.role.toLowerCase();
                setRole(userRole);

                // Ensure localStorage stays in sync with server data
                localStorage.setItem("role", userRole);
                localStorage.setItem("name", res.data.full_name);
                localStorage.setItem("user_id", res.data.id);
                localStorage.setItem("username", res.data.username);

                const businessData = localStorage.getItem("business_data");
                if (!businessData || businessData === "") {
                    getBusinessInfo()
                        .then((res) => {
                            localStorage.setItem("business_data", JSON.stringify(res.data));
                        })
                        .catch(() => {
                            console.error("Error fetching business data");
                        });
                }
            })
            .catch(() => {
                setRole(null);
            })
            .finally(() => {
                setLoading(false);
            });


    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    if (!role || role === "") {
        clearAuthData();
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }
    return <Outlet />;
}