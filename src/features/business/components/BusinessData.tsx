import Layout from "../../../components/Layout";
import { useState, useEffect } from "react";
import { Briefcase, Globe, Languages, Ruler, Navigation, Clock, Calendar, Edit3, CircleCheck, Link, Tag, Plus, Trash2 } from "lucide-react";
import Modal from "../../../components/modal";
import { useBusiness, useUpdateBusiness } from "../hooks/useBusiness";
import { ClientType, createClientType, deleteClientType, getClientTypes, updateClientType } from "../../client_types/api/clientTypesService";
import "../../../styles/business-data.css";


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

    const [showEditModal, setShowEditModal] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [imgError, setImgError] = useState(false);

    const {
        business: formData,
        setBusiness: setFormData,
        updateBusiness,
        isUpdating
    } = useUpdateBusiness(() => {
        setShowEditModal(false);
        refresh();
    }, (msg) => alert(msg));

    useEffect(() => { setImgError(false); }, [businessInfo.logo_url]);

    const [refreshKey, setRefreshKey] = useState(0);
    const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
    const [showClientTypeModal, setShowClientTypeModal] = useState(false);
    const [showDeleteClientTypeModal, setShowDeleteClientTypeModal] = useState(false);
    const [selectedClientType, setSelectedClientType] = useState<ClientType | null>(null);
    const [clientTypeForm, setClientTypeForm] = useState<Partial<ClientType>>({ name: "", abbreviation: "" });
    const [clientTypeActionError, setClientTypeActionError] = useState("");

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

    const handleUrlChange = (url: string) => {
        setFormData({ ...formData, logo_url: url });
        setImgError(false);

        if (!url) {
            setUrlError("");
            return;
        }

        try {
            new URL(url);
            setUrlError("Validating image URL...");

            const img = new Image();
            img.onload = () => {
                if (img.width > 1 && img.height > 1) {
                    setUrlError("");
                } else {
                    setUrlError("The URL points to an invalid image format or tracking pixel.");
                }
            };
            img.onerror = () => setUrlError("The URL does not point to a valid or accessible image.");
            img.src = url;
        } catch {
            setUrlError("Please enter a valid URL");
        }
    };

    const isFormValid = !!(
        formData.business_name && formData.time_zone && formData.locale &&
        formData.distance_unit && formData.max_valid_distance >= 0 &&
        formData.min_time_between_visits >= 0 && !urlError
    );

    const openEditBusinessModal = () => {
        setFormData({ ...businessInfo });
        setUrlError("");
        setShowEditModal(true);
    };

    const openClientTypeModal = (type: ClientType | null = null) => {
        setSelectedClientType(type);
        setClientTypeForm(type ? { ...type } : { name: "", abbreviation: "" });
        setClientTypeActionError("");
        setShowClientTypeModal(true);
    };

    const openDeleteClientTypeModal = (type: ClientType) => {
        setSelectedClientType(type);
        setClientTypeActionError("");
        setShowDeleteClientTypeModal(true);
    };

    const handleClientTypeSubmit = async () => {
        try {
            if (selectedClientType) {
                await updateClientType({ ...selectedClientType, ...clientTypeForm });
            } else {
                await createClientType(clientTypeForm as ClientType);
            }
            setClientTypeActionError("");
            setRefreshKey(prev => prev + 1);
            setShowClientTypeModal(false);
            setSelectedClientType(null);
            setClientTypeForm({ name: "", abbreviation: "" });
        } catch (err: any) {
            console.error("Critical error in client type operation:", err);
            setClientTypeActionError(err.message || "An error occurred while saving the client type.");
        }
    };

    const handleDeleteClientType = async () => {
        try {
            await deleteClientType(selectedClientType!);
            setClientTypeActionError("");
            setRefreshKey(prev => prev + 1);
            setShowDeleteClientTypeModal(false);
            setSelectedClientType(null);
        } catch (err: any) {
            console.error("Critical error deleting client type:", err);
            setClientTypeActionError(err.message || "An error occurred while deleting the client type.");
        }
    };

    if (loading && !businessInfo.business_name) {
        return <Layout><div className="p-5 text-center"><div className="spinner-border text-primary"></div></div></Layout>;
    }

    return (
        <Layout>
            {error && <div className="alert alert-danger mb-4">{error}</div>}
            {clientTypeActionError && (
                <div className="alert alert-danger mb-4 alert-dismissible fade show d-flex justify-content-between align-items-center" role="alert">
                    <div>{clientTypeActionError}</div>
                    <button type="button" className="btn-close m-0 position-static" onClick={() => setClientTypeActionError("")} aria-label="Close"></button>
                </div>
            )}

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
                        onClick={openEditBusinessModal}>
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
                                onClick={() => openClientTypeModal(null)}>
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
                                            onClick={() => openClientTypeModal(type)}>
                                            <Edit3 size={15} />
                                        </button>
                                        <button className="btn btn-light client-type-action-btn text-danger"
                                            onClick={() => openDeleteClientTypeModal(type)}>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </InfoCard>
            </main>


            {showEditModal && (
                <Modal
                    title="Edit Business Configuration"
                    message="Adjust system-wide settings for distance, time, and localization."
                    buttonText1={isUpdating ? "Saving..." : "Save Configuration"}
                    buttonText2="Cancel"
                    isForm={true}
                    isSubmitDisabled={!isFormValid || isUpdating}
                    buttonAction1={updateBusiness}
                    buttonAction2={() => setShowEditModal(false)}
                    showCloseButton={true}
                >
                    <div className="row g-3 text-start">
                        <div className="col-12">
                            <label className="form-label fw-bold">Business Name</label>
                            <input type="text" className="form-control" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} required />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold d-flex align-items-center gap-2"><Link size={16} /> Logo URL</label>
                            <input type="url" className={`form-control ${urlError ? 'is-invalid' : ''}`} value={formData.logo_url} onChange={(e) => handleUrlChange(e.target.value)} />
                            <div className={urlError ? "invalid-feedback" : "form-text small"}>{urlError || "Provide a link to your business logo image."}</div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Time Zone</label>
                            <select className="form-select" value={formData.time_zone} onChange={(e) => setFormData({ ...formData, time_zone: e.target.value })} required>
                                <option value="America/Vancouver">Vancouver (PT)</option>
                                <option value="America/Mexico_City">Mexico City (CST)</option>
                                <option value="America/New_York">New York (ET)</option>
                                <option value="Europe/London">London (GMT)</option>
                                <option value="Europe/Madrid">Madrid / Paris (CET)</option>
                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                <option value="Asia/Shanghai">Shanghai (CST)</option>
                                <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                                <option value="Asia/Kolkata">India (IST)</option>
                                <option value="Australia/Sydney">Sydney (AET)</option>
                                <option value="UTC">UTC (Universal Time)</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Locale</label>
                            <select className="form-select" value={formData.locale} onChange={(e) => setFormData({ ...formData, locale: e.target.value })} required>
                                <option value="es-419">Spanish (Latin America)</option>
                                <option value="en-ca">English (Canada)</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Distance <br />Unit</label>
                            <select className="form-select" value={formData.distance_unit} onChange={(e) => setFormData({ ...formData, distance_unit: e.target.value })} required>
                                <option value="m">Metric (m)</option>
                                <option value="ft">Imperial (ft)</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Max Distance <br /> ({formData.distance_unit})</label>
                            <input type="number" className="form-control" value={formData.max_valid_distance} onChange={(e) => setFormData({ ...formData, max_valid_distance: Number(e.target.value) })} min="0" max="1000" step="1" required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Min Time <br /> (min)</label>
                            <input type="number" className="form-control" value={formData.min_time_between_visits} onChange={(e) => setFormData({ ...formData, min_time_between_visits: Number(e.target.value) })} min="0" max="60" step="1" required />
                        </div>
                    </div>
                </Modal>
            )}

            {showClientTypeModal && (
                <Modal
                    title={selectedClientType ? "Edit Client Type" : "Add Client Type"}
                    message={selectedClientType ? `Updating details for ${selectedClientType.name}` : "Create a new category for your clients."}
                    buttonText1={selectedClientType ? "Update Type" : "Create Type"}
                    buttonText2="Cancel"
                    isForm={true}
                    buttonAction1={handleClientTypeSubmit}
                    buttonAction2={() => setShowClientTypeModal(false)}
                    showCloseButton={true}
                >
                    <div className="row g-3 text-start">
                        <div className="col-12">
                            <label className="form-label fw-bold">Client Type Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Premium Partner"
                                value={clientTypeForm.name || ""}
                                onChange={(e) => setClientTypeForm({ ...clientTypeForm, name: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold">Abbreviation / Code</label>
                            <input
                                type="text"
                                className="form-control abbreviation-input"
                                placeholder="e.g. PP"
                                maxLength={5}
                                value={clientTypeForm.abbreviation || ""}
                                onChange={(e) => setClientTypeForm({ ...clientTypeForm, abbreviation: e.target.value.toUpperCase() })}
                            />
                            <div className="form-text small">Short identifier used in tables and tags.</div>
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteClientTypeModal && (
                <Modal
                    title="Delete Client Type"
                    icon={<Trash2 size={24} />}
                    message={`Are you sure you want to delete the client type "${selectedClientType?.name}"?`}
                    buttonText1="Delete"
                    buttonText2="Cancel"
                    buttonAction1={handleDeleteClientType}
                    buttonAction2={() => setShowDeleteClientTypeModal(false)}
                    showCloseButton={true}
                />
            )}
        </Layout>
    );
}