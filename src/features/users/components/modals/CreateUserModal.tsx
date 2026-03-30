import { useState } from "react";
import Modal from "../../../../components/modal";
import Select from "../../../../components/common/inputs/Select";
import { useCreateUser } from "../../hooks/useUsers";
import { userRoles } from "../UsersData";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        formData: createData,
        setFormData: setCreateData,
        handleChange: handleCreateChange,
        createUser
    } = useCreateUser(
        () => {
            onSuccess();
            handleClose();
        },
        (msg) => setErrorMessage(msg)
    );

    const passwordMatch = (
        createData.new_password_confirmation !== "" && createData.new_password === createData.new_password_confirmation
    );
    const isCreateFormValid = !!(
        (createData.new_role && createData.new_email && createData.new_first_name && createData.new_last_name && createData.new_password && createData.new_password_confirmation && createData.new_username) &&
        passwordMatch
    );

    const handleClose = () => {
        setCreateData({ new_role: "", new_email: "", new_first_name: "", new_last_name: "", new_username: "", new_password: "", new_password_confirmation: "" });
        setErrorMessage(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            title="Create User"
            message={`Creating a new user account`}
            buttonText1="Create User"
            buttonText2="Cancel"
            isForm={true}
            isSubmitDisabled={!isCreateFormValid}
            buttonAction1={() => {
                if (!createData.new_first_name || !createData.new_last_name || !createData.new_email || !createData.new_role || !createData.new_password || !createData.new_password_confirmation || !createData.new_username) {
                    setErrorMessage("Please fill in all required fields.");
                    return;
                }
                createUser();
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
                        value={createData.new_first_name}
                        onChange={(e) => handleCreateChange("new_first_name", e.target.value)}
                        placeholder="e.g. John"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={createData.new_last_name}
                        onChange={(e) => handleCreateChange("new_last_name", e.target.value)}
                        placeholder="e.g. Doe"
                        required
                    />
                </div>
                <div className="col-12">
                    <label className="form-label font-bold">Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        value={createData.new_email}
                        onChange={(e) => handleCreateChange("new_email", e.target.value)}
                        placeholder="john.doe@example.com"
                        required
                    />
                </div>

                <div className="col-12 mt-4">
                    <h6 className="border-bottom pb-2 text-secondary">Account Details</h6>
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={createData.new_username}
                        onChange={(e) => handleCreateChange("new_username", e.target.value)}
                        placeholder="johndoe"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <Select
                        label="Role"
                        name="role"
                        value={createData.new_role}
                        onChange={(e) => handleCreateChange("new_role", e.target.value)}
                        options={userRoles}
                        placeholder="Select role"
                    />
                </div>

                <div className="col-12 mt-4">
                    <h6 className="border-bottom pb-2 text-secondary">Security</h6>
                </div>
                {!passwordMatch && createData.new_password_confirmation !== "" && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                        Passwords do not match
                    </div>
                )}
                <div className="col-md-6">
                    <label className="form-label font-bold">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={createData.new_password}
                        onChange={(e) => handleCreateChange("new_password", e.target.value)}
                        placeholder="Password"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label font-bold">Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={createData.new_password_confirmation}
                        onChange={(e) => handleCreateChange("new_password_confirmation", e.target.value)}
                        placeholder="Password confirmation"
                        required
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
