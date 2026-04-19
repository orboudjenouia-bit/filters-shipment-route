import React, { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Createshipment.css";
import { createShipment } from "./services/shipmentService";
import { uploadPhoto } from "./services/uploadService";

const categories = ["Electronics", "Furniture", "Apparel", "Food & Beverages", "Machinery", "Documents", "Other"];
const priorities = ["Normal", "High", "Urgent"];

const algerianCities = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
  "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam",
  "Touggourt", "Djanet", "El M'Ghair", "El Menia"
];

const CityAutocomplete = ({ value, onChange, placeholder, icon: Icon }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    if (newValue.length > 0) {
      const filtered = algerianCities.filter((city) =>
        city.toLowerCase().includes(newValue.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    onChange(newValue);
  };

  const handleSelectCity = (city) => {
    setInputValue(city);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(city);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectCity(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="city-autocomplete-cs" ref={wrapperRef}>
      <div className="cs-input-icon-wrap">
        {Icon && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="cs-input-icon">
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
        </svg>}
        <input
          ref={inputRef}
          type="text"
          className="cs-input cs-input--with-icon"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="city-suggestions-cs">
          {suggestions.map((city, index) => (
            <li
              key={city}
              className={`city-suggestion-item-cs ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSelectCity(city)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="city-suggestion-icon-cs">
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{city}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function CreateShipment({ onBack, onCreated }) {
  const [form, setForm] = useState({
    title: "", category: "", weight: "", volume: "",
    pickup: "", delivery: "", date: "", time: "", priority: "Normal", description: "",
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setError("");
  };

  const handlePhotosChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotos(files.slice(0, 5));
  };

  const isValidCity = (city) => {
    if (!city || city.trim() === "") return false;
    return algerianCities.some(
      (validCity) => validCity.toLowerCase() === city.toLowerCase().trim()
    );
  };

  const handleSubmit = async () => {
    const isValid =
      form.title &&
      form.category &&
      form.weight &&
      form.volume &&
      form.pickup &&
      form.delivery &&
      form.date &&
      form.time &&
      form.priority;

    if (!isValid) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidCity(form.pickup)) {
      setError(`"${form.pickup}" is not a valid Algerian city. Please choose from the list.`);
      return;
    }

    if (!isValidCity(form.delivery)) {
      setError(`"${form.delivery}" is not a valid Algerian city. Please choose from the list.`);
      return;
    }
    
    const volume = Number(form.volume);
    const weight = Number(form.weight);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      return;
    }

    if (!Number.isFinite(volume) || !Number.isFinite(weight) || volume <= 0 || weight <= 0) {
      setError("Weight and volume must be positive numbers.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const photoData = photos[0] ? await uploadPhoto(photos[0]) : null;

      const payload = {
        title: form.title.trim(),
        category: form.category,
        photo: photoData,
        origin: form.pickup.trim(),
        destination: form.delivery.trim(),
        volume,
        weight,
        date: form.date,
        time: form.time,
        priority: form.priority,
        special_Information: form.description.trim() || null
      };

      const createdShipment = await createShipment(payload);

      setSuccess(true);
      setForm({
        title: "", category: "", weight: "", volume: "",
        pickup: "", delivery: "", date: "", time: "", priority: "Normal", description: "",
      });
      setPhotos([]);

      const createdId = createdShipment?.shipment_ID ?? createdShipment?.id ?? createdShipment?._id;
      if (onCreated && createdId != null) {
        onCreated(createdId);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-screen">
      <div className={`cs-container ${mounted ? "cs-container--visible" : ""}`}>

        <div className="cs-header">
          <button className="cs-back-btn" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="cs-title">Create Shipment</h2>
          <ThemeToggle />
        </div>

        <div className="cs-body">

          <div className="cs-section-header">
            <span className="cs-section-dot" />
            <span className="cs-section-label">SHIPMENT INFORMATION</span>
          </div>

          <div className="cs-field">
            <label className="cs-label">Shipment Title</label>
            <input
              className="cs-input"
              type="text"
              placeholder="e.g. Office Desk & Chairs"
              value={form.title}
              onChange={e => handleChange("title", e.target.value)}
            />
          </div>

          <div className="cs-field">
            <label className="cs-label">Category</label>
            <div className="cs-select-wrap">
              <select
                className="cs-select"
                value={form.category}
                onChange={e => handleChange("category", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className="cs-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="cs-field-row">
            <div className="cs-field cs-field--half">
              <label className="cs-label">Weight (kg)</label>
              <div className="cs-input-suffix-wrap">
                <input
                  className="cs-input"
                  type="number"
                  placeholder="0.0"
                  value={form.weight}
                  onChange={e => handleChange("weight", e.target.value)}
                />
                <span className="cs-suffix">KG</span>
              </div>
            </div>
            <div className="cs-field cs-field--half">
              <label className="cs-label">Volume (m³)</label>
              <div className="cs-input-suffix-wrap">
                <input
                  className="cs-input"
                  type="number"
                  placeholder="0.0"
                  value={form.volume}
                  onChange={e => handleChange("volume", e.target.value)}
                />
                <span className="cs-suffix">M³</span>
              </div>
            </div>
          </div>

          <div className="cs-field">
            <label className="cs-label">Priority</label>
            <div className="cs-select-wrap">
              <select
                className="cs-select"
                value={form.priority}
                onChange={e => handleChange("priority", e.target.value)}
              >
                {priorities.map(priority => <option key={priority} value={priority}>{priority}</option>)}
              </select>
              <svg className="cs-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="cs-field">
            <label className="cs-label">Description / Special Information</label>
            <textarea
              className="cs-input cs-textarea"
              rows={3}
              placeholder="Any fragile notes, handling instructions, or extra details"
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
            />
          </div>

          <div className="cs-field">
            <label className="cs-label" htmlFor="cs-photos">Photos</label>
            <label className="cs-upload-box" htmlFor="cs-photos">
              <span className="cs-upload-main">Upload photos</span>
            </label>
            <input
              id="cs-photos"
              className="cs-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
            />
            {photos.length > 0 && (
              <p className="cs-upload-selected">{photos.length} photo(s) selected</p>
            )}
          </div>

          <div className="cs-section-header">
            <span className="cs-section-dot" />
            <span className="cs-section-label">LOGISTICS & SCHEDULE</span>
          </div>

          <div className="cs-field">
            <label className="cs-label">Pickup Location</label>
            <CityAutocomplete
              value={form.pickup}
              onChange={(value) => handleChange("pickup", value)}
              placeholder="Source address"
              icon={true}
            />
          </div>

          <div className="cs-field">
            <label className="cs-label">Delivery Location</label>
            <CityAutocomplete
              value={form.delivery}
              onChange={(value) => handleChange("delivery", value)}
              placeholder="Destination address"
              icon={true}
            />
          </div>

          <div className="cs-schedule-card">
            <div className="cs-schedule-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#22c55e" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="#22c55e" strokeWidth="2"/>
              </svg>
              <span className="cs-schedule-title">Schedule Pickup</span>
            </div>
            <div className="cs-schedule-row">
              <div className="cs-schedule-field">
                <label className="cs-schedule-label">DATE</label>
                <input
                  className="cs-schedule-input"
                  type="date"
                  value={form.date}
                  onChange={e => handleChange("date", e.target.value)}
                />
              </div>
              <div className="cs-schedule-field">
                <label className="cs-schedule-label">TIME</label>
                <input
                  className="cs-schedule-input"
                  type="time"
                  value={form.time}
                  onChange={e => handleChange("time", e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>

        <div className="cs-footer">
          {error && <div className="cs-feedback cs-feedback--error">{error}</div>}
          {success && <div className="cs-feedback cs-feedback--success">Shipment posted successfully!</div>}

          <button className="cs-submit-btn" onClick={handleSubmit} disabled={loading}>
            Post Shipment
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}