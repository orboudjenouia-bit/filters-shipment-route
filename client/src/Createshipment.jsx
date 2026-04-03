import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Createshipment.css";
import { createShipment } from "./services/shipmentService";

const categories = ["Electronics", "Furniture", "Apparel", "Food & Beverages", "Machinery", "Documents", "Other"];
const priorities = ["Normal", "High", "Urgent"];

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

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read selected photo."));
      reader.readAsDataURL(file);
    });

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
    
    const volume = Number(form.volume);
    const weight = Number(form.weight);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      return;
    }

    if (!Number.isInteger(volume) || !Number.isInteger(weight)) {
      setError("Weight and volume must be whole numbers.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const photoData = photos[0] ? await fileToDataUrl(photos[0]) : null;

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
            <div className="cs-input-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="cs-input-icon">
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                className="cs-input cs-input--with-icon"
                type="text"
                placeholder="Source address"
                value={form.pickup}
                onChange={e => handleChange("pickup", e.target.value)}
              />
            </div>
          </div>

          <div className="cs-field">
            <label className="cs-label">Delivery Location</label>
            <div className="cs-input-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="cs-input-icon">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                className="cs-input cs-input--with-icon"
                type="text"
                placeholder="Destination address"
                value={form.delivery}
                onChange={e => handleChange("delivery", e.target.value)}
              />
            </div>
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