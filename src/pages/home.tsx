import Layout from "../components/Layout";
import DeliveryHome from "../components/DeliveryHome";
import AdminDashboard from "../components/AdminDashboard";
import { CalendarCheck } from 'lucide-react';

export interface DashboardProps {
    userName: string;
    timezone: string;
    locale: string;
    today: Date;
    formatTimestamp: (timestamp: string) => string;
    role: string;
}

export interface RecentActivity {
    id: number;
    type: string;
    title: string;
    timestamp: string;
    description: string;
    metadata: {
        is_productive?: boolean;
        is_valid?: boolean;
        client_code?: string;
        user_name?: string;
    };
}

const DashboardHeader = ({ userName, today, locale, timezone, role }: DashboardProps) => (
    <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 className="fw-bold mb-1 text-dark">Hello, {userName} 👋</h2>
            <p className="text-muted mb-0 d-flex align-items-center small">
                <CalendarCheck size={16} className="me-2 text-primary" />
                {today.toLocaleDateString(locale, {
                    timeZone: timezone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </p>
        </div>
        {(role === 'admin' || role === 'operator') && (
            <div className="d-none d-md-block">
                <span className="badge-custom bg-primary-subtle text-primary border border-primary border-opacity-10 text-capitalize px-3 py-2">
                    {role}
                </span>
            </div>
        )}
    </header>
);

export default function Home() {
    const role = localStorage.getItem("role") || "";
    const userName = localStorage.getItem("name") || "User";
    const businessDataStr = localStorage.getItem("business_data");
    let businessData: any = null;
    try {
        if (businessDataStr) businessData = JSON.parse(businessDataStr);
    } catch { /* ignore */ }
    const timezone = businessData?.time_zone || "America/Mexico_City";
    const locale = businessData?.locale || "en-US";
    const today = new Date();

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();

            const formattedDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const isToday = formattedDate.format(date) === formattedDate.format(now);

            if (isToday) {
                return date.toLocaleTimeString('en-US', {
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                return date.toLocaleDateString('en-US', {
                    timeZone: timezone,
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (e) {
            return timestamp;
        }
    };

    const dashboardProps: DashboardProps = {
        userName,
        timezone,
        locale,
        today,
        formatTimestamp,
        role: role.toLowerCase()
    };



    const renderContent = () => {
        switch (role.toLowerCase()) {
            case 'delivery':
                return (
                    <main className="container-fluid py-4 animate-fade-in delivery-container">
                        <DashboardHeader {...dashboardProps} />
                        <DeliveryHome {...dashboardProps} />
                    </main>
                );
            case 'admin':
            case 'operator':
                return (
                    <div className="container-fluid py-4 animate-fade-in dashboard-container">
                        <DashboardHeader {...dashboardProps} />
                        <AdminDashboard {...dashboardProps} />
                    </div>
                );
            default:
                return (
                    <div className="alert alert-warning m-4">
                        Access not configured for role: {role}
                    </div>
                );
        }
    }

    return (
        <Layout>
            {renderContent()}
        </Layout>
    );
}
