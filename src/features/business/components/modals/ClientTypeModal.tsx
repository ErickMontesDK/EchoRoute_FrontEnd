import { useState, useEffect } from "react";
import Modal from "../../../../components/modal";
import { ClientType, createClientType, updateClientType } from "../../../client_types/api/clientTypesService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedClientType: ClientType | null;
}

export default function ClientTypeModal({ isOpen, onClose, onSuccess, selectedClientType }: Props) {
    const [clientTypeForm, setClientTypeForm] = useState<Partial<ClientType>>({ name: "", abbreviation: "" });
    const [actionError, setActionError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setClientTypeForm(selectedClientType ? { ...selectedClientType } : { name: "", abbreviation: "" });
            setActionError("");
        }
    }, [isOpen, selectedClientType]);

    const handleSubmit = async () => {
        if (!clientTypeForm.name || !clientTypeForm.abbreviation) {
            setActionError("Please fill in all required fields.");
            return;
        }

        setIsSaving(true);
        try {
            if (selectedClientType) {
                await updateClientType({ ...selectedClientType, ...clientTypeForm } as ClientType);
            } else {
                await createClientType(clientTypeForm as ClientType);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error in client type operation:", err);
            setActionError(err.message || "An error occurred while saving the client type.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            title={selectedClientType ? "Edit Client Type" : "Add Client Type"}
            message={selectedClientType ? `Updating details for ${selectedClientType.name}` : "Create a new category for your clients."}
            buttonText1={isSaving ? "Saving..." : (selectedClientType ? "Update Type" : "Create Type")}
            buttonText2="Cancel"
            isForm={true}
            buttonAction1={handleSubmit}
            buttonAction2={onClose}
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
                        required
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
                        required
                    />
                    <div className="form-text small">Short identifier used in tables and tags.</div>
                </div>
            </div>
            {actionError && (
                <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
                    {actionError}
                </div>
            )}
        </Modal>
    );
}
