import React, { useEffect, useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Routes.css";
import { getRoutes } from "./services/routeService";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

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

const normalizeStatus = (status) => {
  const raw = String(status || "").toLowerCase().trim();
  if (raw.includes("pending")) return "pending";
  return "active";
};

export default function RoutesScreen({ onNavigate, hasUnreadNotifications = false }) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeNav, setActiveNav] = useState("routes");
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    userName:
      item?.user?.individual?.full_Name ||
      item?.user?.business?.business_Name ||
      (item?.user?.email ? String(item.user.email).split("@")[0] : "Unknown user"),
    name: item?.name || item?.route_Name || "Route",
    time:
      item?.date_type === "INTERVAL"
        ? `${item?.interval_start || "-"} to ${item?.interval_end || "-"}`
        : item?.date || item?.createdAtLabel || formatCreatedAt(item?.createdAt),
      price: item?.priceLabel || (item?.price != null ? `${item.price} DA` : ""),
      postType: item?.post_type || "ORIGIN_DESTINATION",
      origin: item?.origin || "Origin not specified",
      destination: item?.destination || "Destination not specified",
      region: item?.region || "Region not specified",
      capacity: item?.vehicle?.capacity ?? item?.capacity ?? item?.weight ?? null,
      vehicleName: item?.vehicle?.vehicle_Name || "Unknown vehicle",
      vehiclePlate: item?.vehicle?.plate_Number != null ? String(item.vehicle.plate_Number) : "-",
      vehicleColor: item?.vehicle?.color || "No color",
      vehicleYear: item?.vehicle?.year || "No year",
      status: normalizeStatus(item?.status),
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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRoutes();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRoutes = useMemo(() => {
    if (activeTab === "all") return routes;
    return routes.filter((route) => route.status === activeTab);
  }, [activeTab, routes]);

  const handleNav = (tab) => {
    setActiveNav(tab);
    if (tab === "home") onNavigate("dashboard");
    if (tab === "shipments") onNavigate("shipments");
    if (tab === "profile") onNavigate("profile");
  };

  return (
    <div className="sh-screen">
      <div className="sh-container">
        <div className="sh-header">
          <div className="sh-logo-row">
            <div className="sh-logo-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2" />
                <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span className="sh-brand">WESSELLI</span>
          </div>
          <div className="sh-header-icons">
            <button className="sh-icon-btn" type="button" aria-label="Search routes"><SearchIcon /></button>
            <button className="sh-icon-btn sh-bell" type="button" aria-label="Notifications" onClick={() => onNavigate("notifications")}>
              <BellIcon />
              {hasUnreadNotifications && <span className="sh-notif-dot" />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="sh-body">
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

          <div className="sh-cta-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                height: "120px",
                backgroundImage: "url('/Routes.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center 85%",
                borderBottom: "1px solid rgba(34, 197, 94, 0.25)",
              }}
            />
            <div style={{ padding: "16px 18px 18px" }}>
              <h3 className="sh-cta-title">Have a route to plan?</h3>
              <p className="sh-cta-sub">Create a new route and optimize your logistics.</p>
              <button className="sh-cta-btn" type="button" onClick={() => onNavigate("createRoute")}>
                Create Route
              </button>
            </div>
          </div>

          <div className="sh-section-row">
            <h2 className="sh-section-title">Explore Available Truckers</h2>
            <button className="sh-filter-btn" type="button" aria-label="Filter routes">
              Filter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

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
                  <div className="sh-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#9ca3af" strokeWidth="2" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="sh-card-info">
                    <div className="sh-card-name-row">
                      <span className="sh-card-name">{route.userName}</span>
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
                  </div>
                  <button className="sh-details-btn" type="button">Details</button>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="sh-fab" type="button" aria-label="Create route" onClick={() => onNavigate("createRoute")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
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
    </div>
  );
}
