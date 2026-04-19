import { useState } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { QrCode, ClipboardList, MapPin, User, CheckCircle2, AlertCircle, Store, Home, RefreshCw, Copy, Check, FileText, Calendar, Clock } from "lucide-react";
import '../styles/register-visit.css';
import CodeScannerComponent from "./CodeScanner";
import Modal from "./modal";
import PermissionGate from "./PermissionGate";
import { useGeolocation } from "../hooks/useGeolocation";
import { useScanner } from "../hooks/useScanner";
import { getClientByCode } from "../features/clients/api/clientsServices";
import { registerVisit } from "../features/visits/api/visitsService";

interface DetectedCode {
    format: string;
    rawValue: string;

}

const isDemoMode = process.env.REACT_APP_DEMO_MODE === "True";
export default function RegisterVisit() {
    const navigate = useNavigate();

    const { latitude, longitude, datetime, gettingGeolocation, gettingDatetime, resetLocation } = useGeolocation();
    const {
        isScannerPaused, setIsScannerPaused,
        isScannerLoading, setIsScannerLoading,
        isScannerUsed, setIsScannerUsed,
        startScanner, resetScanner
    } = useScanner();

    const [clientData, setClientData] = useState({
        name: "",
        code: "",
        address: "",
        client_type_name: "",
        neighborhood: "",
        municipality: "",
        state: "",
    });


    const [delivererName] = useState(localStorage.getItem("name") || "Deliverer Name");
    const [clientId, setClientId] = useState<number | null>(null);

    const [isProductive, setIsProductive] = useState(false);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isClientFound, setIsClientFound] = useState(false);
    const [scanError, setScanError] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const lookupClient = (code: string) => {
        if (!code.trim()) return;

        setIsScannerLoading(true);
        setIsScannerPaused(true);
        setIsScannerUsed(true);
        setScanError("");
        setIsClientFound(false);

        // Ensure we try to get location if not already getting it
        gettingGeolocation(
            undefined,
            (msg) => setScanError(msg ? `Location error: ${msg}` : "")
        );

        getClientByCode(code.trim())
            .then(data => {
                setClientData(data);
                setClientId(parseInt(data.id));
                setInputCode(data.code); // Sync input with normalized code
                gettingDatetime();
                setIsClientFound(true);
            })
            .catch(error => {
                setScanError(error.response?.data?.detail || "Client not found or network error.");
                setIsClientFound(false);
            })
            .finally(() => {
                setIsScannerLoading(false);
            });
    }

    const scannerPressed = () => {
        setIsClientFound(false);
        setScanError("");
        gettingGeolocation(
            undefined,
            (msg) => setScanError(msg ? `Location error: ${msg}` : "")
        );
        startScanner();
    }

    const handleScan = (detectedCodes: DetectedCode[]) => {
        const detectedCode = detectedCodes[0].rawValue;
        lookupClient(detectedCode);
    }

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        lookupClient(inputCode);
    }
    const resetForm = () => {
        setClientData({
            name: "",
            code: "",
            address: "",
            client_type_name: "",
            neighborhood: "",
            municipality: "",
            state: "",
        });
        setClientId(null);
        setIsProductive(false);
        setNotes("");
        setIsClientFound(false);
        setIsSuccess(false);
        resetLocation();
        resetScanner();
        setErrorMessage("");
        setScanError("");
        setInputCode("");
        setIsCopied(false);
    }

    const handleCopyCode = () => {
        if (!clientData.code) return;
        navigator.clipboard.writeText(clientData.code)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!isClientFound || !clientId) {
            setErrorMessage("Please scan a client code before registering.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsConfirmModalOpen(true);
    }

    const handleConfirmRegistration = () => {
        setIsConfirmModalOpen(false);

        if (isDemoMode) {
            setIsDemoModalOpen(true);
            return;
        }

        setIsSubmitting(true);
        registerVisit({
            client: clientId!,
            visited_at: datetime,
            latitude_recorded: latitude,
            longitude_recorded: longitude,
            is_productive: isProductive,
            notes: notes,
        })
            .then(() => {
                setIsSuccess(true);
                handleCopyCode();
            })
            .catch(error => {
                setErrorMessage(error.response?.data?.detail || "An error occurred while registering the visit. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    const isFormValid = isClientFound && clientId && latitude !== 0 && longitude !== 0 && delivererName && datetime;

    return (
        <PermissionGate>
            <Layout>
                <div className="register-visit-container">
                    <header className="page-header">
                        <h1><MapPin size={30} className="flex-shrink-0 me-2 text-primary mb-1" />Register Visit</h1>
                        <p>Client check-in</p>
                    </header>

                    <section className="scanner-card">
                        <div className="search-methods-container">
                            {/* Scanner Side */}
                            <div className="method-side">
                                {isScannerPaused && (
                                    <button
                                        className={`btn btn-outline-primary fw-bold scanner-box ${!isScannerLoading && isScannerUsed ? isClientFound ? "scanner-box-success" : "scanner-box-error" : ""}`}
                                        type="button"
                                        onClick={scannerPressed}
                                    >
                                        {isScannerLoading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : !isScannerUsed ? (
                                            <QrCode size={48} strokeWidth={1.5} />
                                        ) : isClientFound ? (
                                            <CheckCircle2 size={48} strokeWidth={1.5} className="text-success" />
                                        ) : (
                                            <AlertCircle size={48} strokeWidth={1.5} className="text-danger" />
                                        )}
                                        {!isScannerLoading && isScannerUsed
                                            ? isClientFound
                                                ? "Client Found"
                                                : "Client Not Found. Retry?"
                                            : isScannerLoading
                                                ? "Scanning..."
                                                : "Scan Code"}
                                    </button>
                                )}
                                {!isScannerPaused && (
                                    <CodeScannerComponent
                                        isPaused={isScannerPaused}
                                        setIsPaused={setIsScannerPaused}
                                        handleScan={handleScan}
                                    />
                                )}
                            </div>

                            {/* Separator */}
                            {isScannerPaused && (
                                <div className="search-separator">
                                    <span>OR</span>
                                </div>
                            )}

                            {/* Manual Side */}
                            {isScannerPaused && (
                                <div className="method-side">
                                    <form onSubmit={handleManualSearch} className="manual-search-group">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-2">
                                            Enter Code Manually
                                        </label>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-light border-end-0">
                                                <QrCode size={18} className="text-secondary" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control bg-light border-start-0 py-2"
                                                placeholder="e.g. CLI001"
                                                value={inputCode}
                                                onChange={(e) => setInputCode(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                            disabled={isScannerLoading || !inputCode.trim()}
                                        >
                                            {isScannerLoading ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <>
                                                    <Store size={18} />
                                                    Find Client
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {scanError && isScannerPaused && !isScannerLoading && (
                            <div
                                className="alert alert-danger mt-3 py-2 text-center d-flex align-items-center justify-content-center"
                                role="alert"
                            >
                                <AlertCircle size={18} className="me-2" />
                                <span>{scanError}</span>
                            </div>
                        )}
                    </section>

                    <form onSubmit={handleSubmit} className="form-section">
                        {errorMessage && (
                            <div className="alert alert-danger form-error-alert" role="alert">
                                <AlertCircle size={18} className="me-2 flex-shrink-0" />
                                <div>{errorMessage}</div>
                            </div>
                        )}
                        <div className="info-card">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">
                                        <User size={14} className="me-1" />
                                        Client Name
                                    </span>
                                    <input
                                        type="text"
                                        readOnly
                                        className="info-value"
                                        value={isClientFound ? clientData.name : "Not identified"}
                                    />
                                </div>

                                {isClientFound && (
                                    <>
                                        <div className="info-item">
                                            <span className="info-label">
                                                <QrCode size={14} className="me-1" />
                                                Verified Code
                                            </span>
                                            <div className="d-flex align-items-center gap-2">
                                                <input type="text" className="info-value flex-grow-1" value={clientData.code} readOnly />
                                                <button
                                                    type="button"
                                                    className="btn btn-copy-code d-flex align-items-center justify-content-center"
                                                    onClick={handleCopyCode}
                                                    title="Copy code"
                                                >
                                                    {isCopied ? (
                                                        <Check size={18} className="text-success animate-zoom-in" />
                                                    ) : (
                                                        <Copy size={18} className="text-primary" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">
                                                <Store size={14} className="me-1" />
                                                Client Type
                                            </span>
                                            <input type="text" className="info-value" value={clientData.client_type_name} readOnly />
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">
                                                <MapPin size={14} className="me-1" />
                                                Address
                                            </span>
                                            <textarea className="info-value info-value-textarea" value={
                                                [clientData.address, clientData.neighborhood, clientData.municipality, clientData.state]
                                                    .filter(part => part && part.trim() !== "")
                                                    .join(", ")
                                            } readOnly />
                                        </div>
                                    </>
                                )}
                                <div className="info-item">
                                    <span className="info-label">
                                        <MapPin size={14} className="me-1" />
                                        Deliverer
                                    </span>
                                    <div className="info-value">{delivererName}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="notes" className="form-label fw-bold d-flex align-items-center">
                                <ClipboardList size={18} className="me-2 text-primary" />
                                Visit Notes
                            </label>
                            <textarea
                                id="notes"
                                className="form-control visit-notes-textarea"
                                rows={4}
                                placeholder="Describe any relevant details about the visit..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="card border-0 bg-light p-3 mb-4 productive-switch-card">
                            <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                                <label className="form-check-label h6 mb-0 d-flex align-items-center" htmlFor="productiveSwitch">
                                    <CheckCircle2 size={18} className="me-2 text-success" />
                                    Productive Visit?
                                </label>
                                <input
                                    className="form-check-input ms-0 productive-switch-input"
                                    type="checkbox"
                                    role="switch"
                                    id="productiveSwitch"
                                    checked={isProductive}
                                    onChange={(e) => setIsProductive(e.target.checked)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isSubmitting || !isFormValid}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Registering...
                                </>
                            ) : "Complete Registration"}
                        </button>
                    </form>

                    {isConfirmModalOpen && (
                        <Modal
                            title="Confirm Visit Details"
                            message="Please review the information below before recording the visit."
                            buttonText1={<><CheckCircle2 size={20} className="me-2" />Confirm & Register</>}
                            buttonText2="Edit Details"
                            buttonAction1={handleConfirmRegistration}
                            buttonAction2={() => setIsConfirmModalOpen(false)}
                            icon={<FileText size={48} />}
                            variant="info"
                        >
                            <div className="confirm-summary text-start">
                                <div className="summary-item">
                                    <div className="summary-label">
                                        <User size={14} className="me-1" /> Client
                                    </div>
                                    <div className="summary-value">{clientData.name} <span className="text-muted small">({clientData.code})</span></div>
                                </div>
                                <div className="summary-row">
                                    <div className="summary-item">
                                        <div className="summary-label">
                                            <Calendar size={14} className="me-1" /> Date
                                        </div>
                                        <div className="summary-value">{new Date(datetime).toLocaleDateString()}</div>
                                    </div>
                                    <div className="summary-item">
                                        <div className="summary-label">
                                            <Clock size={14} className="me-1" /> Time
                                        </div>
                                        <div className="summary-value">{new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-label">
                                        <CheckCircle2 size={14} className="me-1" /> Status
                                    </div>
                                    <div className={`summary-badge ${isProductive ? 'productive' : 'non-productive'}`}>
                                        {isProductive ? 'Productive Visit' : 'Non-Productive Visit'}
                                    </div>
                                </div>
                                {notes && (
                                    <div className="summary-item">
                                        <div className="summary-label">
                                            <ClipboardList size={14} className="me-1" /> Notes
                                        </div>
                                        <div className="summary-notes">{notes}</div>
                                    </div>
                                )}
                            </div>
                        </Modal>
                    )}

                    {isSuccess && (
                        <Modal
                            title="Visit Registered!"
                            message={`The visit to ${clientData.name} has been successfully recorded.`}
                            buttonText1={<><RefreshCw size={20} className="me-2" />Register Another Visit</>}
                            buttonText2={<><Home size={20} className="me-2" />Back to Home</>}
                            buttonAction1={resetForm}
                            buttonAction2={() => navigate("/home")}
                            icon={<CheckCircle2 size={48} />}
                            isVertical={true}
                        >
                            <div className="success-copy-section mb-4">
                                <p className="small text-muted mb-2 text-uppercase fw-bold" style={{ letterSpacing: '0.05em' }}>
                                    External Code
                                </p>
                                <div className="success-copy-box justify-content-center">
                                    <code className="success-code">{clientData.code}</code>
                                </div>
                                <div className="d-flex align-items-center justify-content-center mt-2 text-success fw-bold small animate-zoom-in">
                                    <Check size={16} className="me-1" /> COPIED TO CLIPBOARD
                                </div>
                            </div>
                        </Modal>
                    )}

                    {errorMessage && (
                        <Modal
                            title="Oops! Something went wrong"
                            message={errorMessage}
                            buttonText1={<><RefreshCw size={20} className="me-2" />Try Again</>}
                            buttonText2={<><Home size={20} className="me-2" />Back to Home</>}
                            buttonAction1={() => setErrorMessage("")}
                            buttonAction2={() => navigate("/home")}
                            icon={<AlertCircle size={48} />}
                            variant="danger"
                        />
                    )}

                    {isDemoModalOpen && (
                        <Modal
                            title="Demo Mode"
                            message="This action is not allowed in Demo Mode. To protect data integrity, recording new visits is disabled in this environment."
                            buttonText1={<><Home size={20} className="me-2" />Back to Home</>}
                            buttonText2={""}
                            buttonAction1={() => navigate("/home")}
                            buttonAction2={() => { }}
                            variant="info"
                            icon={<AlertCircle size={48} />}
                        />
                    )}
                </div>
            </Layout>
        </PermissionGate>
    );
}