import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import "./individualregscreen.css";
import { IndividualProfile } from "./services/profileService";
import { uploadPhoto } from "./services/uploadService";

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function IndividualRegScreen({ onBack, onNext, onLogin }) {
  const [form, setForm] = useState({ fullName: "", nationalId: "", location: "" });
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
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.nationalId || form.nationalId.replace(/\D/g, "").length !== 10)
      e.nationalId = "National ID must contain exactly 10 digits.";
    return e;
  };

  const handleNext = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitError("");
    setSubmitting(true);

    try {
      const uploadedPhotoPath = photoFile ? await uploadPhoto(photoFile) : undefined;

      await IndividualProfile({
        full_Name: form.fullName.trim(),
        nin: form.nationalId.replace(/\D/g, ""),
        location: form.location.trim() || "Not provided",
        photo: uploadedPhotoPath,
      });

      if (onNext) onNext(form);
    } catch (err) {
      setSubmitError(err.message || "Failed to save individual profile.");
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
    <div className="ir-screen">
      <div className={`ir-card ${mounted ? "ir-card--visible" : ""}`}>

        <div className="ir-header">
          <button className="ir-back-btn" onClick={onBack} type="button"><BackIcon /></button>
          <span className="ir-step-label">Step 2 of 3</span>
          <ThemeToggle />
        </div>

        <div className="ir-section-tag">
          Account Setup <span className="ir-step-tag">STEP 2 OF 3</span>
        </div>

        <div className="ir-progress-track">
          <div className="ir-progress-bar" style={{ width: mounted ? "66%" : "0%" }} />
        </div>

        <h1 className="ir-title">Individual Account</h1>
        <p className="ir-subtitle">Enter your personal details to complete your registration.</p>

        <div className="ir-field-group">
          <label className="ir-label">Full Name</label>
          <input className={`ir-input ${errors.fullName ? "ir-input--error" : ""}`}
            type="text" placeholder="e.g. Ahmed Benali"
            value={form.fullName} onChange={e => handleChange("fullName", e.target.value)}/>
          {errors.fullName && <span className="ir-error ir-error--show">{errors.fullName}</span>}
        </div>

        <div className="ir-field-group">
          <label className="ir-label">National Identification Number</label>
          <input className={`ir-input ${errors.nationalId ? "ir-input--error" : ""}`}
            type="text" placeholder="e.g. 1000024568997503"
            value={form.nationalId} onChange={e => handleChange("nationalId", e.target.value)} maxLength={24}/>
          {errors.nationalId && <span className="ir-error ir-error--show">{errors.nationalId}</span>}
        </div>

        <div className="ir-field-group">
          <label className="ir-label">Location</label>
          <input
            className="ir-input"
            type="text"
            placeholder="e.g. Algiers, Algeria"
            value={form.location}
            onChange={e => handleChange("location", e.target.value)}
          />
        </div>

        <div className="ir-field-group">
          <label className="ir-label" htmlFor="individual-profile-photo">Profile Photo (optional)</label>
          <label className="ir-upload-box" htmlFor="individual-profile-photo">
            <span className="ir-upload-main">Choose profile photo</span>
            <span className="ir-upload-sub">PNG, JPG, WEBP</span>
          </label>
          <input
            id="individual-profile-photo"
            className="ir-file-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {photoFile ? <span className="ir-upload-selected">Selected: {photoFile.name}</span> : null}
        </div>

        <div className="ir-spacer" />

        {submitError && <span className="ir-error ir-error--show">{submitError}</span>}

        <button className="ir-next-btn" onClick={handleNext} disabled={submitting}>
          {submitting ? "Saving..." : "Next"}
        </button>

        <p className="ir-login-text">
          Already have an account?{" "}
          <button type="button" className="ir-login-link" onClick={onLogin}>Log in</button>
        </p>

      </div>
    </div>
  );
}