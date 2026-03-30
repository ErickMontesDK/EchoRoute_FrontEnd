import { useState } from "react";
import Modal from "../../../../components/modal";
import { useUpdateVisitNotes, Visit } from "../../hooks/useVisits";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    visit: Visit | null;
}

export default function EditVisitModal({ isOpen, onClose, onSuccess, visit }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        formData: updateData,
        handleChange: handleUpdateChange,
        updateVisit
    } = useUpdateVisitNotes(
        visit,
        () => { },
        () => {
            onSuccess();
            handleClose();
        },
        (msg) => setErrorMessage(msg)
    );

    const handleClose = () => {
        setErrorMessage(null);
        onClose();
    };

    if (!isOpen || !visit) return null;

    return (
        <Modal
            title="Edit Visit"
            message={`Editing visit for client: ${visit.client__name || '...'}`}
            buttonText1="Save Changes"
            buttonText2="Cancel"
            isForm={true}
            buttonAction1={() => {
                updateVisit();
            }}
            buttonAction2={handleClose}
            showCloseButton={true}
        >
            <div className="mb-3">
                <label htmlFor="notes" className="form-label font-bold">Notes</label>
                <textarea
                    className="form-control"
                    id="notes"
                    rows={3}
                    value={updateData.notes}
                    onChange={(e) => handleUpdateChange("notes", e.target.value)}
                />
            </div>
            <div className="row g-3 mb-3">
                <div className="col-6">
                    <div className="form-check form-switch p-3 border rounded">
                        <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            role="switch"
                            id="productive"
                            checked={updateData.is_productive}
                            onChange={(e) => handleUpdateChange("is_productive", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="productive">Productive</label>
                    </div>
                </div>
                <div className="col-6">
                    <div className="form-check form-switch p-3 border rounded">
                        <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            role="switch"
                            id="validated"
                            checked={updateData.is_valid}
                            onChange={(e) => handleUpdateChange("is_valid", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="validated">Validated</label>
                    </div>
                </div>
            </div>
            {errorMessage && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                    {errorMessage}
                </div>
            )}
        </Modal>
    );
}
