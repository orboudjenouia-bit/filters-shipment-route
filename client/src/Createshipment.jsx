import React, { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Createshipment.css";
import { createShipment } from "./services/shipmentService";
import { uploadPhoto } from "./services/uploadService";
import { toastError, toastSuccess } from "./services/toastService";

// ─── Product Types (matches Shipments filter) ─────────────────────────────────
const CARGO_TYPES = [
  { product: "Small Parcels",           vehicle: "Small Van",         vehicleFr: "Camionnette",       icon: "📦" },
  { product: "Furniture",               vehicle: "Fourgon",           vehicleFr: "Fourgon",           icon: "🛋️" },
  { product: "Electronics / Fragile",  vehicle: "Closed Box Van",    vehicleFr: "Fourgon Fermé",     icon: "📺" },
  { product: "Perishables / Food",     vehicle: "Refrigerated Truck", vehicleFr: "Frigo",             icon: "🧊" },
  { product: "Agricultural Products",  vehicle: "Open-Slat Truck",   vehicleFr: "Maraîcher",         icon: "🌾" },
  { product: "Construction Materials", vehicle: "Dropside Truck",    vehicleFr: "Camion à ridelles", icon: "🏗️" },
  { product: "Industrial / Bulk",      vehicle: "Semi-trailer",      vehicleFr: "Semi-remorque",     icon: "🏭" },
  { product: "Liquids & Chemicals",    vehicle: "Tanker",            vehicleFr: "Citerne",           icon: "🛢️" },
  { product: "Livestock",              vehicle: "Livestock Carrier", vehicleFr: "Camion à Bétail",   icon: "🐄" },
  { product: "Towing & Recovery",      vehicle: "Tow Truck",         vehicleFr: "Dépanneuse",        icon: "🔧" },
];

// ─── All vehicle types (matches Shipments filter) ─────────────────────────────
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

// ─── City Autocomplete ────────────────────────────────────────────────────────
const CityAutocomplete = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setInputValue(value || ""); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v); setSelectedIndex(-1);
    if (v.length > 0) {
      setSuggestions(algerianCities.filter(c => c.toLowerCase().includes(v.toLowerCase())).slice(0, 10));
      setShowSuggestions(true);
    } else { setSuggestions([]); setShowSuggestions(false); }
    onChange(v);
  };

  const handleSelectCity = (city) => {
    setInputValue(city); setSuggestions([]); setShowSuggestions(false);
    onChange(city); inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(p => (p + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(p => (p - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" && selectedIndex >= 0) { e.preventDefault(); handleSelectCity(suggestions[selectedIndex]); }
    else if (e.key === "Escape") setShowSuggestions(false);
  };

  return (
    <div className="city-autocomplete-cs" ref={wrapperRef}>
      <div className="cs-input-icon-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="cs-input-icon">
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <input
          ref={inputRef} type="text" className="cs-input cs-input--with-icon"
          placeholder={placeholder} value={inputValue}
          onChange={handleInputChange} onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="city-suggestions-cs">
          {suggestions.map((city, i) => (
            <li key={city} className={`city-suggestion-item-cs ${i === selectedIndex ? "selected" : ""}`} onClick={() => handleSelectCity(city)}>
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

// ─── Chip Grid Selector ───────────────────────────────────────────────────────
const ChipGrid = ({ options, selected, onToggle, labelKey, subKey, iconKey, single = false }) => (
  <div className="cs-chip-grid">
    {options.map((opt) => {
      const val    = opt[labelKey];
      const sub    = opt[subKey];
      const icon   = opt[iconKey];
      const active = single ? selected === val : selected.includes(val);
      return (
        <button
          key={val} type="button"
          className={`cs-chip${active ? " cs-chip--active" : ""}`}
          onClick={() => onToggle(val)}
        >
          <span className="cs-chip-icon">{icon}</span>
          <span className="cs-chip-label">{val}</span>
          <span className="cs-chip-sub">{sub}</span>
          {active && (
            <span className="cs-chip-check">
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
export default function CreateShipment({ onBack, onCreated }) {
  const [form, setForm] = useState({
    productType: "",
    vehicleTypes: [],         // multi-select
    quantity: "",
    weight: "",
    volume: "",
    price: "",
    pickup: "",
    delivery: "",
    date: "",
    time: "",
    priority: "Normal",
    description: "",
  });
  const [photos, setPhotos]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (field, value) => setForm(p => ({ ...p, [field]: value }));

  // toggle single product type
  const handleProductType = (val) => {
    setForm(p => ({ ...p, productType: p.productType === val ? "" : val }));
  };

  // toggle vehicle type in multi array
  const handleVehicleToggle = (val) => {
    setForm(p => ({
      ...p,
      vehicleTypes: p.vehicleTypes.includes(val)
        ? p.vehicleTypes.filter(v => v !== val)
        : [...p.vehicleTypes, val],
    }));
  };

  const handlePhotosChange = (e) => {
    setPhotos(Array.from(e.target.files || []).slice(0, 5));
  };

  const isValidCity = (city) => {
    if (!city || !city.trim()) return false;
    return algerianCities.some(c => c.toLowerCase() === city.toLowerCase().trim());
  };

  const handleSubmit = async () => {
    const isValid =
      form.productType &&
      form.vehicleTypes.length > 0 &&
      form.quantity &&
      form.weight &&
      form.volume &&
      form.price &&
      form.pickup &&
      form.delivery &&
      form.date &&
      form.time &&
      form.priority;

    if (!isValid) {
      toastError("Please fill in all fields, select a product type and at least one vehicle type.");
      return;
    }
    if (!isValidCity(form.pickup)) {
      toastError(`"${form.pickup}" is not a valid Algerian city. Please choose from the list.`);
      return;
    }
    if (!isValidCity(form.delivery)) {
      toastError(`"${form.delivery}" is not a valid Algerian city. Please choose from the list.`);
      return;
    }

    const volume   = Number(form.volume);
    const weight   = Number(form.weight);
    const price    = Number(form.price);
    const quantity = Number(form.quantity);

    if (
      !Number.isFinite(volume) || !Number.isFinite(weight) ||
      !Number.isFinite(price)  || !Number.isFinite(quantity) ||
      volume <= 0 || weight <= 0 || price <= 0 || quantity <= 0
    ) {
      toastError("Weight, volume, price and quantity must be positive numbers.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) { toastError("Please login first."); return; }

    try {
      setLoading(true); setSuccess(false);

      const photoData = photos[0] ? await uploadPhoto(photos[0]) : null;

      const vehiclePart = form.vehicleTypes.length > 0
        ? `Vehicles: ${form.vehicleTypes.join(", ")}`
        : "";
      const quantityPart = quantity > 0 ? `Quantity: ${quantity}` : "";
      const descPart     = form.description.trim();

      const special_Information = [vehiclePart, quantityPart, descPart]
        .filter(Boolean)
        .join(" | ") || null;

      const payload = {
        category:            form.productType,
        photo:               photoData,
        origin:              form.pickup.trim(),
        destination:         form.delivery.trim(),
        volume,
        weight,
        price,
        date:                form.date,
        time:                form.time,
        priority:            form.priority,
        special_Information,
      };

      const createdShipment = await createShipment(payload);

      setSuccess(true);
      toastSuccess("Shipment created", { description: "Your shipment is now available in the list." });
      setForm({
        productType: "", vehicleTypes: [], quantity: "",
        weight: "", volume: "", price: "",
        pickup: "", delivery: "", date: "", time: "", priority: "Normal", description: "",
      });
      setPhotos([]);

      const createdId = createdShipment?.shipment_ID ?? createdShipment?.id ?? createdShipment?._id;
      if (onCreated && createdId != null) onCreated(createdId);
    } catch (err) {
      toastError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-screen">
      <div className={`cs-container ${mounted ? "cs-container--visible" : ""}`}>

        {/* Header */}
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

          {/* ── Section: Shipment Info ── */}
          <div className="cs-section-header">
            <span className="cs-section-dot" />
            <span className="cs-section-label">SHIPMENT INFORMATION</span>
          </div>

          {/* Product Type */}
          <div className="cs-field">
            <label className="cs-label">
              Product Type
              <span className="cs-label-hint">Select one</span>
            </label>
            <ChipGrid
              options={CARGO_TYPES}
              selected={form.productType}
              onToggle={handleProductType}
              labelKey="product"
              subKey="vehicleFr"
              iconKey="icon"
              single={true}
            />
          </div>

          {/* Vehicle Type — multi select */}
          <div className="cs-field">
            <label className="cs-label">
              Possible Vehicles
              <span className="cs-label-hint">Select one or more</span>
            </label>
            <ChipGrid
              options={VEHICLE_TYPES}
              selected={form.vehicleTypes}
              onToggle={handleVehicleToggle}
              labelKey="vehicle"
              subKey="vehicleFr"
              iconKey="icon"
              single={false}
            />
            {form.vehicleTypes.length > 0 && (
              <div className="cs-selected-vehicles">
                {form.vehicleTypes.map(v => {
                  const found = VEHICLE_TYPES.find(vt => vt.vehicle === v);
                  return (
                    <span key={v} className="cs-vehicle-tag">
                      {found?.icon} {v}
                      <button
                        type="button"
                        className="cs-vehicle-tag-remove"
                        onClick={() => handleVehicleToggle(v)}
                      >×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="cs-field">
            <label className="cs-label">Quantity (units)</label>
            <div className="cs-input-suffix-wrap">
              <input
                className="cs-input"
                type="number"
                min="1"
                placeholder="0"
                value={form.quantity}
                onChange={e => handleChange("quantity", e.target.value)}
              />
              <span className="cs-suffix">PCS</span>
            </div>
          </div>

          {/* Weight + Volume */}
          <div className="cs-field-row">
            <div className="cs-field cs-field--half">
              <label className="cs-label">Weight (kg)</label>
              <div className="cs-input-suffix-wrap">
                <input
                  className="cs-input" type="number" placeholder="0.0"
                  value={form.weight} onChange={e => handleChange("weight", e.target.value)}
                />
                <span className="cs-suffix">KG</span>
              </div>
            </div>
            <div className="cs-field cs-field--half">
              <label className="cs-label">Volume (m³)</label>
              <div className="cs-input-suffix-wrap">
                <input
                  className="cs-input" type="number" placeholder="0.0"
                  value={form.volume} onChange={e => handleChange("volume", e.target.value)}
                />
                <span className="cs-suffix">M³</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="cs-field">
            <label className="cs-label">Price (DZD)</label>
            <div className="cs-input-suffix-wrap">
              <input
                className="cs-input" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.price} onChange={e => handleChange("price", e.target.value)}
              />
              <span className="cs-suffix">DZD</span>
            </div>
          </div>

          {/* Priority */}
          <div className="cs-field">
            <label className="cs-label">Priority</label>
            <div className="cs-select-wrap">
              <select className="cs-select" value={form.priority} onChange={e => handleChange("priority", e.target.value)}>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <svg className="cs-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Description */}
          <div className="cs-field">
            <label className="cs-label">Description / Special Information</label>
            <textarea
              className="cs-input cs-textarea" rows={3}
              placeholder="Any fragile notes, handling instructions, or extra details"
              value={form.description} onChange={e => handleChange("description", e.target.value)}
            />
          </div>

          {/* Photos */}
          <div className="cs-field">
            <label className="cs-label" htmlFor="cs-photos">Photos</label>
            <label className="cs-upload-box" htmlFor="cs-photos">
              <span className="cs-upload-main">Upload photos</span>
            </label>
            <input
              id="cs-photos" className="cs-file-input"
              type="file" accept="image/*" multiple
              onChange={handlePhotosChange}
            />
            {photos.length > 0 && (
              <p className="cs-upload-selected">{photos.length} photo(s) selected</p>
            )}
          </div>

          {/* ── Section: Logistics & Schedule ── */}
          <div className="cs-section-header">
            <span className="cs-section-dot" />
            <span className="cs-section-label">LOGISTICS & SCHEDULE</span>
          </div>

          <div className="cs-field">
            <label className="cs-label">Pickup Location</label>
            <CityAutocomplete
              value={form.pickup}
              onChange={v => handleChange("pickup", v)}
              placeholder="Source address"
            />
          </div>

          <div className="cs-field">
            <label className="cs-label">Delivery Location</label>
            <CityAutocomplete
              value={form.delivery}
              onChange={v => handleChange("delivery", v)}
              placeholder="Destination address"
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
                <input className="cs-schedule-input" type="date" value={form.date} onChange={e => handleChange("date", e.target.value)} />
              </div>
              <div className="cs-schedule-field">
                <label className="cs-schedule-label">TIME</label>
                <input className="cs-schedule-input" type="time" value={form.time} onChange={e => handleChange("time", e.target.value)} />
              </div>
            </div>
          </div>

        </div>

        <div className="cs-footer">
          {success && <div className="cs-feedback cs-feedback--success">Shipment posted successfully!</div>}
          <button className="cs-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting…" : "Post Shipment"}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}