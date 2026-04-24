import React, { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import "./individualregscreen.css";
import { IndividualProfile } from "./services/profileService";
import { uploadPhoto } from "./services/uploadService";
import { register } from "./services/authService";

const ALGERIAN_CITIES = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia", "Biskra", "Bechar", "Blida", "Bouira",
  "Tamanrasset", "Tebessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Setif", "Saida",
  "Skikda", "Sidi Bel Abbes", "Annaba", "Guelma", "Constantine", "Medea", "Mostaganem", "M'Sila", "Mascara",
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdes", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama", "Ain Temouchent", "Ghardaia",
  "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Beni Abbes", "In Salah", "In Guezzam",
  "Touggourt", "Djanet", "El M'Ghair", "El Menia"
];

function CityAutocompleteField({ value, onChange, placeholder, inputClassName = "" }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = (query) =>
    ALGERIAN_CITIES
      .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);

  const handleInputChange = (nextValue) => {
    onChange(nextValue);
    setSelectedIndex(-1);

    if (!nextValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSuggestions(filteredCities(nextValue));
    setShowSuggestions(true);
  };

  const selectCity = (city) => {
    onChange(city);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === "Enter" && selectedIndex >= 0) {
      event.preventDefault();
      selectCity(suggestions[selectedIndex]);
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="ir-city-autocomplete" ref={wrapperRef}>
      <input
        className={inputClassName}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          if (value.trim()) {
            setSuggestions(filteredCities(value));
            setShowSuggestions(true);
          }
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {showSuggestions && suggestions.length > 0 ? (
        <ul className="ir-city-suggestions">
          {suggestions.map((city, index) => (
            <li
              key={city}
              className={`ir-city-suggestion-item ${index === selectedIndex ? "selected" : ""}`}
              onMouseDown={() => selectCity(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

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
    if (!/^\d{18}$/.test(form.nationalId))
      e.nationalId = "NIN must contain exactly 18 digits.";
    if (!form.location.trim()) {
      e.location = "Location is required.";
    } else if (!ALGERIAN_CITIES.some((city) => city.toLowerCase() === form.location.trim().toLowerCase())) {
      e.location = "Please select a valid location from the list.";
    }
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

      await IndividualProfile({
        full_Name: form.fullName.trim(),
        nin: form.nationalId.replace(/\D/g, ""),
        location: form.location.trim(),
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
            type="text" placeholder="e.g. 100002456899750301"
            value={form.nationalId}
            onChange={e => handleChange("nationalId", e.target.value.replace(/\D/g, "").slice(0, 18))}
            maxLength={18}
            inputMode="numeric"/>
          {errors.nationalId && <span className="ir-error ir-error--show">{errors.nationalId}</span>}
        </div>

        <div className="ir-field-group">
          <label className="ir-label">Location</label>
          <CityAutocompleteField
            inputClassName={`ir-input ${errors.location ? "ir-input--error" : ""}`}
            placeholder="Select a city"
            value={form.location}
            onChange={(nextValue) => handleChange("location", nextValue)}
          />
          {errors.location && <span className="ir-error ir-error--show">{errors.location}</span>}
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