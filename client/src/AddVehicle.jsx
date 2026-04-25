import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import "./AddVehicle.css";
import { addVehicle } from "./services/vehicleService";
import { uploadPhoto } from "./services/uploadService";
import { toastError, toastSuccess } from "./services/toastService";

const VEHICLE_TYPES = [
  { vehicle: "Small Van",          vehicleFr: "Camionnette",       icon: "🚐" },
  { vehicle: "Fourgon",            vehicleFr: "Fourgon",           icon: "🚚" },
  { vehicle: "Closed Box Van",     vehicleFr: "Fourgon Fermé",     icon: "🚛" },
  { vehicle: "Refrigerated Truck", vehicleFr: "Frigo",             icon: "❄️" },
  { vehicle: "Open-Slat Truck",    vehicleFr: "Maraîcher",         icon: "🌿" },
  { vehicle: "Dropside Truck",     vehicleFr: "Camion à ridelles", icon: "🏗️" },
  { vehicle: "Semi-trailer",       vehicleFr: "Semi-remorque",     icon: "🚜" },
  { vehicle: "Tanker",             vehicleFr: "Citerne",           icon: "🛢️" },
  { vehicle: "Livestock Carrier",  vehicleFr: "Camion à Bétail",   icon: "🐄" },
  { vehicle: "Tow Truck",          vehicleFr: "Dépanneuse",        icon: "🔧" },
  { vehicle: "Flatbed Truck",      vehicleFr: "Plateau",           icon: "🛻" },
  { vehicle: "Tipper Truck",       vehicleFr: "Benne",             icon: "⛏️" },
  { vehicle: "Crane Truck",        vehicleFr: "Camion Grue",       icon: "🏗️" },
  { vehicle: "Concrete Mixer",     vehicleFr: "Toupie / Malaxeur", icon: "🔄" },
  { vehicle: "Car Transporter",    vehicleFr: "Porte-voiture",     icon: "🚗" },
  { vehicle: "Motorcycle Courier", vehicleFr: "Coursier Moto",     icon: "🏍️" },
  { vehicle: "Pickup Truck",       vehicleFr: "Pick-up",           icon: "🛻" },
  { vehicle: "Container Truck",    vehicleFr: "Porte-conteneur",   icon: "📦" },
  { vehicle: "Bulk Carrier",       vehicleFr: "Vrac",              icon: "⚙️" },
  { vehicle: "Medical Transport",  vehicleFr: "Transport Médical", icon: "🏥" },
];

// ─── Single-select Chip Grid ──────────────────────────────────────────────────
const ChipGrid = ({ options, selected, onSelect }) => (
  <div className="av-chip-grid">
    {options.map((opt) => {
      const active = selected === opt.vehicle;
      return (
        <button
          key={opt.vehicle}
          type="button"
          className={`av-chip${active ? " av-chip--active" : ""}`}
          onClick={() => onSelect(active ? "" : opt.vehicle)}
        >
          <span className="av-chip-icon">{opt.icon}</span>
          <span className="av-chip-label">{opt.vehicle}</span>
          <span className="av-chip-sub">{opt.vehicleFr}</span>
          {active && (
            <span className="av-chip-check">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <polyline points="2,6 5,9 10,3" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddVehicle({ onBack, onAdded }) {
  const [form, setForm] = useState({
    type:        "",
    name:        "",
    color:       "",
    year:        "",
    plateNumber: "",
    capacity:    "",
  });
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handlePhotosChange = (e) => {
    setPhotos(Array.from(e.target.files || []).slice(0, 5));
  };

  const handleSubmit = async () => {
    const isValid =
      form.type &&
      form.name &&
      form.color &&
      form.year &&
      form.plateNumber &&
      form.capacity;

    if (!isValid) {
      toastError("Please fill in all required fields and select a vehicle type.");
      return;
    }

    const capacity = Number(form.capacity);
    const year     = Number(form.year);

    if (!Number.isFinite(capacity) || capacity <= 0) {
      toastError("Capacity must be a positive number.");
      return;
    }
    if (!Number.isFinite(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      toastError("Please enter a valid year.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) { toastError("Please login first."); return; }

    try {
      setLoading(true); setSuccess(false);

      const photoData = photos[0] ? await uploadPhoto(photos[0]) : null;

      const payload = {
        type:        form.type,
        name:        form.name.trim(),
        color:       form.color.trim(),
        year,
        plateNumber: form.plateNumber.trim(),
        capacity,
        photo:       photoData,
      };

      const addedVehicle = await addVehicle(payload);

      setSuccess(true);
      toastSuccess("Vehicle added", { description: "Your vehicle is now available." });
      setForm({ type: "", name: "", color: "", year: "", plateNumber: "", capacity: "" });
      setPhotos([]);

      if (onAdded) onAdded(addedVehicle);
    } catch (err) {
      toastError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="av-screen">
      <div className={`av-container ${mounted ? "av-container--visible" : ""}`}>

        {/* Header */}
        <div className="av-header">
          <button className="av-back-btn" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="av-title">Add Vehicle</h2>
          <ThemeToggle />
        </div>

        <div className="av-body">

          <div className="av-section-header">
            <span className="av-section-dot" />
            <span className="av-section-label">VEHICLE INFORMATION</span>
          </div>

          {/* Vehicle Type — chip grid single select */}
          <div className="av-field">
            <label className="av-label">
              Vehicle Type
              <span className="av-label-hint">Select one</span>
            </label>
            <ChipGrid
              options={VEHICLE_TYPES}
              selected={form.type}
              onSelect={(val) => handleChange("type", val)}
            />
          </div>

          {/* Vehicle Name */}
          <div className="av-field">
            <label className="av-label">Vehicle Name</label>
            <input
              className="av-input"
              type="text"
              placeholder="e.g. Mercedes Actros"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
            />
          </div>

          {/* Color */}
          <div className="av-field">
            <label className="av-label">Color</label>
            <input
              className="av-input"
              type="text"
              placeholder="e.g. White"
              value={form.color}
              onChange={e => handleChange("color", e.target.value)}
            />
          </div>

          {/* Year + Plate Number */}
          <div className="av-field-row">
            <div className="av-field av-field--half">
              <label className="av-label">Year</label>
              <input
                className="av-input"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder="e.g. 2022"
                value={form.year}
                onChange={e => handleChange("year", e.target.value)}
              />
            </div>
            <div className="av-field av-field--half">
              <label className="av-label">Plate Number</label>
              <input
                className="av-input"
                type="text"
                placeholder="e.g. 12345-123-12"
                value={form.plateNumber}
                onChange={e => handleChange("plateNumber", e.target.value)}
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="av-field">
            <label className="av-label">Capacity (tons)</label>
            <div className="av-input-suffix-wrap">
              <input
                className="av-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 12"
                value={form.capacity}
                onChange={e => handleChange("capacity", e.target.value)}
              />
              <span className="av-suffix">T</span>
            </div>
          </div>

          {/* Upload Photos */}
          <div className="av-field">
            <label className="av-label" htmlFor="av-photos">Upload Photos</label>
            <label className="av-upload-box" htmlFor="av-photos">
              <span className="av-upload-main">Upload photos</span>
            </label>
            <input
              id="av-photos"
              className="av-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
            />
            {photos.length > 0 && (
              <p className="av-upload-selected">{photos.length} photo(s) selected</p>
            )}
          </div>

        </div>

        <div className="av-footer">
          {success && <div className="av-feedback av-feedback--success">Vehicle added successfully!</div>}
          <button className="av-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding…" : "Add Vehicle"}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}