import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Businessregscreen.css";
import { BusinessProfile } from "./services/profileService";
import { uploadPhoto } from "./services/uploadService";
import { register } from "./services/authService";

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function BusinessRegScreen({ onBack, onNext, onLogin }) {
  const [form, setForm] = useState({ businessName: "", rcNumber: "", tin: "", sin: "", legalForm: "", location: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = "Business name is required.";
    if (!form.rcNumber || form.rcNumber.replace(/\D/g, "").length !== 10)
      e.rcNumber = "RC number must be exactly 10 digits.";
    if (!form.tin.trim()) e.tin = "Tax Identification Number is required.";
    if (!form.sin.trim()) e.sin = "Statistical Identification Number is required.";
    if (!form.legalForm.trim()) e.legalForm = "Legal form is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    return e;
  };

  const handleNext = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitError("");
    setSubmitting(true);

    try {
      const existingToken = localStorage.getItem("token");

      if (!existingToken) {
        const pendingRaw = sessionStorage.getItem("pendingRegistration");
        if (!pendingRaw) {
          throw new Error("Missing account setup data. Please complete Step 1 first.");
        }

        const pending = JSON.parse(pendingRaw);
        const data = await register(pending.email, pending.password, pending.phone, pending.type);

        if (data?.token) {
          localStorage.setItem("token", data.token);
        }
        if (data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        sessionStorage.removeItem("pendingRegistration");
      }

      const uploadedPhotoPath = photoFile ? await uploadPhoto(photoFile) : undefined;

      await BusinessProfile({
        business_Name: form.businessName.trim(),
        rc_Number: form.rcNumber.replace(/\s/g, ""),
        form: form.legalForm.trim(),
        nif: parseInt(form.tin, 10),
        nis: parseInt(form.sin, 10),
        locations: [form.location.trim()],
        photo: uploadedPhotoPath,
      });

      if (onNext) onNext(form);
    } catch (err) {
      setSubmitError(err.message || "Failed to save business profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
    setSubmitError("");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setPhotoFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please choose a valid image file.");
      setPhotoFile(null);
      return;
    }

    setPhotoFile(file);
    setSubmitError("");
  };

  return (
    <div className="br-screen">
      <div className={`br-card ${mounted ? "br-card--visible" : ""}`}>

        <div className="br-header">
          <button className="br-back-btn" onClick={onBack} type="button"><BackIcon /></button>
          <span className="br-step-label">Step 2 of 3</span>
          <ThemeToggle />
        </div>

        <div className="br-section-tag">
          Account Setup <span className="br-step-tag">STEP 2 OF 3</span>
        </div>

        <div className="br-progress-track">
          <div className="br-progress-bar" style={{ width: mounted ? "66%" : "0%" }} />
        </div>

        <h1 className="br-title">Business Account</h1>
        <p className="br-subtitle">Enter your business details to complete your registration.</p>

        <div className="br-field-group">
          <label className="br-label">Business Name</label>
          <input className={`br-input ${errors.businessName ? "br-input--error" : ""}`}
            type="text" placeholder="e.g. Benali Logistics SARL"
            value={form.businessName} onChange={e => handleChange("businessName", e.target.value)}/>
          {errors.businessName && <span className="br-error br-error--show">{errors.businessName}</span>}
        </div>

        <div className="br-field-group">
          <label className="br-label">RC Number</label>
          <input className={`br-input ${errors.rcNumber ? "br-input--error" : ""}`}
            type="text" placeholder="Registered company number"
            value={form.rcNumber} onChange={e => handleChange("rcNumber", e.target.value)} maxLength={14}/>
          {errors.rcNumber && <span className="br-error br-error--show">{errors.rcNumber}</span>}
        </div>

        <div className="br-field-group">
          <label className="br-label">TIN</label>
          <input className={`br-input ${errors.tin ? "br-input--error" : ""}`}
            type="text" placeholder="Tax Identification Number"
            value={form.tin} onChange={e => handleChange("tin", e.target.value)}/>
          {errors.tin && <span className="br-error br-error--show">{errors.tin}</span>}
        </div>

        <div className="br-field-group">
          <label className="br-label">SIN</label>
          <input className={`br-input ${errors.sin ? "br-input--error" : ""}`}
            type="text" placeholder="Statistical Identification Number"
            value={form.sin} onChange={e => handleChange("sin", e.target.value)}/>
          {errors.sin && <span className="br-error br-error--show">{errors.sin}</span>}
        </div>

        <div className="br-field-group">
          <label className="br-label">Legal Form</label>
          <input className={`br-input ${errors.legalForm ? "br-input--error" : ""}`}
            type="text" placeholder="e.g. SARL, SPA, EI"
            value={form.legalForm} onChange={e => handleChange("legalForm", e.target.value)}/>
          {errors.legalForm && <span className="br-error br-error--show">{errors.legalForm}</span>}
        </div>

        <div className="br-field-group">
          <label className="br-label">Location</label>
          <input className={`br-input ${errors.location ? "br-input--error" : ""}`}
            type="text" placeholder="e.g. Algiers"
            value={form.location} onChange={e => handleChange("location", e.target.value)}/>
          {errors.location && <span className="br-error br-error--show">{errors.location}</span>}
        </div>

        <div className="br-field-group">
          <label className="br-label" htmlFor="business-profile-photo">Profile Photo (optional)</label>
          <label className="br-upload-box" htmlFor="business-profile-photo">
            <span className="br-upload-main">Choose profile photo</span>
            <span className="br-upload-sub">PNG, JPG, WEBP</span>
          </label>
          <input
            id="business-profile-photo"
            className="br-file-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {photoFile ? <span className="br-upload-selected">Selected: {photoFile.name}</span> : null}
        </div>

        <div className="br-spacer" />

        {submitError && <span className="br-error br-error--show">{submitError}</span>}

        <button className="br-next-btn" onClick={handleNext} disabled={submitting}>
          {submitting ? "Saving..." : "Next"}
        </button>

        <p className="br-login-text">
          Already have an account?{" "}
          <button type="button" className="br-login-link" onClick={onLogin}>Log in</button>
        </p>

      </div>
    </div>
  );
}