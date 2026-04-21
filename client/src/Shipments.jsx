import React, { useEffect, useMemo, useState, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import logoSvg from "./photo/Logo.svg";
import "./Shipments.css";
import { getShipments } from "./services/shipmentService";
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

const categories = ["Electronics", "Furniture", "Apparel", "Food & Beverages", "Machinery", "Documents", "Other"];

const parsePriceValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const normalized = value.replace(/,/g, ".");
  const match = normalized.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
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
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
    return null;
  }

  const dmyMatch = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!dmyMatch) return null;

  const day = Number(dmyMatch[1]);
  const month = Number(dmyMatch[2]);
  const year = Number(dmyMatch[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const parseItemDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }

  if (typeof value === "string") {
    const parsed = parseDateInput(value);
    if (parsed) return parsed.getTime();
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.getTime();

  return null;
};

const CityAutocomplete = ({ value, onChange, placeholder }) => {
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
    <div className="shipments-filter-autocomplete" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        className="shipments-filter-input"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="shipments-filter-suggestions">
          {suggestions.map((city, index) => (
            <li
              key={city}
              className={`shipments-filter-suggestion-item ${index === selectedIndex ? "selected" : ""}`}
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

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TruckIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="18.5" r="2.5" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2"/>
    <circle cx="18.5" cy="18.5" r="2.5" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2"/>
  </svg>
);

const RouteIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function Shipments({ onNavigate, onBack, refreshKey = 0, hasUnreadNotifications = false }) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeNav, setActiveNav] = useState("shipments");
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    status: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    afterDate: "",
    beforeDate: ""
  });

  useEffect(() => {
    let isMounted = true;
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const fallbackName =
      storedUser?.full_Name ||
      storedUser?.business_Name ||
      storedUser?.name 

    const formatCreatedAt = (createdAt) => {
      if (!createdAt) return "Recently";
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
        return "Recently";
      }
    };

    const normalizeShipment = (item, index) => {
      const routeText = item?.route || item?.routeName || "";
      const routeParts = String(routeText).split(/->|→|-/).map((part) => part.trim());
      const originFromRoute = routeParts[0] || "Origin not specified";
      const destinationFromRoute = routeParts[1] || "Destination not specified";

      return {
        id: item?.shipment_ID || item?.id || item?._id || `${index}-${item?.createdAt || "shipment"}`,
        ownerId: item?.user?.id || null,
        ownerPhoto: item?.user?.profile_Photo || "",
        name:
          item?.user?.individual?.full_Name ||
          item?.user?.business?.business_Name ||
          fallbackName,
        time: item?.createdAtLabel || formatCreatedAt(item?.createdAt),
        price:
          item?.priceLabel ||
          (item?.price != null ? `${item.price} DA` : "Price not specified"),
        priceValue: parsePriceValue(item?.price ?? item?.priceLabel),
        origin: item?.origin || item?.pickupAddress || originFromRoute,
        destination: item?.destination || item?.dropoffAddress || destinationFromRoute,
        category: item?.category || item?.cargoType || "General",
        weight:
          item?.weightLabel ||
          (item?.weight != null ? `${item.weight}${item?.weightUnit ? ` ${item.weightUnit}` : " kg"}` : ""),
        date: item?.date || item?.pickupDate || "",
        dateValue: parseItemDateValue(item?.date || item?.pickupDate || item?.createdAt),
        status: String(item?.status || "active").toLowerCase(),
        priority: item?.priority || "Normal",
        specialInformation: item?.special_Information || "",
      };
    };

    const fetchShipments = async () => {
      setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const list = await getShipments(token);

        if (!isMounted) return;
        setShipments(list.map(normalizeShipment));
      } catch (fetchError) {
        if (!isMounted) return;
        setError("Could not load shipments right now.");
        setShipments([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchShipments();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredShipments = useMemo(() => {
    let filtered = shipments;
    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);
    const hasMinPrice = filters.minPrice !== "" && Number.isFinite(minPrice);
    const hasMaxPrice = filters.maxPrice !== "" && Number.isFinite(maxPrice);
    const afterDate = parseDateInput(filters.afterDate);
    const beforeDate = parseDateInput(filters.beforeDate);
    const afterDateMs = afterDate
      ? new Date(afterDate.getFullYear(), afterDate.getMonth(), afterDate.getDate(), 0, 0, 0, 0).getTime()
      : null;
    const beforeDateMs = beforeDate
      ? new Date(beforeDate.getFullYear(), beforeDate.getMonth(), beforeDate.getDate(), 23, 59, 59, 999).getTime()
      : null;
    
    if (filters.status) {
      filtered = filtered.filter((shipment) => shipment.status === filters.status);
    }
    
    if (filters.category) {
      filtered = filtered.filter((shipment) => shipment.category === filters.category);
    }
    
    if (filters.origin) {
      filtered = filtered.filter((shipment) => 
        shipment.origin && shipment.origin.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }
    
    if (filters.destination) {
      filtered = filtered.filter((shipment) => 
        shipment.destination && shipment.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    if (hasMinPrice) {
      filtered = filtered.filter(
        (shipment) => shipment.priceValue != null && shipment.priceValue >= minPrice
      );
    }

    if (hasMaxPrice) {
      filtered = filtered.filter(
        (shipment) => shipment.priceValue != null && shipment.priceValue <= maxPrice
      );
    }

    if (afterDateMs != null) {
      filtered = filtered.filter(
        (shipment) => shipment.dateValue != null && shipment.dateValue >= afterDateMs
      );
    }

    if (beforeDateMs != null) {
      filtered = filtered.filter(
        (shipment) => shipment.dateValue != null && shipment.dateValue <= beforeDateMs
      );
    }
    
    return filtered;
  }, [shipments, filters]);

  const handleNav = (tab) => {
    setActiveNav(tab);
    if (tab === "home") onNavigate("dashboard");
    if (tab === "routes") onNavigate("routes");
    if (tab === "profile") onNavigate("profile");
  };

  const openFilterModal = () => {
    setShowFilterModal(true);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const applyFilters = () => {
    closeFilterModal();
  };

  const clearFilters = () => {
    setFilters({
      origin: "",
      destination: "",
      status: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      afterDate: "",
      beforeDate: ""
    });
  };

  const hasActiveFilters =
    filters.origin ||
    filters.destination ||
    filters.status ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.afterDate ||
    filters.beforeDate;

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" }
  ];

  return (
    <div className="sh-screen">
      <div className="sh-container">

        <div className="sh-header">
          <div className="sh-logo-row">
            <div className="sh-logo-box">
              <img src={logoSvg} alt="Wesselli logo" className="sh-logo-mark" />
            </div>
            <span className="sh-brand">WESSELLI</span>
          </div>
          <div className="sh-header-icons">
            <button className="sh-icon-btn sh-bell" onClick={() => onNavigate("notifications")}>
              <BellIcon />
              {hasUnreadNotifications && <span className="sh-notif-dot" />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="sh-body">
          <div className="sh-tabs">
            {["all", "active", "pending"].map(tab => (
              <button
                key={tab}
                className={`sh-tab ${activeTab === tab ? "sh-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all" ? "All Shipments" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="sh-cta-card">
            <h3 className="sh-cta-title">Have something to ship?</h3>
            <p className="sh-cta-sub">Create a new request and reach thousands of shippers nearby.</p>
            <button className="sh-cta-btn" onClick={() => onNavigate("createShipment")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
                <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Post
            </button>
          </div>

          <div className="sh-section-row">
            <h2 className="sh-section-title">Explore Available Shipments</h2>
            <button className="sh-filter-btn" onClick={openFilterModal}>
              Filter
              {hasActiveFilters && <span className="shipments-filter-active-dot"></span>}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="sh-empty-state">Loading shipments...</div>
          ) : error ? (
            <div className="sh-empty-state">{error}</div>
          ) : filteredShipments.length === 0 ? (
            <div className="sh-empty-state">Nothing to explore right now.</div>
          ) : (
            filteredShipments.map((s) => (
              <div key={s.id} className="sh-card" onClick={() => onNavigate("shipmentDetails", { shipmentId: s.id })}>
                <div className="sh-card-top">
                  <button
                    className="sh-avatar"
                    type="button"
                    aria-label="Open user profile"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (s.ownerId) {
                        onNavigate("publicProfile", { userId: s.ownerId, from: "shipments" });
                      }
                    }}
                  >
                    {s.ownerPhoto ? (
                      <img
                        src={resolveMediaUrl(s.ownerPhoto)}
                        alt={s.name}
                        style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="#9ca3af" strokeWidth="2"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  <div className="sh-card-info">
                    <button
                      type="button"
                      className="sh-card-name"
                      style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: s.ownerId ? "pointer" : "default" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (s.ownerId) {
                          onNavigate("publicProfile", { userId: s.ownerId, from: "shipments" });
                        }
                      }}
                    >
                      {s.name}
                    </button>
                    <span className="sh-card-time">{s.time}</span>
                  </div>
                  <span className="sh-card-price">{s.price}</span>
                </div>

                <p className="sh-card-description">
                  {s.specialInformation || "No description provided."}
                </p>

                <div className="sh-card-route">
                  <div className="sh-route-row">
                    <span className="sh-route-dot sh-route-dot--green" />
                    <div>
                      <span className="sh-route-label">ORIGIN</span>
                      <span className="sh-route-val">{s.origin}</span>
                    </div>
                  </div>
                  <div className="sh-route-row">
                    <span className="sh-route-dot sh-route-dot--gray" />
                    <div>
                      <span className="sh-route-label">DESTINATION</span>
                      <span className="sh-route-val">{s.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="sh-card-footer">
                  <div className="sh-card-tags">
                    {s.category && (
                      <span className="sh-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {s.category}
                      </span>
                    )}
                    {s.weight && (
                      <span className="sh-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4zM6 6h12l1 14H5L6 6z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {s.weight}
                      </span>
                    )}
                    {s.date && <span className="sh-tag">Date: {s.date}</span>}
                    <span className={`sh-shipment-status-tag sh-shipment-status-tag--${s.status}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="sh-card-actions">
                    {s.ownerId ? (
                      <button
                        className="sh-details-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          onNavigate("publicProfile", { userId: s.ownerId, from: "shipments" });
                        }}
                      >
                        Profile
                      </button>
                    ) : null}
                    <button
                      className="sh-details-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        onNavigate("shipmentDetails", { shipmentId: s.id });
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>

        <button className="sh-fab" onClick={() => onNavigate("createShipment")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="sh-bottom-nav">
          <button className={`sh-nav-item ${activeNav === "home" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("home")}>
            <HomeIcon active={activeNav === "home"} />
            <span>HOME</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "shipments" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("shipments")}>
            <TruckIcon active={activeNav === "shipments"} />
            <span>SHIPMENTS</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "routes" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("routes")}>
            <RouteIcon active={activeNav === "routes"} />
            <span>ROUTES</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "profile" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("profile")}>
            <ProfileIcon active={activeNav === "profile"} />
            <span>PROFILE</span>
          </button>
        </div>

      </div>

      {showFilterModal && (
        <div className="shipments-filter-overlay" onClick={closeFilterModal}>
          <div className="shipments-filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shipments-filter-header">
              <h3 className="shipments-filter-title">Filter Shipments</h3>
              <button className="shipments-filter-close" onClick={closeFilterModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="shipments-filter-body">
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">Status</label>
                <div className="shipments-status-options">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`shipments-status-btn ${filters.status === option.value ? "active" : ""}`}
                      onClick={() => setFilters(prev => ({ ...prev, status: option.value }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">Category</label>
                <div className="shipments-category-options">
                  <button
                    className={`shipments-category-btn ${filters.category === "" ? "active" : ""}`}
                    onClick={() => setFilters(prev => ({ ...prev, category: "" }))}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`shipments-category-btn ${filters.category === cat ? "active" : ""}`}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">Origin City</label>
                <CityAutocomplete
                  value={filters.origin}
                  onChange={(value) => setFilters(prev => ({ ...prev, origin: value }))}
                  placeholder="Search origin city"
                />
              </div>
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">Destination City</label>
                <CityAutocomplete
                  value={filters.destination}
                  onChange={(value) => setFilters(prev => ({ ...prev, destination: value }))}
                  placeholder="Search destination city"
                />
              </div>
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">Price Range (DA)</label>
                <div className="shipments-price-range">
                  <input
                    type="number"
                    min="0"
                    className="shipments-filter-input"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <input
                    type="number"
                    min="0"
                    className="shipments-filter-input"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>
              <div className="shipments-filter-group">
                <label className="shipments-filter-label">Date Range</label>
                <div className="shipments-date-range">
                  <div className="shipments-date-field">
                    <span className="shipments-date-field-label">After</span>
                    <input
                      type="date"
                      className="shipments-filter-input"
                      value={filters.afterDate}
                      onChange={(e) => setFilters((prev) => ({ ...prev, afterDate: e.target.value }))}
                    />
                    <span className="shipments-date-field-value">
                      {filters.afterDate || "Not selected"}
                    </span>
                  </div>
                  <div className="shipments-date-field">
                    <span className="shipments-date-field-label">Before</span>
                    <input
                      type="date"
                      className="shipments-filter-input"
                      value={filters.beforeDate}
                      onChange={(e) => setFilters((prev) => ({ ...prev, beforeDate: e.target.value }))}
                    />
                    <span className="shipments-date-field-value">
                      {filters.beforeDate || "Not selected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="shipments-filter-footer">
              <button className="shipments-filter-clear" onClick={clearFilters}>
                Clear All
              </button>
              <button className="shipments-filter-apply" onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}