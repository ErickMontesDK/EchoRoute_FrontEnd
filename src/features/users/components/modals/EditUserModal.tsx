import { useState } from "react";
import Modal from "../../../../components/modal";
import Select from "../../../../components/common/inputs/Select";
import { useUpdateUser, User } from "../../hooks/useUsers";
import { userRoles } from "../UsersData";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        formData: updateData,
        // setFormData: setUpdateData,
        handleChange: handleUpdateChange,
        updateUser
    } = useUpdateUser(
        user,
        () => { },
        () => {
            onSuccess();
            handleClose();
        },
        (msg) => setErrorMessage(msg)
    );


    const isEditFormValid = !!(updateData.role && updateData.email && updateData.first_name && updateData.last_name && updateData.username);

    const handleClose = () => {
        setErrorMessage(null);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <Modal
            title="Edit User"
            message={`Editing user: ${user.full_name || '...'}`}
            buttonText1="Save Changes"
            buttonText2="Cancel"
            isForm={true}
            isSubmitDisabled={!isEditFormValid}
            buttonAction1={() => {
                updateUser();
            }}
            buttonAction2={handleClose}
            showCloseButton={true}
        >
            <div className="row g-3">
                <div className="col-12">
                    <h6 className="border-bottom pb-2 text-secondary">Personal Information</h6>
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">First Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={updateData.first_name}
                        onChange={(e) => handleUpdateChange('first_name', e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={updateData.last_name}
                        onChange={(e) => handleUpdateChange('last_name', e.target.value)}
                    />
                </div>
                <div className="col-8">
                    <label className="form-label font-bold">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={updateData.email}
                        onChange={(e) => handleUpdateChange('email', e.target.value)}
                    />
                </div>
                <div className="col-4">
                    <label className="form-label font-bold">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={updateData.username}
                        onChange={(e) => handleUpdateChange('username', e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <Select
                        label="Role"
                        name="role"
                        value={updateData.role}
                        onChange={(e) => handleUpdateChange('role', e.target.value)}
                        options={userRoles}
                        placeholder="Select role"
                    />
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
