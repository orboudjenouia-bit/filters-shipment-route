import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "./Resetpassword.css";
import { resetPassword } from "./services/authService";
import { toastError, toastSuccess } from "./services/toastService";

export default function ResetPassword({ token, onBack, onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isTokenValid = useMemo(() => typeof token === "string" && token.trim().length > 0, [token]);

  const showError = (message) => {
    toastError(message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isTokenValid) {
      showError("Reset token is missing or invalid.");
      return;
    }

    if (!password || !confirmPassword) {
      showError("Please fill in all fields.");
      return;
    }

    if (password.length < 10) {
      showError("Password must be at least 10 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      setSuccess(true);
      toastSuccess("Password updated", { description: "You can now sign in with your new password." });
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err) {
      showError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-screen">
      <div className="rp-card">
        <div className="rp-header">
          <button className="rp-back-btn" onClick={onBack} type="button">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2 className="rp-page-title">Reset Password</h2>
          <ThemeToggle />
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} noValidate>
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-password">New Password</label>
              <div className="rp-input-wrapper">
                <Lock size={16} className="rp-input-icon" />
                <input
                  id="rp-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-confirm-password">Confirm Password</label>
              <div className="rp-input-wrapper">
                <Lock size={16} className="rp-input-icon" />
                <input
                  id="rp-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="rp-btn" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="rp-success">Password updated successfully. Redirecting to login...</div>
        )}
      </div>
    </div>
  );
}