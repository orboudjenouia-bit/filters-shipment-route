import { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import { createVehicle } from "./services/profileService";
import { uploadPhoto } from "./services/uploadService";
import { toastError, toastInfo, toastSuccess } from "./services/toastService";
import './Vehicle.css';

const VEHICLE_TYPES = ["Select type", "Car", "Truck"];

export default function Vehicle({ onBack, onNavigate }) {
  const [form, setForm] = useState({
    type: "",
    model: "",
    color: "",
    year: "",
    plate: "",
    capacity: "",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotosChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotos(files.slice(0, 5));
  };

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    }
  };

  const skip_now = () => {
    toastInfo("Skipped for now", { description: "You can add your vehicle later from your profile." });
    if (typeof onNavigate === "function") {
      onNavigate("profile");
    }
  };

  const handleAddVehicle = async () => {
    const isValid = form.type && form.model && form.color && form.year && form.plate && form.capacity;
    if (!isValid) {
      toastError("Please fill in all fields.");
      return;
    }

    const plateNumber = Number(form.plate);
    const capacity = Number(form.capacity);
    const year = Number(form.year);

    if (!Number.isInteger(plateNumber) || plateNumber <= 0) {
      toastError("Plate number must be a valid number.");
      return;
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      toastError("Capacity must be a valid number.");
      return;
    }

    if (!Number.isInteger(year) || year < 1900) {
      toastError("Year must be a valid number.");
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      const photoData = photos[0] ? await uploadPhoto(photos[0]) : null;

      await createVehicle({
        plate_Number: plateNumber,
        type: form.type,
        vehicle_Name: form.model.trim(),
        color: form.color.trim(),
        year,
        capacity,
        photo: photoData,
      });

      setSuccess(true);
      toastSuccess("Vehicle added", { description: "Your vehicle was added to your profile." });
      setForm({ type: "", model: "", color: "", year: "", plate: "", capacity: "" });
      setPhotos([]);

      if (typeof onNavigate === "function") {
        setTimeout(() => onNavigate("profile"), 700);
      }
    } catch (err) {
      const message = err?.message || "Something went wrong. Please try again.";
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">

        <header className="page-header">
          <button className="back-btn" onClick={handleBack}>
            <FiChevronLeft size={22} />
          </button>
          <h1 className="page-title">Add Vehicle</h1>
          <ThemeToggle />
        </header>

        <main className="page-body">
          <div className="vehicle-card no-border">
            <div className="vehicle-card-header">
              <h2 className="vehicle-title">Vehicle Information</h2>
            </div>

            <div className="field-group">
              <label className="field-label">Vehicle Type</label>
              <div className="select-wrapper">
                <select
                  className="field-input"
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t === "Select type" ? "" : t}>{t}</option>
                  ))}
                </select>
                <span className="select-arrow">▾</span>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Vehicle Name</label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. Mercedes Actros"
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Color</label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. White"
                value={form.color}
                onChange={(e) => updateField("color", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Year</label>
              <input
                className="field-input"
                type="number"
                placeholder="e.g. 2022"
                value={form.year}
                onChange={(e) => updateField("year", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Plate Number</label>
              <input
                className="field-input"
                type="number"
                placeholder="e.g. 12345"
                value={form.plate}
                onChange={(e) => updateField("plate", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Capacity (tons)</label>
              <input
                className="field-input"
                type="number"
                placeholder="e.g. 12"
                value={form.capacity}
                onChange={(e) => updateField("capacity", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="vehicle-photos">Upload Photos</label>
              <label className="vehicle-upload-box" htmlFor="vehicle-photos">
                <span className="vehicle-upload-main">Upload photos</span>
              </label>
              <input
                id="vehicle-photos"
                className="vehicle-file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotosChange}
              />
              {photos.length > 0 && (
                <p className="vehicle-upload-selected">{photos.length} photo(s) selected</p>
              )}
            </div>
          </div>
        </main>

        {success && <div className="alert alert-success">Vehicle added successfully!</div>}

        <footer className="page-footer">
          <button
            className={`add-vehicle-submit-btn ${loading ? "loading" : ""}`}
            onClick={handleAddVehicle}
            disabled={loading}
          >
            {loading ? "Adding..." : "ADD VEHICLE"}
          </button>
          <button className="skip-btn" onClick={skip_now}>Skip for now</button>
        </footer>

      </div>
    </div>
  );
}