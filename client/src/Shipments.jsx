import React, { useEffect, useMemo, useState } from "react";
import "./Shipments.css";
import { getShipments } from "./services/shipmentService";


const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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

export default function Shipments({ onNavigate, onBack, refreshKey = 0 }) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeNav, setActiveNav] = useState("shipments");
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const fallbackName =
      storedUser?.full_Name ||
      storedUser?.business_Name ||
      storedUser?.name 

    const normalizeShipment = (item, index) => {
      const routeText = item?.route || item?.routeName || "";
      const routeParts = String(routeText).split(/->|→|-/).map((part) => part.trim());
      const originFromRoute = routeParts[0] || "Origin not specified";
      const destinationFromRoute = routeParts[1] || "Destination not specified";

      return {
        id: item?.shipment_ID || item?.id || item?._id || `${index}-${item?.createdAt || "shipment"}`,
        name:
          item?.user?.individual?.full_Name ||
          item?.user?.business?.business_Name ||
          fallbackName,
        time: item?.createdAtLabel || "Recently",
        price:
          item?.priceLabel ||
          (item?.price != null ? `${item.price} DA` : "Price not specified"),
        origin: item?.origin || item?.pickupAddress || originFromRoute,
        destination: item?.destination || item?.dropoffAddress || destinationFromRoute,
        category: item?.category || item?.cargoType || "General",
        weight:
          item?.weightLabel ||
          (item?.weight != null ? `${item.weight}${item?.weightUnit ? ` ${item.weightUnit}` : " kg"}` : ""),
        date: item?.date || item?.pickupDate || "",
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
    if (activeTab === "all") return shipments;
    return shipments.filter((shipment) => shipment.status === activeTab);
  }, [activeTab, shipments]);

  const handleNav = (tab) => {
    setActiveNav(tab);
    if (tab === "home") onNavigate("dashboard");
  };

  return (
    <div className="sh-screen">
      <div className="sh-container">

        {/* Header */}
        <div className="sh-header">
          <div className="sh-logo-row">
            <div className="sh-logo-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
                <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="sh-brand">WESSELLI</span>
          </div>
          <div className="sh-header-icons">
            <button className="sh-icon-btn"><SearchIcon /></button>
            <button className="sh-icon-btn sh-bell">
              <BellIcon />
              <span className="sh-notif-dot" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="sh-body">

          {/* Tabs */}
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

          {/* CTA Card */}
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

          {/* Section title */}
          <div className="sh-section-row">
            <h2 className="sh-section-title">Explore Available Shippers</h2>
            <button className="sh-filter-btn">
              Filter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Shipment Cards */}
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
                  <div className="sh-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#9ca3af" strokeWidth="2"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="sh-card-info">
                    <span className="sh-card-name">{s.name}</span>
                    <span className="sh-card-time">{s.time}</span>
                  </div>
                  <span className="sh-card-price">{s.price}</span>
                </div>

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
                  </div>
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
            ))
          )}

        </div>

        {/* FAB */}
        <button className="sh-fab" onClick={() => onNavigate("createShipment")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Bottom Nav */}
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
    </div>
  );
}