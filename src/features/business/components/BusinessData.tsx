import Layout from "../../../components/Layout";
import { useState, useEffect } from "react";
import { Briefcase, Globe, Languages, Ruler, Navigation, Clock, Calendar, Edit3, CircleCheck, Tag, Plus, Trash2 } from "lucide-react";
import { useBusiness } from "../hooks/useBusiness";
import { ClientType, getClientTypes } from "../../client_types/api/clientTypesService";
import "../../../styles/business-data.css";

// Modals
import EditBusinessModal from "./modals/EditBusinessModal";
import ClientTypeModal from "./modals/ClientTypeModal";
import DeleteClientTypeModal from "./modals/DeleteClientTypeModal";

const InfoCard = ({ title, icon: Icon, children, bgColor = "primary" }: any) => (
    <div className="col-lg-6">
        <div className="info-card-container">
            <h5 className="mb-4 fw-bold d-flex align-items-center text-dark">
                <Icon size={20} className={`text-${bgColor} me-2`} />
                {title}
            </h5>
            <div className="row g-3">{children}</div>
        </div>
    </div>
);

const InfoItem = ({ label, value, icon: Icon, fullWidth = false }: any) => (
    <div className={fullWidth ? "col-12" : "col-md-6"}>
        <div className="info-field">
            <label className="info-field-label">{label}</label>
            <div className="info-field-value d-flex align-items-center text-truncate">
                {Icon && <Icon size={16} className="me-2 text-secondary flex-shrink-0" />}
                {value || '--'}
            </div>
        </div>
    </div>
);

export default function BusinessData() {

    const { business: businessInfo, loading, error, refresh } = useBusiness();

    const businessDataStorage = localStorage.getItem("business_data");
    let timezone = "America/Mexico_City";
    let locale = "es-ES";
    try {
        if (businessDataStorage) {
            const parsed = JSON.parse(businessDataStorage);
            timezone = parsed.time_zone || timezone;
            locale = parsed.locale || locale;
        }
    } catch { /* ignore */ }

    const [imgError, setImgError] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [clientTypes, setClientTypes] = useState<ClientType[]>([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showClientTypeModal, setShowClientTypeModal] = useState(false);
    const [showDeleteClientTypeModal, setShowDeleteClientTypeModal] = useState(false);
    const [selectedClientType, setSelectedClientType] = useState<ClientType | null>(null);

    useEffect(() => { setImgError(false); }, [businessInfo.logo_url]);

    useEffect(() => {
        const fetchClientTypes = async () => {
            try {
                const data = await getClientTypes();
                setClientTypes(data);
            } catch (error) {
                console.error("Error fetching client types:", error);
            }
        };
        fetchClientTypes();
    }, [refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        refresh();
    };

    if (loading && !businessInfo.business_name) {
        return <Layout><div className="p-5 text-center"><div className="spinner-border text-primary"></div></div></Layout>;
    }

    return (
        <Layout>
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <header className="business-header-card mb-4 bg-white">
                <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center">
                        <div className="business-logo-container me-4">
                            {businessInfo.logo_url && !imgError ? (
                                <img src={businessInfo.logo_url} alt="Logo" className="w-100 h-100 object-fit-cover" onError={() => setImgError(true)} />
                            ) : (
                                <Briefcase size={40} />
                            )}
                        </div>
                        <div>
                            <h1 className="h2 mb-1 business-name">{businessInfo.business_name}</h1>
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 border-0 d-inline-flex align-items-center gap-1">
                                <CircleCheck size={14} /> Active Account
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-primary business-edit-btn px-4 py-2 d-flex align-items-center gap-2"
                        onClick={() => setShowEditModal(true)}>
                        <Edit3 size={18} /> Edit Configuration
                    </button>
                </div>
            </header>

            <main className="row g-4">
                <InfoCard title="Localization & Regional" icon={Globe} bgColor="primary">
                    <InfoItem label="Time Zone"
                        value={businessInfo.time_zone}
                        icon={Clock} />
                    <InfoItem label="Locale"
                        value={businessInfo.locale}
                        icon={Languages} />
                    <InfoItem label="Distance Unit"
                        value={businessInfo.distance_unit === 'm' ? 'International (m)' : 'Imperial (ft)'}
                        icon={Ruler} fullWidth />
                </InfoCard>

                <InfoCard title="Operational Thresholds" icon={Navigation} bgColor="success">
                    <div className="col-md-6">
                        <div className="info-field">
                            <label className="info-field-label">Max Valid Distance</label>
                            <div className="threshold-value h4 text-primary">
                                {businessInfo.max_valid_distance}
                                <small className="threshold-unit">{businessInfo.distance_unit}</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="info-field">
                            <label className="info-field-label">Min Time Between Visits</label>
                            <div className="threshold-value h4 text-success">
                                {businessInfo.min_time_between_visits} <small className="threshold-unit">min</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mt-2">
                        <div className="p-3 rounded-3 d-flex align-items-center sync-info">
                            <Calendar size={14} className="me-2" />
                            Last sync: {businessInfo.updated_at ? new Date(businessInfo.updated_at).toLocaleString(locale, { timeZone: timezone }) : '--'}
                        </div>
                    </div>
                </InfoCard>

                <InfoCard title="Client Types Management" icon={Tag} bgColor="info">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-bold text-uppercase">Existing Types</span>
                            <button className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 rounded-pill px-3"
                                onClick={() => {
                                    setSelectedClientType(null);
                                    setShowClientTypeModal(true);
                                }}>
                                <Plus size={14} /> Add New
                            </button>
                        </div>
                        <div className="list-group list-group-flush client-type-list">

                            {clientTypes?.map((type, idx) => (
                                <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3 client-type-item">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="client-type-badge">
                                            {type.abbreviation}
                                        </div>
                                        <div>
                                            <div className="client-type-name">{type.name}</div>
                                            <div className="client-type-code">Type Code: {type.abbreviation}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-light client-type-action-btn text-primary"
                                            onClick={() => {
                                                setSelectedClientType(type);
                                                setShowClientTypeModal(true);
                                            }}>
                                            <Edit3 size={15} />
                                        </button>
                                        <button className="btn btn-light client-type-action-btn text-danger"
                                            onClick={() => {
                                                setSelectedClientType(type);
                                                setShowDeleteClientTypeModal(true);
                                            }}>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </InfoCard>
            </main>

            {/* Modals */}
            <EditBusinessModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleRefresh}
                businessData={businessInfo}
                key={`edit-business-${showEditModal}`}
            />

            <ClientTypeModal
                isOpen={showClientTypeModal}
                onClose={() => setShowClientTypeModal(false)}
                onSuccess={handleRefresh}
                selectedClientType={selectedClientType}
                key={`client-type-${selectedClientType?.id ?? 'new'}-${showClientTypeModal}`}
            />

            <DeleteClientTypeModal
                isOpen={showDeleteClientTypeModal}
                onClose={() => setShowDeleteClientTypeModal(false)}
                onSuccess={handleRefresh}
                selectedClientType={selectedClientType}
                key={`delete-client-type-${selectedClientType?.id ?? 'none'}-${showDeleteClientTypeModal}`}
            />
        </Layout>
    );
}