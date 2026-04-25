import React, { useEffect, useMemo, useState, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import logoSvg from "./photo/Logo.svg";
import "./Routes.css";
import { getRoutes } from "./services/routeService";
import { toastError } from "./services/toastService";
import { resolveMediaUrl } from "./utils/media";

const algerianCities = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
  "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam",
  "Touggourt", "Djanet", "El M'Ghair", "El Menia"
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

const SORT_OPTIONS = [
  { value: "price",    label: "Price" },
  { value: "created",  label: "Date created" },
  { value: "shipment", label: "Shipment date" },
  { value: "shipping", label: "Shipping date" },
];

// ─── CityAutocomplete ────────────────────────────────────────────────────────

const CityAutocomplete = ({ onSelect, placeholder, excludes = [] }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    if (newValue.length > 0) {
      const filtered = algerianCities
        .filter((city) => city.toLowerCase().includes(newValue.toLowerCase()) && !excludes.includes(city));
      setSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCity = (city) => {
    onSelect(city);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
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
    <div className="routes-filter-autocomplete" ref={wrapperRef}>
      <div className="routes-city-search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="routes-city-search-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="routes-filter-suggestions">
          {suggestions.map((city, index) => (
            <li
              key={city}
              className={`routes-filter-suggestion-item ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSelectCity(city)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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

// ─── Icons ───────────────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TruckIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5.5" cy="18.5" r="2.5" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" />
  </svg>
);

const RouteIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeStatus = (status) => {
  const raw = String(status || "").toLowerCase().trim();
  if (raw.includes("pending")) return "pending";
  if (raw.includes("completed")) return "completed";
  return "active";
};

const parseDateInput = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day)
      return date;
    return null;
  }

  const dmyMatch = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!dmyMatch) return null;

  const day = Number(dmyMatch[1]);
  const month = Number(dmyMatch[2]);
  const year = Number(dmyMatch[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    return null;

  return date;
};

const parseItemDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  if (typeof value === "string") {
    const parsed = parseDateInput(value);
    if (parsed) return parsed.getTime();
  }
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.getTime();
  return null;
};

const DEFAULT_FILTERS = {
  origins: [],
  destinations: [],
  waypoints: [],
  region: "",
  status: "",
  afterDate: "",
  beforeDate: "",
  vehicleTypes: [],
  capacityMin: "",
  capacityMax: "",
  sortBy: "created",
  sortDir: "desc",
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function RoutesScreen({ onNavigate, hasUnreadNotifications = false }) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeNav, setActiveNav] = useState("routes");
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  useEffect(() => {
    if (!error) return;
    toastError(error);
  }, [error]);

  useEffect(() => {
    let isMounted = true;

    const formatCreatedAt = (createdAt) => {
      if (!createdAt) return "No date";
      try {
        const date = new Date(createdAt);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
      } catch {
        return "No date";
      }
    };

    const normalizeRoute = (item, index) => ({
      id: item?.route_ID || item?.id || `${index}-${item?.date || "route"}`,
      ownerId: item?.user?.id || null,
      ownerPhoto: item?.user?.profile_Photo || "",
      userName:
        item?.user?.individual?.full_Name ||
        item?.user?.business?.business_Name ||
        (item?.user?.email ? String(item.user.email).split("@")[0] : "Unknown user"),
      name: item?.name || item?.route_Name || "Route",
      time:
        item?.date_type === "INTERVAL"
          ? `${item?.interval_start || "-"} to ${item?.interval_end || "-"}`
          : item?.date || item?.createdAtLabel || formatCreatedAt(item?.createdAt),
      dateValue: parseItemDateValue(item?.date || item?.interval_start || item?.createdAt),
      createdAtValue: parseItemDateValue(item?.createdAt),
      shipmentDateValue: parseItemDateValue(item?.shipment_date || item?.shipmentDate),
      shippingDateValue: parseItemDateValue(item?.shipping_date || item?.shippingDate),
      price: item?.priceLabel || (item?.price != null ? `${item.price} DA` : ""),
      priceRaw: item?.price ?? null,
      postType: item?.post_type || "ORIGIN_DESTINATION",
      origin: item?.origin || "",
      destination: item?.destination || "",
      region: item?.region || "",
      capacity: item?.vehicle?.capacity ?? item?.capacity ?? item?.weight ?? null,
      vehicleName: item?.vehicle?.vehicle_Name || "Unknown vehicle",
      vehiclePlate: item?.vehicle?.plate_Number != null ? String(item.vehicle.plate_Number) : "-",
      vehicleColor: item?.vehicle?.color || "No color",
      vehicleYear: item?.vehicle?.year || "No year",
      status: normalizeStatus(item?.status),
      description: item?.more_Information || item?.description || "",
    });

    const fetchRoutes = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const list = await getRoutes(token);
        if (!isMounted) return;
        setRoutes(list.map(normalizeRoute));
      } catch {
        if (!isMounted) return;
        setError("Could not load routes right now.");
        setRoutes([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRoutes();
    return () => { isMounted = false; };
  }, []);

  const filteredRoutes = useMemo(() => {
    let filtered = routes;

    // Tab filter
    if (activeTab !== "all")
      filtered = filtered.filter((r) => r.status === activeTab);

    const afterDate = parseDateInput(filters.afterDate);
    const beforeDate = parseDateInput(filters.beforeDate);
    const afterDateMs = afterDate
      ? new Date(afterDate.getFullYear(), afterDate.getMonth(), afterDate.getDate(), 0, 0, 0, 0).getTime()
      : null;
    const beforeDateMs = beforeDate
      ? new Date(beforeDate.getFullYear(), beforeDate.getMonth(), beforeDate.getDate(), 23, 59, 59, 999).getTime()
      : null;

    if (filters.status)
      filtered = filtered.filter((r) => r.status === filters.status);

    // Multi-origin filter
    if (filters.origins.length > 0)
      filtered = filtered.filter((r) =>
        filters.origins.some((o) => r.origin && r.origin.toLowerCase().includes(o.toLowerCase()))
      );

    // Multi-destination filter
    if (filters.destinations.length > 0)
      filtered = filtered.filter((r) =>
        filters.destinations.some((d) => r.destination && r.destination.toLowerCase().includes(d.toLowerCase()))
      );

    // Waypoints: all must appear somewhere in the route
    if (filters.waypoints.length > 0) {
      filtered = filtered.filter((r) => {
        const haystack = [r.origin, r.destination, r.region, r.description]
          .join(" ")
          .toLowerCase();
        return filters.waypoints.every((wp) => haystack.includes(wp.trim().toLowerCase()));
      });
    }

    if (filters.region)
      filtered = filtered.filter((r) =>
        r.region && r.region.toLowerCase().includes(filters.region.toLowerCase())
      );

    if (afterDateMs != null)
      filtered = filtered.filter((r) => r.dateValue != null && r.dateValue >= afterDateMs);

    if (beforeDateMs != null)
      filtered = filtered.filter((r) => r.dateValue != null && r.dateValue <= beforeDateMs);

    // Vehicle type filter
    if (filters.vehicleTypes.length > 0)
      filtered = filtered.filter((r) =>
        filters.vehicleTypes.some((vt) =>
          r.vehicleName && r.vehicleName.toLowerCase().includes(vt.toLowerCase())
        )
      );

    // Capacity filter (capacity stored in kg)
    if (filters.capacityMin !== "") {
      const minKg = parseFloat(filters.capacityMin) * 1000;
      if (!isNaN(minKg))
        filtered = filtered.filter((r) => r.capacity != null && r.capacity >= minKg);
    }
    if (filters.capacityMax !== "") {
      const maxKg = parseFloat(filters.capacityMax) * 1000;
      if (!isNaN(maxKg))
        filtered = filtered.filter((r) => r.capacity != null && r.capacity <= maxKg);
    }

    // Sorting
    const dir = filters.sortDir === "desc" ? -1 : 1;
    filtered = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case "price":
          return dir * ((a.priceRaw ?? 0) - (b.priceRaw ?? 0));
        case "created":
          return dir * ((a.createdAtValue ?? 0) - (b.createdAtValue ?? 0));
        case "shipment":
          return dir * ((a.shipmentDateValue ?? 0) - (b.shipmentDateValue ?? 0));
        case "shipping":
          return dir * ((a.shippingDateValue ?? 0) - (b.shippingDateValue ?? 0));
        default:
          return 0;
      }
    });

    return filtered;
  }, [routes, filters, activeTab]);

  const handleNav = (tab) => {
    setActiveNav(tab);
    if (tab === "home") onNavigate("dashboard");
    if (tab === "shipments") onNavigate("shipments");
    if (tab === "profile") onNavigate("profile");
  };

  const openFilterModal = () => setShowFilterModal(true);
  const closeFilterModal = () => setShowFilterModal(false);
  const applyFilters = () => closeFilterModal();
  const clearFilters = () => setFilters({ ...DEFAULT_FILTERS });

  const hasActiveFilters =
    filters.origins.length > 0 ||
    filters.destinations.length > 0 ||
    filters.waypoints.length > 0 ||
    filters.region ||
    filters.status ||
    filters.afterDate ||
    filters.beforeDate ||
    filters.vehicleTypes.length > 0 ||
    filters.capacityMin !== "" ||
    filters.capacityMax !== "";

  // ── City chip helpers ─────────────────────────────────────────────────────
  const addCity = (field, city) => {
    setFilters((prev) => {
      if (prev[field].includes(city)) return prev;
      return { ...prev, [field]: [...prev[field], city] };
    });
  };

  const removeCity = (field, city) => {
    setFilters((prev) => ({ ...prev, [field]: prev[field].filter((c) => c !== city) }));
  };

  // ── Vehicle type toggle ───────────────────────────────────────────────────
  const toggleVehicleType = (vehicleName) => {
    setFilters((prev) => {
      const exists = prev.vehicleTypes.includes(vehicleName);
      return {
        ...prev,
        vehicleTypes: exists
          ? prev.vehicleTypes.filter((v) => v !== vehicleName)
          : [...prev.vehicleTypes, vehicleName],
      };
    });
  };

  const statusOptions = [
    { value: "", label: "All" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sh-screen">
      <div className="sh-container">
        {/* Header */}
        <div className="sh-header">
          <div className="sh-logo-row">
            <div className="sh-logo-box">
              <img src={logoSvg} alt="Wesselli logo" className="sh-logo-mark" />
            </div>
            <span className="sh-brand">WESSELLI</span>
          </div>
          <div className="sh-header-icons">
            <button className="sh-icon-btn sh-bell" type="button" aria-label="Notifications" onClick={() => onNavigate("notifications")}>
              <BellIcon />
              {hasUnreadNotifications && <span className="sh-notif-dot" />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="sh-body">
          {/* Tabs */}
          <div className="sh-tabs">
            {[
              { value: "all", label: "All Routes" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`sh-tab ${activeTab === tab.value ? "sh-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CTA Card */}
          <div className="sh-cta-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: "120px", backgroundImage: "url('/Routes.svg')", backgroundSize: "cover", backgroundPosition: "center 85%", borderBottom: "1px solid rgba(34,197,94,0.25)" }} />
            <div style={{ padding: "16px 18px 18px" }}>
              <h3 className="sh-cta-title">Have a route to plan?</h3>
              <p className="sh-cta-sub">Create a new route and optimize your logistics.</p>
              <button className="sh-cta-btn" type="button" onClick={() => onNavigate("createRoute")}>
                Create Route
              </button>
            </div>
          </div>

          {/* Section row — title + inline sort + filter */}
          <div className="sh-section-row">
            <h2 className="sh-section-title">Explore Available Truckers</h2>
            <div className="sh-inline-controls">
              <select
                className="sh-sort-select"
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                aria-label="Sort by"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                className="sh-sort-dir-btn"
                type="button"
                aria-label="Toggle sort direction"
                onClick={() => setFilters((prev) => ({ ...prev, sortDir: prev.sortDir === "asc" ? "desc" : "asc" }))}
              >
                {filters.sortDir === "asc" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16M4 12l8-8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 20V4M4 12l8 8 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              <button
                className="sh-filter-btn"
                type="button"
                aria-label="Filter routes"
                onClick={openFilterModal}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Filter
                {hasActiveFilters && <span className="routes-filter-active-dot" />}
              </button>
            </div>
          </div>

          {/* Route list */}
          {isLoading ? (
            <div className="sh-empty-state">Loading routes...</div>
          ) : error ? (
            <div className="sh-empty-state">{error}</div>
          ) : filteredRoutes.length === 0 ? (
            <div className="sh-empty-state">Nothing to explore right now.</div>
          ) : (
            filteredRoutes.map((route) => (
              <div key={route.id} className="sh-card">
                <div className="sh-card-top">
                  <button
                    className="sh-avatar"
                    type="button"
                    aria-label="Open user profile"
                    onClick={() => route.ownerId && onNavigate("publicProfile", { userId: route.ownerId, from: "routes" })}
                  >
                    {route.ownerPhoto ? (
                      <img src={resolveMediaUrl(route.ownerPhoto)} alt={route.userName} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="#9ca3af" strokeWidth="2" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                  <div className="sh-card-info">
                    <div className="sh-card-name-row">
                      <button
                        type="button"
                        className="sh-card-name"
                        style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: route.ownerId ? "pointer" : "default" }}
                        onClick={() => route.ownerId && onNavigate("publicProfile", { userId: route.ownerId, from: "routes" })}
                      >
                        {route.userName}
                      </button>
                      <span className="sh-tag sh-tag--vehicle sh-tag--vehicle-inline">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="5.5" cy="18.5" r="2.5" stroke="#0f172a" strokeWidth="2" />
                          <circle cx="18.5" cy="18.5" r="2.5" stroke="#0f172a" strokeWidth="2" />
                        </svg>
                        <span className="sh-vehicle-tag-text">
                          <span className="sh-vehicle-tag-name">{route.vehicleName}</span>
                          <span className="sh-vehicle-tag-meta">{route.vehicleColor} • {route.vehicleYear}</span>
                        </span>
                      </span>
                    </div>
                    <span className="sh-card-time">{route.time}</span>
                  </div>
                  {route.price && <span className="sh-card-price">{route.price}</span>}
                </div>

                <p className="sh-card-description">{route.description || "No description provided."}</p>

                <div className="sh-card-route">
                  {route.postType === "REGION" ? (
                    <div className="sh-route-row">
                      <span className="sh-route-dot sh-route-dot--green" />
                      <div>
                        <span className="sh-route-label">REGION</span>
                        <span className="sh-route-val">{route.region}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="sh-route-row">
                        <span className="sh-route-dot sh-route-dot--green" />
                        <div>
                          <span className="sh-route-label">ORIGIN</span>
                          <span className="sh-route-val">{route.origin}</span>
                        </div>
                      </div>
                      <div className="sh-route-row">
                        <span className="sh-route-dot sh-route-dot--gray" />
                        <div>
                          <span className="sh-route-label">DESTINATION</span>
                          <span className="sh-route-val">{route.destination}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="sh-card-footer">
                  <div className="sh-card-tags">
                    <span className="sh-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4zM6 6h12l1 14H5L6 6z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Maximum capacity: {route.capacity != null ? `${route.capacity} kg` : "N/A"}
                    </span>
                    <span className={`sh-tag sh-status-tag sh-status-tag--${route.status}`}>
                      {route.status.toUpperCase()}
                    </span>
                  </div>
                  {route.ownerId && (
                    <button className="sh-details-btn" type="button" onClick={() => onNavigate("publicProfile", { userId: route.ownerId, from: "routes" })}>
                      Profile
                    </button>
                  )}
                  <button className="sh-details-btn" type="button" onClick={() => onNavigate("routeDetails", { routeId: route.id, from: "routes" })}>
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAB */}
        <button className="sh-fab" type="button" aria-label="Create route" onClick={() => onNavigate("createRoute")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Bottom nav */}
        <div className="sh-bottom-nav">
          <button className={`sh-nav-item ${activeNav === "home" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("home")}>
            <HomeIcon active={activeNav === "home"} /><span>HOME</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "shipments" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("shipments")}>
            <TruckIcon active={activeNav === "shipments"} /><span>SHIPMENTS</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "routes" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("routes")}>
            <RouteIcon active={activeNav === "routes"} /><span>ROUTES</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "profile" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("profile")}>
            <ProfileIcon active={activeNav === "profile"} /><span>PROFILE</span>
          </button>
        </div>
      </div>

      {/* ── Filter Modal ─────────────────────────────────────────────────────── */}
      {showFilterModal && (
        <div className="routes-filter-overlay" onClick={closeFilterModal}>
          <div className="routes-filter-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="routes-filter-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "#22c55e", flexShrink: 0 }}>
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="routes-filter-title">Filter Routes</h3>
              <button className="routes-filter-close" onClick={closeFilterModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="routes-filter-body">

              {/* ── Status ── */}
              <div className="routes-filter-group">
                <label className="routes-filter-label">Status</label>
                <div className="routes-status-options">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`routes-status-btn ${filters.status === option.value ? "active" : ""}`}
                      onClick={() => setFilters((prev) => ({ ...prev, status: option.value }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Origin Cities ── */}
              <div className="routes-filter-group">
                <label className="routes-filter-label">Origin Cities</label>
                <CityAutocomplete
                  onSelect={(city) => addCity("origins", city)}
                  placeholder="Search and add a city..."
                  excludes={filters.origins}
                />
                {filters.origins.length > 0 && (
                  <div className="routes-chips-row">
                    {filters.origins.map((city) => (
                      <span key={city} className="routes-chip routes-chip--origin">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {city}
                        <button className="routes-chip-remove" onClick={() => removeCity("origins", city)}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Destination Cities ── */}
              <div className="routes-filter-group">
                <label className="routes-filter-label">Destination Cities</label>
                <CityAutocomplete
                  onSelect={(city) => addCity("destinations", city)}
                  placeholder="Search and add a city..."
                  excludes={filters.destinations}
                />
                {filters.destinations.length > 0 && (
                  <div className="routes-chips-row">
                    {filters.destinations.map((city) => (
                      <span key={city} className="routes-chip routes-chip--dest">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {city}
                        <button className="routes-chip-remove" onClick={() => removeCity("destinations", city)}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Waypoints / Stops ── */}
              <div className="routes-filter-group">
                <label className="routes-filter-label">Waypoints / Stops</label>
                <CityAutocomplete
                  onSelect={(city) => addCity("waypoints", city)}
                  placeholder="Search and add a city..."
                  excludes={filters.waypoints}
                />
                {filters.waypoints.length > 0 && (
                  <div className="routes-chips-row">
                    {filters.waypoints.map((city) => (
                      <span key={city} className="routes-chip routes-chip--waypoint">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {city}
                        <button className="routes-chip-remove" onClick={() => removeCity("waypoints", city)}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Date Range ── */}
              <div className="routes-filter-group">
                <label className="routes-filter-label">Date Range</label>
                <div className="routes-date-range">
                  <div className="routes-date-field">
                    <span className="routes-date-field-label">After</span>
                    <input
                      type="date"
                      className="routes-filter-input"
                      value={filters.afterDate}
                      onChange={(e) => setFilters((prev) => ({ ...prev, afterDate: e.target.value }))}
                    />
                  </div>
                  <div className="routes-date-field">
                    <span className="routes-date-field-label">Before</span>
                    <input
                      type="date"
                      className="routes-filter-input"
                      value={filters.beforeDate}
                      onChange={(e) => setFilters((prev) => ({ ...prev, beforeDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* ── Available Capacity ── */}
              <div className="routes-filter-group">
                <label className="routes-filter-label">Available Capacity (tonnes)</label>
                <div className="routes-capacity-row">
                  <div className="routes-capacity-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: "#22c55e", flexShrink: 0 }}>
                      <path d="M12 2a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4zM6 6h12l1 14H5L6 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="routes-capacity-input"
                      placeholder="Min"
                      value={filters.capacityMin}
                      onChange={(e) => setFilters((prev) => ({ ...prev, capacityMin: e.target.value }))}
                    />
                  </div>
                  <span className="routes-capacity-sep">–</span>
                  <div className="routes-capacity-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: "#22c55e", flexShrink: 0 }}>
                      <path d="M12 2a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4zM6 6h12l1 14H5L6 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="routes-capacity-input"
                      placeholder="Max"
                      value={filters.capacityMax}
                      onChange={(e) => setFilters((prev) => ({ ...prev, capacityMax: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* ── Vehicle Types ── */}
              <div className="routes-filter-group">
                <label className="routes-filter-label">
                  Category
                  {filters.vehicleTypes.length > 0 && (
                    <span className="routes-filter-count">{filters.vehicleTypes.length} selected</span>
                  )}
                </label>
                <div className="routes-vehicle-grid">
                  {VEHICLE_TYPES.map((v) => {
                    const isSelected = filters.vehicleTypes.includes(v.vehicle);
                    return (
                      <button
                        key={v.vehicle}
                        className={`routes-vehicle-chip ${isSelected ? "active" : ""}`}
                        onClick={() => toggleVehicleType(v.vehicle)}
                      >
                        <span className="routes-vehicle-chip-icon">{v.icon}</span>
                        <span className="routes-vehicle-chip-label">{v.vehicleFr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="routes-filter-footer">
              <button className="routes-filter-clear" onClick={clearFilters}>Clear All</button>
              <button className="routes-filter-apply" onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}