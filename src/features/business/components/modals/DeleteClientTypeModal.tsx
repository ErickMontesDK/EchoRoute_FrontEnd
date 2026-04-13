import Modal from "../../../../components/modal";
import { Trash2 } from "lucide-react";
import { ClientType, deleteClientType } from "../../../client_types/api/clientTypesService";
import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedClientType: ClientType | null;
}

export default function DeleteClientTypeModal({ isOpen, onClose, onSuccess, selectedClientType }: Props) {
    const [actionError, setActionError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedClientType) return;
        setIsDeleting(true);
        try {
            await deleteClientType(selectedClientType);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Critical error deleting client type:", err);
            setActionError(err.message || "An error occurred while deleting the client type.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            title="Delete Client Type"
            icon={<Trash2 size={24} />}
            message={`Are you sure you want to delete the client type "${selectedClientType?.name}"?`}
            buttonText1={isDeleting ? "Deleting..." : "Delete"}
            buttonText2="Cancel"
            buttonAction1={handleDelete}
            buttonAction2={onClose}
            showCloseButton={true}
        >
            {actionError && (
                <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
                    {actionError}
                </div>
            )}
        </Modal>
    );
}
