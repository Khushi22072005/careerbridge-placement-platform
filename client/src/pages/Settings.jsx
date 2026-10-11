
import { useState } from "react";
import axios from "axios";
import "./Settings.css";

function Settings() {
    // Password states
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);

    // Account states
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState(false);

    const [deleteText, setDeleteText] = useState("");

    // Reset password messages
    const clearPasswordMessages = () => {
        setPasswordMessage("");
        setPasswordError("");
    };

    // Cancel password form
    const handleCancelPassword = () => {
        setShowPasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        clearPasswordMessages();
    };

    // Change password
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        clearPasswordMessages();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError(
                "New password must be at least 6 characters."
            );
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "Your new password must be different from your current password."
            );
            return;
        }

        const email = localStorage.getItem("userEmail");

        if (!email) {
            setPasswordError(
                "Your login session could not be found. Please log in again."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/change-password",
                {
                    email,
                    currentPassword,
                    newPassword,
                }
            );

            setPasswordMessage(
                response.data?.message || "Password updated successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Unable to change password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Deactivate account placeholder
    const handleDeactivate = () => {
        setShowDeactivateModal(false);

        alert(
            "Account deactivation is not connected to the backend yet."
        );
    };

    // Move to permanent deletion confirmation
    const handleDeleteContinue = () => {
        setShowDeleteModal(false);
        setDeleteText("");
        setShowDeleteConfirmation(true);
    };

    // Permanent deletion placeholder
    const handlePermanentDelete = () => {
        if (deleteText !== "DELETE") {
            return;
        }

        alert(
            "Permanent account deletion is not connected to the backend yet."
        );

        setShowDeleteConfirmation(false);
        setDeleteText("");
    };

    return (
        <div className="settings-page">
            {/* Page header */}
            <header className="settings-header">
                <div className="settings-header-icon">
                    
                </div>

                <div>
                    <h1>Settings</h1>
                    <p>
                        Manage your CareerBridge account and preferences.
                    </p>
                </div>
            </header>

            {/* Security section */}
            <section className="settings-section">
                <div className="section-title">
                    <div className="section-icon security-icon">
                        
                    </div>

                    <div>
                        <h2>Security</h2>
                        <p>
                            Manage your password and account security.
                        </p>
                    </div>
                </div>

                {!showPasswordForm ? (
                    <div className="settings-item">
                        <div className="settings-item-info">
                            <h3>Change Password</h3>
                            <p>
                                Update your password to keep your account secure.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="settings-button"
                            onClick={() => {
                                setShowPasswordForm(true);
                                clearPasswordMessages();
                            }}
                        >
                            Change Password
                        </button>
                    </div>
                ) : (
                    <form
                        className="password-form"
                        onSubmit={handlePasswordUpdate}
                    >
                        <div className="form-group">
                            <label htmlFor="currentPassword">
                                Current Password
                            </label>

                            <input
                                id="currentPassword"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                id="newPassword"
                                type="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                placeholder="Enter new password"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm new password"
                                minLength={6}
                                required
                            />
                        </div>

                        {passwordError && (
                            <div
                                className="password-message error"
                                role="alert"
                            >
                                {passwordError}
                            </div>
                        )}

                        {passwordMessage && (
                            <div
                                className="password-message success"
                                role="status"
                            >
                                {passwordMessage}
                            </div>
                        )}

                        <div className="password-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancelPassword}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="settings-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Updating..."
                                    : "Update Password"}
                            </button>
                        </div>
                    </form>
                )}
            </section>

            {/* Account section */}
            <section className="settings-section">
                <div className="section-title">
                    <div className="section-icon account-icon">
                        
                    </div>

                    <div>
                        <h2>Account</h2>
                        <p>
                            Manage your CareerBridge account and data.
                        </p>
                    </div>
                </div>

                {/* Deactivate account */}
                <div className="settings-item">
                    <div className="settings-item-info">
                        <h3>Deactivate Account</h3>
                        <p>
                            Temporarily disable your account. Your data
                            will be retained.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="danger-outline"
                        onClick={() => setShowDeactivateModal(true)}
                    >
                        Deactivate
                    </button>
                </div>

                {/* Delete account */}
                <div className="settings-item">
                    <div className="settings-item-info">
                        <h3>Delete Account</h3>
                        <p>
                            Permanently delete your CareerBridge account
                            and associated data.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="danger-button"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Delete Account
                    </button>
                </div>
            </section>

            {/* Deactivate confirmation modal */}
            {showDeactivateModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowDeactivateModal(false);
                        }
                    }}
                >
                    <div
                        className="settings-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="deactivate-title"
                    >
                        <div className="modal-icon warning-icon">
                            !
                        </div>

                        <h2 id="deactivate-title">
                            Deactivate your account?
                        </h2>

                        <p>
                            Your account will be temporarily disabled.
                            Your data will be retained, and you may be
                            able to reactivate your account later.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setShowDeactivateModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={handleDeactivate}
                            >
                                Deactivate Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* First delete confirmation */}
            {showDeleteModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowDeleteModal(false);
                        }
                    }}
                >
                    <div
                        className="settings-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                    >
                        <div className="modal-icon delete-icon">
                            !
                        </div>

                        <h2 id="delete-title">
                            Delete your account?
                        </h2>

                        <p>
                            This action is intended to permanently delete
                            your CareerBridge account and associated data.
                            This cannot be undone once implemented.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={handleDeleteContinue}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Final delete confirmation */}
            {showDeleteConfirmation && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowDeleteConfirmation(false);
                            setDeleteText("");
                        }
                    }}
                >
                    <div
                        className="settings-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="permanent-delete-title"
                    >
                        <div className="modal-icon delete-icon">
                            !
                        </div>

                        <h2 id="permanent-delete-title">
                            Permanently delete account
                        </h2>

                        <p>
                            This action cannot be undone. Type{" "}
                            <strong>DELETE</strong> below to confirm.
                        </p>

                        <label
                            className="delete-label"
                            htmlFor="deleteConfirmation"
                        >
                            Confirmation
                        </label>

                        <input
                            id="deleteConfirmation"
                            className="delete-input"
                            type="text"
                            autoComplete="off"
                            value={deleteText}
                            onChange={(e) =>
                                setDeleteText(e.target.value)
                            }
                            placeholder="Type DELETE"
                        />

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                    setShowDeleteConfirmation(false);
                                    setDeleteText("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                disabled={deleteText !== "DELETE"}
                                onClick={handlePermanentDelete}
                            >
                                Permanently Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
