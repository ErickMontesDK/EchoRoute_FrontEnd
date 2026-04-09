import { useState } from "react";
import Modal from "../../../../components/modal";
import Select, { Option } from "../../../../components/common/inputs/Select";
import { useUpdateClients, Client } from "../../hooks/useClients";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    client: Client | null;
    client_types: Option[];
}

export default function EditClientModal({ isOpen, onClose, onSuccess, client, client_types }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        formData: updateData,
        handleChange: handleUpdateChange,
        updateClient
    } = useUpdateClients(
        client,
        () => { },
        () => {
            onSuccess();
            handleClose();
        },
        (msg) => setErrorMessage(msg)
    );

    const isFormValid = !!(updateData.code && updateData.name && updateData.address && updateData.latitude && updateData.longitude);

    const handleClose = () => {
        setErrorMessage(null);
        onClose();
    };

    if (!isOpen || !client) return null;



    return (
        <Modal
            title="Edit Client"
            message={`Editing client ${client.name} (${client.code})`}
            buttonText1="Save Changes"
            buttonText2="Cancel"
            isForm={true}
            isSubmitDisabled={!isFormValid}
            buttonAction1={() => {
                updateClient();
            }}
            buttonAction2={handleClose}
            showCloseButton={true}
        >
            <div className="row g-4">
                <div className="col-12">
                    <h6 className="border-bottom pb-2 text-secondary">General Information</h6>
                </div>
                <div className="col-md-4">
                    <label className="form-label font-bold">Code</label>
                    <input type="text" className="form-control" value={updateData.code} onChange={(e) => handleUpdateChange('code', e.target.value)} maxLength={20} />
                </div>
                <div className="col-md-8">
                    <label className="form-label font-bold">Name</label>
                    <input type="text" className="form-control" value={updateData.name} onChange={(e) => handleUpdateChange('name', e.target.value)} maxLength={150} />
                </div>
                <div className="col-md-6">
                    <Select
                        label="Client Type"
                        name="client_type"
                        value={updateData.client_type_id as string}
                        onChange={(e) => handleUpdateChange('client_type_id', e.target.value)}
                        options={client_types}
                        placeholder="Select type"
                    />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                    <div className="form-check form-switch p-3 border rounded w-100 bg-light">
                        <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            role="switch"
                            id="is_active"
                            checked={updateData.is_active}
                            onChange={(e) => handleUpdateChange('is_active', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="is_active">Is Active</label>
                    </div>
                </div>

                {/* Section: Location */}
                <div className="col-12 mt-4">
                    <h6 className="border-bottom pb-2 text-secondary mt-4">Location</h6>
                </div>
                <div className="col-md-12">
                    <label className="form-label font-bold">Address</label>
                    <input type="text" className="form-control" value={updateData.address} onChange={(e) => handleUpdateChange('address', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">Neighborhood</label>
                    <input type="text" className="form-control" value={updateData.neighborhood} onChange={(e) => handleUpdateChange('neighborhood', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">Municipality</label>
                    <input type="text" className="form-control" value={updateData.municipality} onChange={(e) => handleUpdateChange('municipality', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">State</label>
                    <input type="text" className="form-control" value={updateData.state} onChange={(e) => handleUpdateChange('state', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">Sector</label>
                    <input type="text" className="form-control" value={updateData.sector} onChange={(e) => handleUpdateChange('sector', e.target.value)} />
                </div>

                {/* Section: Market & Coordinates */}
                <div className="col-12 mt-4">
                    <h6 className="border-bottom pb-2 text-secondary mt-4">Market & Coordinates</h6>
                </div>
                <div className="col-md-4">
                    <label className="form-label font-bold">Market</label>
                    <input type="text" className="form-control" value={updateData.market} onChange={(e) => handleUpdateChange('market', e.target.value)} />
                </div>
                <div className="col-md-4">
                    <label className="form-label font-bold">Latitude</label>
                    <input type="number" className="form-control" value={updateData.latitude} onChange={(e) => handleUpdateChange('latitude', Number(e.target.value))} />
                </div>
                <div className="col-md-4">
                    <label className="form-label font-bold">Longitude</label>
                    <input type="number" className="form-control" value={updateData.longitude} onChange={(e) => handleUpdateChange('longitude', Number(e.target.value))} />
                </div>
            </div>
            {errorMessage && (
                <div className="alert alert-danger py-2 mb-3" role="alert" id="error-message">
                    {errorMessage}
                </div>
            )}
        </Modal>
    );
}
