import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Bell, Home, Truck, Navigation, User, Plus, SlidersHorizontal,
  MapPin, X, ChevronUp, ChevronDown, Tag, Weight, Package,
  CheckCircle2, Clock, Search, ArrowUpDown,
  DollarSign, CalendarDays, Layers, Milestone,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import logoSvg from "./photo/Logo.svg";
import "./Shipments.css";
import { getShipments } from "./services/shipmentService";
import { toastError } from "./services/toastService";
import { resolveMediaUrl } from "./utils/media";

// ─── Algerian Cities ───────────────────────────────────────────────────────────
const algerianCities = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt",
  "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma",
  "Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar",
  "Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet",
  "El M'Ghair","El Menia",
];

// ─── Logistics Mapping ────────────────────────────────────────────────────────
const CARGO_TYPES = [
  { product: "Small Parcels",           vehicle: "Small Van",          vehicleFr: "Camionnette",       icon: "📦" },
  { product: "Furniture",               vehicle: "Fourgon",            vehicleFr: "Fourgon",           icon: "🛋️" },
  { product: "Electronics / Fragile",  vehicle: "Closed Box Van",     vehicleFr: "Fourgon Fermé",     icon: "📺" },
  { product: "Perishables / Food",     vehicle: "Refrigerated Truck",  vehicleFr: "Frigo",             icon: "🧊" },
  { product: "Agricultural Products",  vehicle: "Open-Slat Truck",    vehicleFr: "Maraîcher",         icon: "🌾" },
  { product: "Construction Materials", vehicle: "Dropside Truck",     vehicleFr: "Camion à ridelles", icon: "🏗️" },
  { product: "Industrial / Bulk",      vehicle: "Semi-trailer",       vehicleFr: "Semi-remorque",     icon: "🏭" },
  { product: "Liquids & Chemicals",    vehicle: "Tanker",             vehicleFr: "Citerne",           icon: "🛢️" },
  { product: "Livestock",              vehicle: "Livestock Carrier",  vehicleFr: "Camion à Bétail",   icon: "🐄" },
  { product: "Towing & Recovery",      vehicle: "Tow Truck",          vehicleFr: "Dépanneuse",        icon: "🔧" },
];

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

const SORT_FIELDS = [
  { value: "price",        label: "Price",        Icon: DollarSign },
  { value: "createdAt",    label: "Date Created", Icon: CalendarDays },
  { value: "shippingDate", label: "Ship Date",    Icon: CalendarDays },
  { value: "quantity",     label: "Quantity",     Icon: Layers },
  { value: "size",         label: "Size",         Icon: Package },
];

const MAX_PRICE_LIMIT = 500000;

// ─── Parsers ──────────────────────────────────────────────────────────────────
const parsePriceValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.replace(/,/g, ".").match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDateInput = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const y = Number(isoMatch[1]), m = Number(isoMatch[2]), d = Number(isoMatch[3]);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
    return null;
  }
  const dmyMatch = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!dmyMatch) return null;
  const d = Number(dmyMatch[1]), m = Number(dmyMatch[2]), y = Number(dmyMatch[3]);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
};

const parseItemDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  if (typeof value === "string") { const p = parseDateInput(value); if (p) return p.getTime(); }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

const formatCreatedAt = (createdAt) => {
  if (!createdAt) return "Recently";
  try {
    const date = new Date(createdAt);
    const diffDays = Math.floor((Date.now() - date) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  } catch { return "Recently"; }
};

// ─── Initial State ────────────────────────────────────────────────────────────
const INITIAL_FILTERS = {
  origins: [], destinations: [], waypoints: [],
  productTypes: [], vehicleTypes: [],
  status: "",
  priceMin: 0, priceMax: MAX_PRICE_LIMIT,
  minQuantity: "", maxQuantity: "",
  minWeight: "", maxWeight: "",
  minSize: "", maxSize: "",
  afterDate: "", beforeDate: "",
};
const INITIAL_SORT = { field: "createdAt", dir: "desc" };

// ─── Beautiful Dual Range Slider ──────────────────────────────────────────────
const DualRangeSlider = ({ min, max, valueMin, valueMax, onChange }) => {
  const pct      = (v) => ((v - min) / (max - min)) * 100;
  const leftPct  = pct(valueMin);
  const rightPct = pct(valueMax);

  const handleMin = (e) => {
    const val = Math.min(Number(e.target.value), valueMax - 500);
    onChange(Math.max(min, val), valueMax);
  };
  const handleMax = (e) => {
    const val = Math.max(Number(e.target.value), valueMin + 500);
    onChange(valueMin, Math.min(max, val));
  };

  const fmtShort = (v) =>
    v >= MAX_PRICE_LIMIT ? "∞" : v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : String(v);
  const fmtFull = (v) =>
    v >= MAX_PRICE_LIMIT ? "No limit" : `${v.toLocaleString("fr-DZ")} DA`;

  return (
    <div className="sh-price-slider">
      <div className="sh-price-bubbles">
        <div className="sh-price-bubble">
          <DollarSign size={10} />
          <span>{fmtFull(valueMin)}</span>
        </div>
        <ArrowUpDown size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
        <div className="sh-price-bubble sh-price-bubble--max">
          <DollarSign size={10} />
          <span>{fmtFull(valueMax)}</span>
        </div>
      </div>
      <div className="sh-slider-track-wrap">
        <div className="sh-slider-rail" />
        <div
          className="sh-slider-fill"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        <div className="sh-thumb-label sh-thumb-label--left" style={{ left: `${leftPct}%` }}>
          {fmtShort(valueMin)}
        </div>
        <div className="sh-thumb-label sh-thumb-label--right" style={{ left: `${rightPct}%` }}>
          {fmtShort(valueMax)}
        </div>
        <input
          type="range" min={min} max={max} step={500} value={valueMin}
          onChange={handleMin}
          className="sh-slider-input sh-slider-input--left"
        />
        <input
          type="range" min={min} max={max} step={500} value={valueMax}
          onChange={handleMax}
          className="sh-slider-input sh-slider-input--right"
        />
      </div>
      <div className="sh-slider-rail-labels">
        <span>0 DA</span>
        <span>500 000+ DA</span>
      </div>
    </div>
  );
};

// ─── City Autocomplete Input ──────────────────────────────────────────────────
const CityAutocomplete = ({ placeholder, onSelect }) => {
  const [val, setVal]          = useState("");
  const [suggestions, setSugg] = useState([]);
  const [show, setShow]        = useState(false);
  const [selIdx, setSelIdx]    = useState(-1);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleChange = (e) => {
    const v = e.target.value; setVal(v); setSelIdx(-1);
    if (v.length > 0) {
      setSugg(algerianCities.filter((c) => c.toLowerCase().includes(v.toLowerCase())).slice(0, 8));
      setShow(true);
    } else { setSugg([]); setShow(false); }
  };

  const handleSelect = (city) => {
    onSelect(city); setVal(""); setSugg([]); setShow(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!show || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelIdx((p) => (p + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelIdx((p) => (p - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" && selIdx >= 0) { e.preventDefault(); handleSelect(suggestions[selIdx]); }
    else if (e.key === "Escape") setShow(false);
  };

  return (
    <div className="sh-city-autocomplete" ref={wrapRef}>
      <div className="sh-city-input-wrap">
        <Search size={14} className="sh-city-input-icon" />
        <input
          ref={inputRef} type="text" value={val}
          placeholder={placeholder}
          onChange={handleChange} onKeyDown={handleKeyDown}
          onFocus={() => val.length > 0 && setShow(true)}
          autoComplete="off" className="sh-city-input"
        />
        {val && (
          <button className="sh-city-clear" type="button" onClick={() => { setVal(""); setSugg([]); setShow(false); }}>
            <X size={13} />
          </button>
        )}
      </div>
      {show && suggestions.length > 0 && (
        <ul className="sh-city-dropdown">
          {suggestions.map((city, i) => (
            <li
              key={city}
              className={`sh-city-option${i === selIdx ? " selected" : ""}`}
              onClick={() => handleSelect(city)}
            >
              <MapPin size={12} className="sh-city-pin" />
              <span>{city}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Location Chip ────────────────────────────────────────────────────────────
const CHIP_STYLES = {
  origin:      { bg: "rgba(34,197,94,0.13)",  border: "rgba(34,197,94,0.4)",  color: "#16a34a", glow: "rgba(34,197,94,0.2)"  },
  destination: { bg: "rgba(99,102,241,0.13)", border: "rgba(99,102,241,0.4)", color: "#6366f1", glow: "rgba(99,102,241,0.2)" },
  waypoint:    { bg: "rgba(245,158,11,0.13)", border: "rgba(245,158,11,0.4)", color: "#d97706", glow: "rgba(245,158,11,0.2)" },
};

const LocationChip = ({ label, type, onRemove }) => {
  const s = CHIP_STYLES[type] || CHIP_STYLES.origin;
  return (
    <span
      className="sh-loc-chip"
      style={{ background: s.bg, borderColor: s.border, boxShadow: `0 2px 8px ${s.glow}` }}
    >
      <MapPin size={11} style={{ color: s.color, flexShrink: 0 }} />
      <span className="sh-loc-chip-label" style={{ color: s.color }}>{label}</span>
      <button className="sh-loc-chip-remove" style={{ color: s.color }} onClick={onRemove} type="button">
        <X size={10} />
      </button>
    </span>
  );
};

// ─── Multi City Selector ──────────────────────────────────────────────────────
const MultiCitySelector = ({ label, selected, onAdd, onRemove, type }) => (
  <div className="shipments-filter-group">
    <label className="shipments-filter-label">{label}</label>
    <CityAutocomplete
      placeholder="Search and add a city…"
      onSelect={(city) => { if (!selected.includes(city)) onAdd(city); }}
    />
    {selected.length > 0 && (
      <div className="sh-loc-chips-row">
        {selected.map((c) => (
          <LocationChip key={c} label={c} type={type} onRemove={() => onRemove(c)} />
        ))}
      </div>
    )}
  </div>
);

// ─── Main Shipments Component ─────────────────────────────────────────────────
export default function Shipments({ onNavigate, onBack, refreshKey = 0, hasUnreadNotifications = false }) {
  const [activeTab,       setActiveTab]       = useState("all");
  const [activeNav,       setActiveNav]       = useState("shipments");
  const [shipments,       setShipments]       = useState([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [error,           setError]           = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters,         setFilters]         = useState(INITIAL_FILTERS);
  const [sort,            setSort]            = useState(INITIAL_SORT);

  useEffect(() => { if (error) toastError(error); }, [error]);

  useEffect(() => {
    let isMounted = true;
    const storedUser   = JSON.parse(localStorage.getItem("user") || "{}");
    const fallbackName = storedUser?.full_Name || storedUser?.business_Name || storedUser?.name;

    const normalizeShipment = (item, index) => {
      const routeParts = String(item?.route || item?.routeName || "").split(/->|→|-/).map((p) => p.trim());
      return {
        id:              item?.shipment_ID || item?.id || item?._id || `${index}`,
        ownerId:         item?.user?.id || null,
        ownerPhoto:      item?.user?.profile_Photo || "",
        name:            item?.user?.individual?.full_Name || item?.user?.business?.business_Name || fallbackName,
        time:            item?.createdAtLabel || formatCreatedAt(item?.createdAt),
        createdAtValue:  parseItemDateValue(item?.createdAt),
        price:           item?.priceLabel || (item?.price != null ? `${item.price} DA` : "Price not specified"),
        priceValue:      parsePriceValue(item?.price ?? item?.priceLabel),
        origin:          item?.origin || item?.pickupAddress || routeParts[0] || "Origin not specified",
        destination:     item?.destination || item?.dropoffAddress || routeParts[1] || "Destination not specified",
        waypoints:       Array.isArray(item?.waypoints) ? item.waypoints : [],
        productType:     item?.productType || item?.category || item?.cargoType || "",
        vehicleType:     item?.vehicleType || "",
        weight:          item?.weightLabel || (item?.weight != null ? `${item.weight}${item?.weightUnit ? ` ${item.weightUnit}` : " kg"}` : ""),
        weightValue:     parsePriceValue(item?.weight),
        quantity:        item?.quantity != null ? Number(item.quantity) : null,
        size:            item?.size     != null ? Number(item.size)     : null,
        date:            item?.date || item?.pickupDate || "",
        dateValue:       parseItemDateValue(item?.date || item?.pickupDate),
        status:          String(item?.status || "active").toLowerCase(),
        specialInformation: item?.special_Information || "",
      };
    };

    const fetchShipments = async () => {
      setIsLoading(true); setError("");
      try {
        const token = localStorage.getItem("token");
        const list  = await getShipments(token);
        if (!isMounted) return;
        setShipments(list.map(normalizeShipment));
      } catch {
        if (!isMounted) return;
        setError("Could not load shipments right now.");
        setShipments([]);
      } finally { if (isMounted) setIsLoading(false); }
    };
    fetchShipments();
    return () => { isMounted = false; };
  }, [refreshKey]);

  const processedShipments = useMemo(() => {
    let list = [...shipments];
    if (activeTab !== "all") list = list.filter((s) => s.status === activeTab);
    if (filters.status)      list = list.filter((s) => s.status === filters.status);

    if (filters.origins.length > 0)
      list = list.filter((s) => filters.origins.some((o) => s.origin?.toLowerCase().includes(o.toLowerCase())));
    if (filters.destinations.length > 0)
      list = list.filter((s) => filters.destinations.some((d) => s.destination?.toLowerCase().includes(d.toLowerCase())));
    if (filters.waypoints.length > 0)
      list = list.filter((s) =>
        filters.waypoints.some((w) =>
          s.waypoints?.some((sw) => sw.toLowerCase().includes(w.toLowerCase())) ||
          s.origin?.toLowerCase().includes(w.toLowerCase()) ||
          s.destination?.toLowerCase().includes(w.toLowerCase())
        )
      );
    if (filters.productTypes.length > 0)
      list = list.filter((s) => filters.productTypes.some((pt) => s.productType?.toLowerCase().includes(pt.toLowerCase())));
    if (filters.vehicleTypes.length > 0)
      list = list.filter((s) => filters.vehicleTypes.some((vt) => s.vehicleType?.toLowerCase().includes(vt.toLowerCase())));

    if (filters.priceMin > 0)               list = list.filter((s) => s.priceValue == null || s.priceValue >= filters.priceMin);
    if (filters.priceMax < MAX_PRICE_LIMIT) list = list.filter((s) => s.priceValue == null || s.priceValue <= filters.priceMax);
    if (filters.minQuantity !== "") list = list.filter((s) => s.quantity    == null || s.quantity    >= Number(filters.minQuantity));
    if (filters.maxQuantity !== "") list = list.filter((s) => s.quantity    == null || s.quantity    <= Number(filters.maxQuantity));
    if (filters.minWeight   !== "") list = list.filter((s) => s.weightValue == null || s.weightValue >= Number(filters.minWeight));
    if (filters.maxWeight   !== "") list = list.filter((s) => s.weightValue == null || s.weightValue <= Number(filters.maxWeight));
    if (filters.minSize     !== "") list = list.filter((s) => s.size        == null || s.size        >= Number(filters.minSize));
    if (filters.maxSize     !== "") list = list.filter((s) => s.size        == null || s.size        <= Number(filters.maxSize));

    const afterMs  = filters.afterDate  ? new Date(filters.afterDate  + "T00:00:00").getTime() : null;
    const beforeMs = filters.beforeDate ? new Date(filters.beforeDate + "T23:59:59").getTime() : null;
    if (afterMs  != null) list = list.filter((s) => s.dateValue == null || s.dateValue >= afterMs);
    if (beforeMs != null) list = list.filter((s) => s.dateValue == null || s.dateValue <= beforeMs);

    const dir = sort.dir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let va, vb;
      switch (sort.field) {
        case "price":        va = a.priceValue     ?? -Infinity; vb = b.priceValue     ?? -Infinity; break;
        case "createdAt":    va = a.createdAtValue ?? 0;         vb = b.createdAtValue ?? 0;         break;
        case "shippingDate": va = a.dateValue      ?? 0;         vb = b.dateValue      ?? 0;         break;
        case "quantity":     va = a.quantity        ?? -Infinity; vb = b.quantity        ?? -Infinity; break;
        case "size":         va = a.size            ?? -Infinity; vb = b.size            ?? -Infinity; break;
        default: return 0;
      }
      return va < vb ? -dir : va > vb ? dir : 0;
    });
    return list;
  }, [shipments, filters, sort, activeTab]);

  const toggleArray   = useCallback((key, val) =>
    setFilters((p) => ({ ...p, [key]: p[key].includes(val) ? p[key].filter((v) => v !== val) : [...p[key], val] })), []);
  const addToArray    = useCallback((key, val) =>
    setFilters((p) => ({ ...p, [key]: p[key].includes(val) ? p[key] : [...p[key], val] })), []);
  const removeFromArr = useCallback((key, val) =>
    setFilters((p) => ({ ...p, [key]: p[key].filter((v) => v !== val) })), []);
  const clearFilters  = () => setFilters(INITIAL_FILTERS);

  const hasActiveFilters = useMemo(() => (
    filters.origins.length > 0 || filters.destinations.length > 0 || filters.waypoints.length > 0 ||
    filters.productTypes.length > 0 || filters.vehicleTypes.length > 0 || filters.status ||
    filters.priceMin > 0 || filters.priceMax < MAX_PRICE_LIMIT ||
    filters.minQuantity || filters.maxQuantity || filters.minWeight ||
    filters.maxWeight || filters.minSize || filters.maxSize ||
    filters.afterDate || filters.beforeDate
  ), [filters]);

  const handleNav     = (tab) => {
    setActiveNav(tab);
    if (tab === "home")    onNavigate("dashboard");
    if (tab === "routes")  onNavigate("routes");
    if (tab === "profile") onNavigate("profile");
  };
  const toggleSortDir = () => setSort((s) => ({ ...s, dir: s.dir === "asc" ? "desc" : "asc" }));
  const ActiveSortIcon = SORT_FIELDS.find((f) => f.value === sort.field)?.Icon || ArrowUpDown;

  return (
    <div className="sh-screen">
      <div className="sh-container">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="sh-header">
          <div className="sh-logo-row">
            <div className="sh-logo-box">
              <img src={logoSvg} alt="Wesselli logo" className="sh-logo-mark" />
            </div>
            <span className="sh-brand">WESSELLI</span>
          </div>
          <div className="sh-header-icons">
            <button className="sh-icon-btn sh-bell" onClick={() => onNavigate("notifications")}>
              <Bell size={20} />
              {hasUnreadNotifications && <span className="sh-notif-dot" />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="sh-body">
          {/* Tabs */}
          <div className="sh-tabs">
            {[{key:"all",label:"All Shipments"},{key:"active",label:"Active"},{key:"pending",label:"Pending"}].map(({key,label}) => (
              <button key={key} className={`sh-tab${activeTab===key?" sh-tab--active":""}`} onClick={() => setActiveTab(key)}>
                {label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="sh-cta-card">
            <h3 className="sh-cta-title">Have something to ship?</h3>
            <p className="sh-cta-sub">Create a new request and reach thousands of shippers nearby.</p>
            <button className="sh-cta-btn" onClick={() => onNavigate("createShipment")}>
              <Plus size={17} /> Create Post
            </button>
          </div>

          {/* Section row */}
          <div className="sh-section-row">
            <h2 className="sh-section-title">Explore Shipments</h2>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div className="sh-sort-row">
                <ActiveSortIcon size={12} style={{ color:"#22c55e" }} />
                <select className="sh-sort-select" value={sort.field} onChange={(e) => setSort((s) => ({...s, field:e.target.value}))}>
                  {SORT_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <button className="sh-sort-dir-btn" onClick={toggleSortDir}>
                  {sort.dir==="asc" ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                </button>
              </div>
              <button className="sh-filter-btn" onClick={() => setShowFilterModal(true)}>
                <SlidersHorizontal size={13} />
                Filter
                {hasActiveFilters && <span className="shipments-filter-active-dot" />}
              </button>
            </div>
          </div>

          {/* Count */}
          {!isLoading && !error && (
            <p className="sh-results-count">
              <Package size={11} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
              {processedShipments.length} shipment{processedShipments.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Cards */}
          {isLoading ? (
            <div className="sh-empty-state">
              <Truck size={32} style={{color:"#22c55e",marginBottom:10}} />
              Loading shipments…
            </div>
          ) : error ? (
            <div className="sh-empty-state">{error}</div>
          ) : processedShipments.length === 0 ? (
            <div className="sh-empty-state">
              <Package size={32} style={{color:"#9ca3af",marginBottom:10}} />
              Nothing to explore right now.
            </div>
          ) : processedShipments.map((s) => (
            <div key={s.id} className="sh-card" onClick={() => onNavigate("shipmentDetails", { shipmentId: s.id })}>

              {/* Top row */}
              <div className="sh-card-top">
                <button
                  className="sh-avatar" type="button"
                  onClick={(e) => { e.stopPropagation(); if (s.ownerId) onNavigate("publicProfile",{userId:s.ownerId,from:"shipments"}); }}
                >
                  {s.ownerPhoto
                    ? <img src={resolveMediaUrl(s.ownerPhoto)} alt={s.name} style={{width:38,height:38,borderRadius:"50%",objectFit:"cover"}} />
                    : <User size={18} color="#9ca3af" />
                  }
                </button>
                <div className="sh-card-info">
                  <button type="button" className="sh-card-name"
                    style={{background:"none",border:"none",padding:0,textAlign:"left",cursor:s.ownerId?"pointer":"default"}}
                    onClick={(e) => { e.stopPropagation(); if (s.ownerId) onNavigate("publicProfile",{userId:s.ownerId,from:"shipments"}); }}
                  >{s.name}</button>
                  <span className="sh-card-time">
                    <Clock size={11} style={{display:"inline",marginRight:3,verticalAlign:"middle"}} />
                    {s.time}
                  </span>
                </div>
                <div className="sh-price-badge">
                  <span className="sh-price-badge-currency">DA</span>
                  <span className="sh-price-badge-amount">
                    {s.priceValue != null ? s.priceValue.toLocaleString("fr-DZ") : "—"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="sh-card-description">{s.specialInformation || "No description provided."}</p>

              {/* Route Timeline */}
              <div className="sh-route-timeline">
                <div className="sh-rt-stop">
                  <div className="sh-rt-left">
                    <div className="sh-rt-dot sh-rt-dot--origin">
                      <MapPin size={9} />
                    </div>
                    <div className="sh-rt-line sh-rt-line--green" />
                  </div>
                  <div className="sh-rt-content">
                    <span className="sh-rt-label">FROM</span>
                    <span className="sh-rt-value">{s.origin}</span>
                  </div>
                </div>
                {s.waypoints?.map((wp, i) => (
                  <div key={i} className="sh-rt-stop">
                    <div className="sh-rt-left">
                      <div className="sh-rt-dot sh-rt-dot--way">
                        <Milestone size={8} />
                      </div>
                      <div className="sh-rt-line sh-rt-line--amber" />
                    </div>
                    <div className="sh-rt-content">
                      <span className="sh-rt-label">STOP {i+1}</span>
                      <span className="sh-rt-value">{wp}</span>
                    </div>
                  </div>
                ))}
                <div className="sh-rt-stop">
                  <div className="sh-rt-left">
                    <div className="sh-rt-dot sh-rt-dot--dest">
                      <Navigation size={9} />
                    </div>
                  </div>
                  <div className="sh-rt-content">
                    <span className="sh-rt-label">TO</span>
                    <span className="sh-rt-value">{s.destination}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sh-card-footer">
                <div className="sh-card-tags">
                  {s.productType && (
                    <span className="sh-tag">
                      <Tag size={11} />
                      {CARGO_TYPES.find((c) => c.product === s.productType)?.icon || ""} {s.productType}
                    </span>
                  )}
                  {s.weight && <span className="sh-tag"><Weight size={11} />{s.weight}</span>}
                  {s.quantity != null && <span className="sh-tag"><Layers size={11}/>{s.quantity}</span>}
                  {s.date && <span className="sh-tag"><CalendarDays size={11}/>{s.date}</span>}
                  <span className={`sh-status-badge sh-status-badge--${s.status}`}>
                    {s.status === "active" ? <CheckCircle2 size={10}/> : <Clock size={10}/>}
                    {s.status.toUpperCase()}
                  </span>
                </div>
                <div className="sh-card-actions">
                  {s.ownerId && (
                    <button className="sh-action-btn" onClick={(e) => { e.stopPropagation(); onNavigate("publicProfile",{userId:s.ownerId,from:"shipments"}); }}>
                      <User size={12} /> Profile
                    </button>
                  )}
                  <button className="sh-action-btn sh-action-btn--primary" onClick={(e) => { e.stopPropagation(); onNavigate("shipmentDetails",{shipmentId:s.id}); }}>
                    Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAB */}
        <button className="sh-fab" onClick={() => onNavigate("createShipment")}>
          <Plus size={24} color="white" />
        </button>

        {/* Bottom Nav */}
        <div className="sh-bottom-nav">
          {[
            { key:"home",      label:"HOME",      Icon:Home },
            { key:"shipments", label:"SHIPMENTS", Icon:Truck },
            { key:"routes",    label:"ROUTES",    Icon:Navigation },
            { key:"profile",   label:"PROFILE",   Icon:User },
          ].map(({key, label, Icon}) => (
            <button key={key} className={`sh-nav-item${activeNav===key?" sh-nav-item--active":""}`} onClick={() => handleNav(key)}>
              <Icon size={22} color={activeNav===key?"#22c55e":"#9ca3af"} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Modal ─────────────────────────────────────────────────────── */}
      {showFilterModal && (
        <div className="shipments-filter-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="shipments-filter-modal" onClick={(e) => e.stopPropagation()}>

            <div className="shipments-filter-header">
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <SlidersHorizontal size={18} style={{color:"#22c55e"}} />
                <h3 className="shipments-filter-title">Filter Shipments</h3>
              </div>
              <button className="shipments-filter-close" onClick={() => setShowFilterModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="shipments-filter-body">

              {/* Status */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">Status</label>
                <div className="shipments-status-options">
                  {[{value:"",label:"All",Icon:Package},{value:"active",label:"Active",Icon:CheckCircle2},{value:"pending",label:"Pending",Icon:Clock}].map(({value,label,Icon:Ic}) => (
                    <button key={value}
                      className={`shipments-status-btn${filters.status===value?" active":""}`}
                      onClick={() => setFilters((p) => ({...p, status:value}))}
                    >
                      <Ic size={13} />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">
                  <DollarSign size={13} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
                  Price Range
                </label>
                <DualRangeSlider
                  min={0} max={MAX_PRICE_LIMIT}
                  valueMin={filters.priceMin} valueMax={filters.priceMax}
                  onChange={(mn,mx) => setFilters((p) => ({...p, priceMin:mn, priceMax:mx}))}
                />
              </div>

              {/* Origins */}
              <MultiCitySelector label="Origin Cities" selected={filters.origins}
                onAdd={(c) => addToArray("origins",c)} onRemove={(c) => removeFromArr("origins",c)} type="origin" />

              {/* Destinations */}
              <MultiCitySelector label="Destination Cities" selected={filters.destinations}
                onAdd={(c) => addToArray("destinations",c)} onRemove={(c) => removeFromArr("destinations",c)} type="destination" />

              {/* Waypoints */}
              <MultiCitySelector label="Waypoints / Stops" selected={filters.waypoints}
                onAdd={(c) => addToArray("waypoints",c)} onRemove={(c) => removeFromArr("waypoints",c)} type="waypoint" />

              {/* Vehicle types available */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">
                  <Truck size={13} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
                  Available Vehicles
                </label>
                <div className="sh-category-grid">
                  {VEHICLE_TYPES.map((opt) => (
                    <button
                      key={opt.vehicle}
                      type="button"
                      className={`sh-cat-chip${filters.vehicleTypes.includes(opt.vehicle) ? " active" : ""}`}
                      onClick={() => toggleArray("vehicleTypes", opt.vehicle)}
                    >
                      <span className="sh-cat-icon">{opt.icon}</span>
                      <span className="sh-cat-label">{opt.vehicleFr}</span>
                      <span className="sh-cat-sub">{opt.vehicle}</span>
                      {filters.vehicleTypes.includes(opt.vehicle) && <CheckCircle2 size={11} className="sh-cat-check" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Category (merged cargo + vehicle) ── */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">
                  <Tag size={13} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
                  Category
                </label>
                <div className="sh-category-grid">
                  {CARGO_TYPES.map((opt) => {
                    const activeCargo   = filters.productTypes.includes(opt.product);
                    const activeVehicle = filters.vehicleTypes.includes(opt.vehicle);
                    const active        = activeCargo || activeVehicle;
                    return (
                      <button
                        key={opt.product}
                        type="button"
                        className={`sh-cat-chip${active ? " active" : ""}`}
                        onClick={() => {
                          toggleArray("productTypes", opt.product);
                          toggleArray("vehicleTypes", opt.vehicle);
                        }}
                      >
                        <span className="sh-cat-icon">{opt.icon}</span>
                        <span className="sh-cat-label">{opt.product}</span>
                        <span className="sh-cat-sub">{opt.vehicleFr}</span>
                        {active && <CheckCircle2 size={11} className="sh-cat-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">
                  <Layers size={13} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
                  Quantity (units)
                </label>
                <div className="sh-range-inputs">
                  <input type="number" min="0" className="shipments-filter-input" placeholder="Min"
                    value={filters.minQuantity} onChange={(e) => setFilters((p) => ({...p,minQuantity:e.target.value}))} />
                  <span className="sh-range-sep">–</span>
                  <input type="number" min="0" className="shipments-filter-input" placeholder="Max"
                    value={filters.maxQuantity} onChange={(e) => setFilters((p) => ({...p,maxQuantity:e.target.value}))} />
                </div>
              </div>

              {/* Weight */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">
                  <Weight size={13} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
                  Weight (kg)
                </label>
                <div className="sh-range-inputs">
                  <input type="number" min="0" className="shipments-filter-input" placeholder="Min"
                    value={filters.minWeight} onChange={(e) => setFilters((p) => ({...p,minWeight:e.target.value}))} />
                  <span className="sh-range-sep">–</span>
                  <input type="number" min="0" className="shipments-filter-input" placeholder="Max"
                    value={filters.maxWeight} onChange={(e) => setFilters((p) => ({...p,maxWeight:e.target.value}))} />
                </div>
              </div>

              {/* Size */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">
                  <Package size={13} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
                  Size (m³)
                </label>
                <div className="sh-range-inputs">
                  <input type="number" min="0" className="shipments-filter-input" placeholder="Min"
                    value={filters.minSize} onChange={(e) => setFilters((p) => ({...p,minSize:e.target.value}))} />
                  <span className="sh-range-sep">–</span>
                  <input type="number" min="0" className="shipments-filter-input" placeholder="Max"
                    value={filters.maxSize} onChange={(e) => setFilters((p) => ({...p,maxSize:e.target.value}))} />
                </div>
              </div>

              {/* Date range */}
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">
                  <CalendarDays size={13} style={{display:"inline",marginRight:4,verticalAlign:"middle"}} />
                  Shipping Date Range
                </label>
                <div className="sh-date-range">
                  <div className="sh-date-field">
                    <span className="shipments-date-field-label">After</span>
                    <input type="date" className="shipments-filter-input" value={filters.afterDate}
                      onChange={(e) => setFilters((p) => ({...p,afterDate:e.target.value}))} />
                  </div>
                  <div className="sh-date-field">
                    <span className="shipments-date-field-label">Before</span>
                    <input type="date" className="shipments-filter-input" value={filters.beforeDate}
                      onChange={(e) => setFilters((p) => ({...p,beforeDate:e.target.value}))} />
                  </div>
                </div>
              </div>

            </div>

            <div className="shipments-filter-footer">
              <button className="shipments-filter-clear" onClick={clearFilters}>
                <X size={14} /> Clear All
              </button>
              <button className="shipments-filter-apply" onClick={() => setShowFilterModal(false)}>
                <CheckCircle2 size={14} /> Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}