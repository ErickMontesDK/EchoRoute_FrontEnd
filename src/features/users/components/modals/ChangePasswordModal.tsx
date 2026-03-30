import { useState } from "react";
import Modal from "../../../../components/modal";
import { Key, RefreshCw, Copy, Check } from "lucide-react";
import { useChangeUserPassword, User } from "../../hooks/useUsers";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function ChangePasswordModal({ isOpen, onClose, onSuccess, user }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const {
        formData: passwordData,
        setFormData: setPasswordData,
        handleChange: handlePasswordChange,
        changeUserPassword
    } = useChangeUserPassword(
        () => {
            onSuccess();
            handleClose();
        },
        (msg) => setErrorMessage(msg)
    );

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const passwordLength = 12;
        let password = "";
        for (let i = 0; i < passwordLength; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPasswordData({
            new_password: password,
            new_password_confirmation: password
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(passwordData.new_password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setPasswordData({
            new_password: "",
            new_password_confirmation: ""
        });
        setCopied(false);
        setErrorMessage(null);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <Modal
            title="Change User Password"
            icon={<Key size={24} />}
            message={`Set a new password for ${user.full_name}`}
            buttonText1="Save Password"
            buttonText2="Cancel"
            isForm={true}
            isSubmitDisabled={!passwordData.new_password || passwordData.new_password !== passwordData.new_password_confirmation}
            buttonAction1={() => {
                changeUserPassword(user.id);
            }}
            buttonAction2={handleClose}
            showCloseButton={true}
        >
            <div className="row g-3">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label font-bold mb-0">New Password</label>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            onClick={generatePassword}
                        >
                            <RefreshCw size={14} /> Generate
                        </button>
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={passwordData.new_password}
                            onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                            placeholder="Enter or generate password"
                        />
                        {passwordData.new_password && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={copyToClipboard}
                                title="Copy to clipboard"
                            >
                                {copied ? <Check size={16} color="green" /> : <Copy size={16} />}
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-12">
                    <label className="form-label font-bold">Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => handlePasswordChange("new_password_confirmation", e.target.value)}
                        placeholder="Confirm new password"
                    />
                    {passwordData.new_password !== passwordData.new_password_confirmation && passwordData.new_password_confirmation !== "" && (
                        <div className="text-danger small mt-1">Passwords do not match</div>
                    )}
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
