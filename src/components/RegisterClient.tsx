import Layout from "./Layout";
import { useGeolocation } from "../hooks/useGeolocation";
import { useEffect, useState } from "react";
import { useScanner } from "../hooks/useScanner";
import CodeScannerComponent from "./CodeScanner";
import { AlertCircle, CheckCircle2, QrCode, User, MapPin, Navigation, RefreshCw, Home, Store } from "lucide-react";
import '../styles/register-visit.css';
import axios from "axios";
import Modal from "./../components/modal";
import { useNavigate } from "react-router-dom";
import { checkClientCode, createClient } from "../features/clients/api/clientsServices";
import PermissionGate from "./PermissionGate";


interface DetectedCode {
    format: string;
    rawValue: string;
}

export default function RegisterClient() {
    const navigate = useNavigate();

    const { latitude, longitude, gettingGeolocation, gettingDatetime, resetLocation } = useGeolocation();
    const [clientCodeAvailable, setClientCodeAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { isScannerPaused, setIsScannerPaused,
        isScannerUsed, setIsScannerUsed,
        isScannerLoading, setIsScannerLoading,
        startScanner, resetScanner } = useScanner();

    const [clientData, setClientData] = useState({
        code: "",
        name: "",
        address: "",
        municipality: "",
        state: "",
        neighborhood: "",
        latitude: latitude,
        longitude: longitude,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setClientData(prev => ({
            ...prev,
            latitude: latitude,
            longitude: longitude,
        }));
    }, [latitude, longitude]);

    const resetForm = () => {
        setClientData({
            code: "",
            name: "",
            address: "",
            municipality: "",
            state: "",
            neighborhood: "",
            latitude: latitude,
            longitude: longitude,
        });
        resetScanner();
        resetLocation();
        setIsSuccess(false);
        setError(null);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!clientData.code) {
            setError("Please scan the client code before registering.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!latitude || !longitude) {
            setError("Please capture the GPS coordinates before registering.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);

        createClient(clientData)
            .then(() => {
                setError(null);
                resetScanner();
                setClientData({
                    code: "",
                    name: "",
                    address: "",
                    municipality: "",
                    state: "",
                    neighborhood: "",
                    latitude: latitude,
                    longitude: longitude,
                });
                setIsSuccess(true);
            })
            .catch(error => {
                setError(error.response?.data?.message || "An error occurred while registering the client. Please try again.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    const isFormValid = clientData.code && clientData.name && clientData.address
        && clientData.neighborhood && clientData.municipality && clientData.state
        && latitude && longitude;

    const fetchAddress = (lat: number, lon: number) => {
        if (!lat || !lon || isFetchingAddress) return;

        setIsFetchingAddress(true);
        axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                format: "json",
                lat: lat,
                lon: lon,
                zoom: 18,
                addressdetails: 1,
                _t: new Date().getTime()
            },
            headers: {
                'Accept-Language': 'en'
            }
        })
            .then(response => {
                const full_address = response.data.address;
                if (!full_address) return;

                setClientData(prev => ({
                    ...prev,
                    state: full_address.state,
                    municipality: full_address.city,
                    address: (full_address.house_number ? full_address.house_number + " " : "") + (full_address.road || ""),
                    neighborhood: full_address.neighbourhood,
                }));
            })
            .catch(error => {
                setError(error.response?.data?.message || "An error occurred while fetching the address. Please try again.");
            })
            .finally(() => {
                setIsFetchingAddress(false);
            });
    };

    const scannerPressed = () => {
        startScanner();
    }

    const handleScan = (detectedCodes: DetectedCode[]) => {
        const detectedCode = detectedCodes[0].rawValue;
        setError(null);
        setIsScannerUsed(true);
        setIsScannerLoading(true);
        setIsScannerPaused(true);

        checkClientCode(detectedCode)
            .then((data) => {
                if (data.available) {
                    setClientCodeAvailable(true);
                    gettingDatetime();
                    setClientData(prev => ({
                        ...prev,
                        code: detectedCode,
                    }));
                } else {
                    setClientCodeAvailable(false);
                    setClientData(prev => ({
                        ...prev,
                        code: "",
                    }));
                }
            })
            .catch(error => {
                setError(error.response?.data?.message || "An error occurred while fetching client data. Please try again.");
            })
            .finally(() => {
                setIsScannerLoading(false);
            });
    }

    return (
        <PermissionGate>
            <Layout>
                <div className="register-visit-container">
                    <header className="page-header">
                        <h1><Store size={30} className="flex-shrink-0 me-2 text-primary mb-1" />Register Client</h1>
                        <p>New client check-in</p>
                    </header>

                    <section className="scanner-card">
                        {isScannerPaused && (
                            <button className={`btn btn-outline-primary fw-bold scanner-box ${!isScannerLoading && isScannerUsed ? clientCodeAvailable ? "scanner-box-success" : "scanner-box-error" : ""}`} type="button" onClick={scannerPressed}>

                                {isScannerLoading ? (<span className="spinner-border spinner-border-sm me-2"></span>) : (
                                    !isScannerUsed ? (
                                        <QrCode size={48} strokeWidth={1.5} />
                                    ) : clientCodeAvailable ? (
                                        <CheckCircle2 size={48} strokeWidth={1.5} className="text-success" />
                                    ) : (
                                        <AlertCircle size={48} strokeWidth={1.5} className="text-danger" />
                                    )
                                )}
                                {!isScannerLoading && isScannerUsed ? clientCodeAvailable ? "Client Code Available" : "Client Code Not Available. Retry?" : isScannerLoading ? "Scanning..." : "Press to Scan Code"}
                            </button>
                        )}
                        {!isScannerPaused &&
                            <CodeScannerComponent isPaused={isScannerPaused} setIsPaused={setIsScannerPaused} handleScan={handleScan} />
                        }
                    </section>

                    <form className="form-section" onSubmit={onSubmit}>
                        {error && (
                            <div className="alert alert-danger form-error-alert" role="alert">
                                <AlertCircle size={18} className="me-2 flex-shrink-0" />
                                <div>{error}</div>
                            </div>
                        )}
                        <div className="info-card">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">
                                        <QrCode size={14} className="me-1" />
                                        Client Code (Scanner)
                                    </span>
                                    <input
                                        type="text"
                                        readOnly
                                        className="info-value"
                                        placeholder="Scan the client code..."
                                        value={clientData.code}
                                        required
                                    />
                                </div>
                                <div className="info-item">
                                    <span className="info-label">
                                        <Navigation size={14} className="me-1" />
                                        Coordinates
                                    </span>
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            className="info-value flex-grow-1"
                                            placeholder="Capture coordinates..."
                                            value={latitude && longitude ? `${latitude}, ${longitude}` : ""}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={`btn btn-lg btn-outline-primary ms-2 p-2 ${isFetchingAddress ? 'disabled' : ''}`}
                                            onClick={() => !isFetchingAddress && gettingGeolocation((lat, lon) => fetchAddress(lat, lon))}
                                            disabled={isFetchingAddress}
                                            title="Recalculate coordinates and address"
                                        >
                                            {isFetchingAddress ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <Navigation size={28} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">
                                        <User size={14} className="me-1" />
                                        Client Name
                                    </span>
                                    <input
                                        type="text"
                                        className="info-value"
                                        placeholder="Enter client name..."
                                        value={clientData.name}
                                        onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="info-item">
                                    <span className="info-label">
                                        <MapPin size={14} className="me-1" />
                                        Address
                                    </span>
                                    <input
                                        type="text"
                                        className="info-value"
                                        placeholder="Enter address..."
                                        value={clientData.address}
                                        onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="info-item">
                                    <span className="info-label">
                                        <MapPin size={14} className="me-1" />
                                        Neighborhood (Colonia)
                                    </span>
                                    <input
                                        type="text"
                                        className="info-value"
                                        placeholder="Enter neighborhood..."
                                        value={clientData.neighborhood}
                                        onChange={(e) => setClientData({ ...clientData, neighborhood: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="info-item">
                                    <span className="info-label">
                                        <MapPin size={14} className="me-1" />
                                        Municipality
                                    </span>
                                    <input
                                        type="text"
                                        className="info-value"
                                        placeholder="Enter municipality..."
                                        value={clientData.municipality}
                                        onChange={(e) => setClientData({ ...clientData, municipality: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="info-item">
                                    <span className="info-label">
                                        <MapPin size={14} className="me-1" />
                                        State
                                    </span>
                                    <input
                                        type="text"
                                        className="info-value"
                                        placeholder="Enter state..."
                                        value={clientData.state}
                                        onChange={(e) => setClientData({ ...clientData, state: e.target.value })}
                                        required
                                    />
                                </div>

                            </div>
                        </div>

                        <button type="submit" className="submit-btn mt-4" disabled={isSubmitting || !isFormValid}>
                            {isSubmitting ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Registering...</>
                            ) : (
                                "Register Client"
                            )}
                        </button>
                    </form>

                    {isSuccess && (
                        <Modal
                            title="Client Registered!"
                            message={`The client ${clientData.name} has been successfully registered.`}
                            buttonText1={<><RefreshCw size={20} className="me-2" />Register Another Client</>}
                            buttonText2={<><Home size={20} className="me-2" />Back to Home</>}
                            buttonAction1={resetForm}
                            buttonAction2={() => navigate("/home")}
                            icon={<CheckCircle2 size={48} />}
                            isVertical={true}
                        />
                    )}

                </div>
            </Layout>
        </PermissionGate>
    );
}