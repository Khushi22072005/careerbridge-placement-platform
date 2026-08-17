import { useState } from "react";
import axios from "axios";
import "./Settings.css";

function Settings() {
  // =====================================================
  // PASSWORD STATES
  // =====================================================

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  // =====================================================
  // DEACTIVATE
  // =====================================================

  const [showDeactivateModal, setShowDeactivateModal] =
    useState(false);

  // =====================================================
  // DELETE
  // =====================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  const [deleteText, setDeleteText] = useState("");

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    const email = localStorage.getItem("userEmail");

    if (!email) {
      setPasswordError(
        "Your login session could not be found."
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
        response.data.message
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
        "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DEACTIVATE
  // =====================================================

  const handleDeactivate = () => {
    setShowDeactivateModal(false);

    alert(
      "Account deactivation will be connected to the backend next."
    );
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteContinue = () => {
    setShowDeleteModal(false);
    setShowDeleteConfirmation(true);
  };

  const handlePermanentDelete = () => {
    if (deleteText !== "DELETE") {
      return;
    }

    alert(
      "Permanent account deletion will be connected to the backend next."
    );

    setShowDeleteConfirmation(false);
    setDeleteText("");
  };

  return (
    <div className="settings-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="settings-header">

        <h1>Settings</h1>

        <p>
          Manage your CareerBridge account and preferences
        </p>

      </div>


      {/* =====================================================
          SECURITY
      ===================================================== */}

      <section className="settings-section">

        <div className="section-title">

          <div>
            <h2>Security</h2>

            <p>
              Manage your password and account security
            </p>
          </div>

        </div>


        {!showPasswordForm ? (

          <div className="settings-item">

            <div>

              <h3>
                Change Password
              </h3>

              <p>
                Update your account password
              </p>

            </div>

            <button
              className="settings-button"
              onClick={() => {

                setShowPasswordForm(true);

                setPasswordMessage("");

                setPasswordError("");

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

              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Enter current password"
                required
              />

            </div>


            <div className="form-group">

              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                required
              />

            </div>


            {passwordError && (

              <div className="password-message error">

                {passwordError}

              </div>

            )}


            {passwordMessage && (

              <div className="password-message success">

                {passwordMessage}

              </div>

            )}


            <div className="password-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => {

                  setShowPasswordForm(false);

                  setCurrentPassword("");

                  setNewPassword("");

                  setConfirmPassword("");

                  setPasswordError("");

                  setPasswordMessage("");

                }}
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


      {/* =====================================================
          ACCOUNT
      ===================================================== */}

      <section className="settings-section">

        <div className="section-title">

          <div>

            <h2>
              Account
            </h2>

            <p>
              Manage your CareerBridge account
            </p>

          </div>

        </div>


        {/* DEACTIVATE */}

        <div className="settings-item">

          <div>

            <h3>
              Deactivate Account
            </h3>

            <p>
              Temporarily disable your account.
              Your data will be retained.
            </p>

          </div>


          <button
            className="danger-outline"
            onClick={() =>
              setShowDeactivateModal(true)
            }
          >
            Deactivate
          </button>

        </div>


        {/* DELETE */}

        <div className="settings-item">

          <div>

            <h3>
              Delete Account
            </h3>

            <p>
              Permanently delete your CareerBridge
              account and associated data.
            </p>

          </div>


          <button
            className="danger-button"
            onClick={() =>
              setShowDeleteModal(true)
            }
          >
            Delete Account
          </button>

        </div>

      </section>


      {/* =====================================================
          DEACTIVATE MODAL
      ===================================================== */}

      {showDeactivateModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              Deactivate your account?
            </h2>

            <p>
              Your account will be temporarily disabled.
              Your data will be retained and you can
              reactivate your account later.
            </p>


            <div className="modal-actions">

              <button
                className="cancel-button"
                onClick={() =>
                  setShowDeactivateModal(false)
                }
              >
                Cancel
              </button>


              <button
                className="danger-button"
                onClick={handleDeactivate}
              >
                Deactivate Account
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE FIRST MODAL
      ===================================================== */}

      {showDeleteModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              Delete your account?
            </h2>

            <p>
              This will permanently delete your
              CareerBridge account and associated data.
            </p>


            <div className="modal-actions">

              <button
                className="cancel-button"
                onClick={() =>
                  setShowDeleteModal(false)
                }
              >
                Cancel
              </button>


              <button
                className="danger-button"
                onClick={handleDeleteContinue}
              >
                Continue
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE SECOND MODAL
      ===================================================== */}

      {showDeleteConfirmation && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              Permanently delete account
            </h2>

            <p>
              This action cannot be undone.
            </p>

            <p>
              Type <strong>DELETE</strong> below
              to confirm.
            </p>


            <input
              className="delete-input"
              type="text"
              value={deleteText}
              onChange={(e) =>
                setDeleteText(e.target.value)
              }
              placeholder="DELETE"
            />


            <div className="modal-actions">

              <button
                className="cancel-button"
                onClick={() => {

                  setShowDeleteConfirmation(false);

                  setDeleteText("");

                }}
              >
                Cancel
              </button>


              <button
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