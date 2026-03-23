import { useState, useEffect } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import "./Forgotpassword.css";
import { forgotPassword } from "./services/authService";

export default function ForgotPassword({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewResetLink, setPreviewResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) { showError("Please enter your email address."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showError("Please enter a valid email address."); return; }

    try {
      setLoading(true);
      setError("");

      const data = await forgotPassword(email);

      setPreviewResetLink(data?.resetLink || "");

      setSuccess(true);

    } catch (err) {
      console.error(err);
      showError(err.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-screen">
      <div className={`fp-card ${mounted ? "fp-card--visible" : ""}`}>

        {/* Header */}
        <div className="fp-header">
          <button className="fp-back-btn" onClick={onBack} type="button">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2 className="fp-page-title">Forgot Password</h2>
          <div style={{ width: 36 }} />
        </div>

        {/* Icon */}
        <div className="fp-icon-circle">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#22c55e" strokeWidth="1.5"/>
            <path d="M12 8v4l3 3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 12a4 4 0 0 1 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 7l-1.5-1.5M17 7l1.5-1.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="fp-title">Forgot Password?</h1>
        <p className="fp-subtitle">
          Don't worry! It happens. Please enter the email address associated with your account.
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} noValidate>

            <div className="fp-field">
              <label className="fp-label" htmlFor="fp-email">Email Address</label>
              <div className="fp-input-wrapper">
                <Mail size={16} className="fp-input-icon" />
                <input
                  id="fp-email"
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="fp-error">{error}</div>}

            <button className="fp-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>

          </form>
        ) : (
          <div className="fp-success">
            <div className="fp-success-icon">✓</div>
            <p className="fp-success-text">
              Reset code sent! Check your email inbox and follow the instructions.
            </p>
            {previewResetLink && (
              <p className="fp-success-text" style={{ marginTop: 10 }}>
                Local test link: <a href={previewResetLink}>{previewResetLink}</a>
              </p>
            )}
          </div>
        )}

        <div className="fp-spacer" />

        {/* Back to Sign In */}
        <p className="fp-footer-text">
          Remember password?{" "}
          <button type="button" className="fp-footer-link" onClick={onBack}>
            Back to Sign In
          </button>
        </p>

      </div>
    </div>
  );
}