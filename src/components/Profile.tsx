import Layout from "./Layout";
import { useChangeOwnPassword, useUserProfile } from "../features/users/hooks/useUsers";
import { User, Mail, Shield, Fingerprint, Lock, CircleUser } from "lucide-react";
import { useState } from "react";
import Modal from "./modal";
import '../styles/profile.css';

export default function Profile() {
    const { user, error } = useUserProfile();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({
        error: false,
        message: ""
    });

    const {
        formData: passwordData,
        setFormData: setPasswordData,
        handleChange: handlePasswordChange,
        changeOwnPassword
    } = useChangeOwnPassword(
        () => {
            setPasswordMessage({
                error: false,
                message: "Password updated successfully!"
            });
            setShowPasswordModal(false);
        },
        (msg) => {
            setPasswordMessage({
                error: true,
                message: msg
            });
        }
    );

    const passwordMatch = passwordData.new_password === passwordData.new_password_confirmation;
    const isFormValid = passwordData.new_password.length >= 6;

    if (error) {
        return (
            <Layout>
                <div className="container-fluid animate-fade-in py-4">
                    <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center p-4 rounded-4" role="alert">
                        <Shield className="me-3 text-danger" size={24} />
                        <div>
                            <h6 className="mb-1 fw-bold">Connection Error</h6>
                            <p className="mb-0 opacity-75">{error}</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="d-flex flex-column justify-content-center align-items-center py-5 profile-loading">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted animate-pulse">Retrieving profile information...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="profile-container animate-fade-in">
                {/* Profile Header */}
                <header className="profile-header-card card">
                    <div className="card-body p-4 d-flex align-items-center">
                        <div className="profile-avatar me-4">
                            <CircleUser size={40} />
                        </div>
                        <div>
                            <h1 className="h2 profile-name">{user.full_name}</h1>
                            <div className="d-flex align-items-center gap-2">
                                <span className="profile-role-badge">{user.role}</span>
                                <span className="profile-username">@{user.username}</span>
                            </div>

                        </div>
                    </div>
                </header>

                <main className="row g-4">
                    {/* Personal Details */}
                    <div className="col-lg-8">
                        <section className="profile-detail-card">
                            <h5 className="d-flex align-items-center">
                                <User size={20} className="text-primary me-2" />
                                Personal Details
                            </h5>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="profile-field">
                                        <label className="profile-field-label d-block">First Name</label>
                                        <div className="profile-field-value">{user.first_name}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="profile-field">
                                        <label className="profile-field-label d-block">Last Name</label>
                                        <div className="profile-field-value">{user.last_name}</div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="profile-field d-flex align-items-center">
                                        <Mail size={18} className="text-primary me-3" />
                                        <div>
                                            <label className="profile-field-label d-block">Email</label>
                                            <div className={`profile-field-value ${!user.email ? 'empty' : ''}`}>
                                                {user.email || "No email registered"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Account Security */}
                    <div className="col-lg-4">
                        <section className="profile-detail-card">
                            <h5 className="d-flex align-items-center">
                                <Shield size={20} className="text-success me-2" />
                                Account Security
                            </h5>

                            <div className="security-field mb-3">
                                <label className="profile-field-label d-block">Status</label>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="fw-bold text-dark">{user.role}</span>
                                    <span className="badge bg-success bg-opacity-10 text-success border-0 px-2 rounded-1 small">Active</span>
                                </div>
                            </div>

                            <div className="security-field mb-4">
                                <label className="profile-field-label d-block">System ID</label>
                                <div className="d-flex align-items-center">
                                    <Fingerprint size={16} className="text-muted me-2" />
                                    <span className="system-id">#000{user.id}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    className="btn btn-primary change-password-btn d-flex align-items-center justify-content-center"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    <Lock size={16} className="me-2" />
                                    Change Password
                                </button>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {showPasswordModal && (
                <Modal
                    title="Change Password"
                    message={`Please enter your current password and your new password below.`}
                    key={showPasswordModal.toString()}
                    buttonText1="Update Password"
                    buttonText2="Cancel"
                    isForm={true}
                    isSubmitDisabled={!isFormValid || !passwordMatch || passwordData.new_password_confirmation === "" || !passwordData.old_password}
                    buttonAction1={() => {
                        changeOwnPassword();
                    }}
                    buttonAction2={() => {
                        setShowPasswordModal(false);
                        setPasswordData({
                            old_password: "",
                            new_password: "",
                            new_password_confirmation: ""
                        });
                        setPasswordMessage({ error: false, message: "" });
                    }}
                >
                    <div className="row g-3 text-start">
                        {passwordMessage.error && (
                            <div className="col-12">
                                <div className="alert alert-danger py-2 mb-0" role="alert">
                                    {passwordMessage.message}
                                </div>
                            </div>
                        )}
                        {!passwordMatch && passwordData.new_password_confirmation !== "" && (
                            <div className="col-12">
                                <div className="alert alert-danger py-2 mb-0" role="alert">
                                    Passwords do not match
                                </div>
                            </div>
                        )}
                        <div className="col-12">
                            <label className="form-label font-bold text-dark">Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwordData.old_password}
                                onChange={(e) => handlePasswordChange("old_password", e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold text-dark">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwordData.new_password}
                                onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                                placeholder="New Password"
                                required
                            />
                            <div className="form-text small">
                                Minimum 6 characters required.
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold text-dark">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwordData.new_password_confirmation}
                                onChange={(e) => handlePasswordChange("new_password_confirmation", e.target.value)}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>
                    </div>
                </Modal>
            )}

        </Layout>
    );
}