import { useState, useEffect } from "react";
import Modal from "../../../../components/modal";
import { Link } from "lucide-react";
import { useUpdateBusiness, Business } from "../../hooks/useBusiness";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    businessData: Business;
}

export default function EditBusinessModal({ isOpen, onClose, onSuccess, businessData }: Props) {
    const [urlError, setUrlError] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        business: formData,
        setBusiness: setFormData,
        updateBusiness,
        isUpdating
    } = useUpdateBusiness(() => {
        onSuccess();
        handleClose();
    }, (msg) => setErrorMessage(msg));

    useEffect(() => {
        if (isOpen) {
            setFormData({ ...businessData });
            setUrlError("");
            setErrorMessage(null);
        }
    }, [isOpen, businessData, setFormData]);

    const handleClose = () => {
        setErrorMessage(null);
        onClose();
    };

    const handleUrlChange = (url: string) => {
        setFormData({ ...formData, logo_url: url });

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

    if (!isOpen) return null;

    return (
        <Modal
            title="Edit Business Configuration"
            message="Adjust system-wide settings for distance, time, and localization."
            buttonText1={isUpdating ? "Saving..." : "Save Configuration"}
            buttonText2="Cancel"
            isForm={true}
            isSubmitDisabled={!isFormValid || isUpdating}
            buttonAction1={updateBusiness}
            buttonAction2={handleClose}
            showCloseButton={true}
        >
            <div className="row g-3 text-start mb-3">
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
            {errorMessage && (
                <div className="alert alert-danger py-2 mb-0 mt-3" role="alert">
                    {errorMessage}
                </div>
            )}
        </Modal>
    );
}
