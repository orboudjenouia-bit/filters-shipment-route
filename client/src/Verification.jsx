import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Verification.css";
import myemail from "./photo/mail.svg";
import { verifyCode } from "./services/verificationService";

export default function Verification({ onBack, onSuccess }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 2500);
  };

  const handleSubmit = async () => {
    const codeStr = code.join("");
    if (!/^\d{6}$/.test(codeStr)) {
      showError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const data = await verifyCode(codeStr);
      setLoading(false);
      if (data?.success === true) {
        if (onSuccess) onSuccess();
      } else {
        showError(data?.msg || data?.message || "Invalid code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
      }
    } catch {
      setLoading(false);
      showError("Could not reach the server. Check your connection.");
    }
  };

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length === 6) {
      setCode(value.split(""));
      inputsRef.current[5]?.focus();
      return;
    }
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handleResend = () => {
    if (timeLeft > 0) return;
    setTimeLeft(60);
    setCode(["", "", "", "", "", ""]);
    setError("");
    setTimeout(() => inputsRef.current[0]?.focus(), 100);
  };

  const allFilled = code.every(d => d !== "");

  return (
    <div className="vf-screen">
      <div className={`vf-card ${mounted ? "vf-card--visible" : ""}`}>

        <div className="vf-header">
          <button className="vf-back-btn" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="vf-step-label">Step 3 of 3</span>
          <ThemeToggle />
        </div>

        <div className="vf-section-tag">
          Account Setup <span className="vf-step-tag">STEP 3 OF 3</span>
        </div>

        <div className="vf-progress-track">
          <div className="vf-progress-bar" style={{ width: mounted ? "100%" : "0%" }} />
        </div>

        <div className="vf-icon-circle">
          <img src={myemail} alt="Email" className="vf-icon-img" />
        </div>

        <h1 className="vf-title">Verify your email</h1>
        <p className="vf-subtitle">
          We've sent a 6-digit code to <strong>alex@example.com</strong>. Enter it below to continue.
        </p>

        <div className="vf-code-inputs">
          {code.map((digit, index) => (
            <input
              key={index} type="text" inputMode="numeric" maxLength="1" value={digit}
              ref={el => (inputsRef.current[index] = el)}
              onChange={e => handleChange(e.target.value, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              className={`vf-code-input ${digit ? "vf-code-input--filled" : ""}`}
            />
          ))}
        </div>

        <div className={`vf-error ${error ? "vf-error--show" : ""}`}>{error}</div>

        <div className="vf-timer-row">
          <div className="vf-timer-box">
            <span className="vf-timer-icon">⏱</span>
            00:{String(timeLeft).padStart(2, "0")}
          </div>
        </div>

        <div className="vf-spacer" />

        <button
          className={`vf-verify-btn ${allFilled ? "vf-verify-btn--ready" : ""} ${loading ? "vf-verify-btn--loading" : ""}`}
          onClick={handleSubmit} disabled={loading} type="button"
        >
          {loading ? <span className="vf-spinner" /> : "Verify"}
        </button>

        <p className="vf-resend">
          Didn't receive the code?{" "}
          <span
            className={`vf-resend-link ${timeLeft === 0 ? "vf-resend-link--active" : "vf-resend-link--disabled"}`}
            onClick={handleResend}
          >
            Resend {timeLeft > 0 && `(${timeLeft}s)`}
          </span>
        </p>

      </div>
    </div>
  );
}