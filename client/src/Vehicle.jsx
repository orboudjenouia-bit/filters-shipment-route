import { useState } from "react";
import { FiTrash2, FiChevronLeft } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import './Vehicle.css';

const API_URL = process.env.REACT_APP_API_URL;

const VEHICLE_TYPES = ["Select type", "Car", "Truck"];

let idCounter = 2;
const emptyVehicle = (id) => ({ id, type: "", model: "", plate: "" });

function VehicleForm({ vehicle, index, onUpdate, onRemove, showDivider }) {
  return (
    <div className={`vehicle-card${showDivider ? "" : " no-border"}`}>
      <div className="vehicle-card-header">
        <h2 className="vehicle-title">Vehicle {index + 1}</h2>
        {index > 0 && (
          <button className="remove-btn" onClick={() => onRemove(vehicle.id)}>
            <FiTrash2 size={15} /> Remove
          </button>
        )}
      </div>

      <div className="field-group">
        <label className="field-label">Vehicle Type</label>
        <div className="select-wrapper">
          <select
            className="field-input"
            value={vehicle.type}
            onChange={(e) => onUpdate(vehicle.id, "type", e.target.value)}
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t === "Select type" ? "" : t}>{t}</option>
            ))}
          </select>
          <span className="select-arrow">▾</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Model (Vehicle name)</label>
        <input
          className="field-input"
          type="text"
          placeholder="e.g. Toyota Camry"
          value={vehicle.model}
          onChange={(e) => onUpdate(vehicle.id, "model", e.target.value)}
        />
      </div>

      <div className="field-group">
        <label className="field-label">License Plate</label>
        <input
          className="field-input"
          type="text"
          placeholder="e.g. 00123-115-58"
          value={vehicle.plate}
          onChange={(e) => onUpdate(vehicle.id, "plate", e.target.value)}
        />
      </div>
    </div>
  );
}

export default function Vehicle() {
  const [vehicles, setVehicles] = useState([emptyVehicle(1)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateVehicle = (id, field, value) =>
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));

  const removeVehicle = (id) =>
    setVehicles((prev) => prev.filter((v) => v.id !== id));

  const addVehicle = () =>
    setVehicles((prev) => [...prev, emptyVehicle(idCounter++)]);

  const handleBack = () => {
    console.log("Go back");
  };

  const skip_now = () => {
    console.log("skip now");
  };

  const handleNext = async () => {
    const isValid = vehicles.every((v) => v.type && v.model && v.plate);
    if (!isValid) {
      setError("Please fill in all fields for every vehicle.");
      return;
    }

    const payload = vehicles.map(({ id, ...rest }) => rest);

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${API_URL}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vehicles: payload }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      console.log("Success:", data);
      setSuccess(true);
    } catch (err) {
      console.error("Error:", err.message);
      setError("Something went wrong. Please try again.");
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
          <h1 className="page-title">Add Vehicles</h1>
          <ThemeToggle />
        </header>

        <main className="page-body">
          {vehicles.map((v, i) => (
            <VehicleForm
              key={v.id}
              vehicle={v}
              index={i}
              onUpdate={updateVehicle}
              onRemove={removeVehicle}
              showDivider={i < vehicles.length - 1}
            />
          ))}

          <button className="add-vehicle-btn" onClick={addVehicle}>
            <span className="plus-icon">⊕</span>
            Add Another Vehicle
          </button>
        </main>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Vehicles submitted successfully!</div>}

        <footer className="page-footer">
          <button
            className={`next-btn ${loading ? "loading" : ""}`}
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? "Sending..." : "Next"}
          </button>
          <button className="skip-btn" onClick={skip_now}>Skip for now</button>
        </footer>

      </div>
    </div>
  );
}