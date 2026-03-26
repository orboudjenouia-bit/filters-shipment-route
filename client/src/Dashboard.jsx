import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Dashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://your-api.com";
const DASHBOARD_STATS_ENDPOINT = process.env.REACT_APP_DASHBOARD_STATS_ENDPOINT || "/api/dashboard/stats";

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
    <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "rgba(34,197,94,0.1)" : "none"}/>
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

export default function Dashboard({ onNavigate, userName = "User" }) {
  const [activeTab, setActiveTab] = useState("home");
  const [activeShipments, setActiveShipments] = useState(0);
  const [activeRoutes, setActiveRoutes] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      setIsStatsLoading(true);
      setStatsError("");

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}${DASHBOARD_STATS_ENDPOINT}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load dashboard stats (${response.status})`);
        }

        const data = await response.json();

        const shipmentsCount = Number(
          data?.activeShipments ?? data?.shipments?.active ?? data?.shipmentCount ?? 0
        );
        const routesCount = Number(
          data?.activeRoutes ?? data?.routes?.active ?? data?.routeCount ?? 0
        );

        if (!isMounted) return;

        setActiveShipments(Number.isFinite(shipmentsCount) ? shipmentsCount : 0);
        setActiveRoutes(Number.isFinite(routesCount) ? routesCount : 0);
      } catch (error) {
        if (!isMounted) return;
        setStatsError("Could not load latest stats.");
        setActiveShipments(0);
        setActiveRoutes(0);
      } finally {
        if (isMounted) {
          setIsStatsLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (tab === "shipments") onNavigate("shipments");
  };

  const shipmentLabel = activeShipments === 1 ? "shipment" : "shipments";
  const routeLabel = activeRoutes === 1 ? "route" : "routes";

  return (
    <div className="db-screen">
      <div className="db-container">

        <div className="db-header">
          <div className="db-logo-row">
            <div className="db-logo-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
                <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="db-brand">WESSELLI</span>
          </div>
          <div className="db-header-icons">
            <button className="db-icon-btn"><SearchIcon /></button>
            <button className="db-icon-btn db-bell">
              <BellIcon />
              <span className="db-notif-dot" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="db-body">

          <div className="db-greeting">
            <h1 className="db-greeting-title">Hello, {userName}!</h1>
            <p className="db-greeting-sub">Welcome back to your logistics dashboard.</p>
          </div>

          <button className="db-cta-btn" onClick={() => onNavigate("createShipment")}>
            <span className="db-cta-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
                <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Post a New Shipment
            <svg className="db-cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="db-card" onClick={() => onNavigate("shipmentDetails")}>
            <div className="db-card-img db-card-img--containers" />
            <div className="db-card-body">
              <div className="db-card-row">
                <h3 className="db-card-title">Active Shipments</h3>
                <span className="db-badge db-badge--transit">IN TRANSIT</span>
              </div>
              <p className="db-card-desc">
                You have <strong>{isStatsLoading ? "..." : `${activeShipments} ${shipmentLabel}`}</strong> currently moving.
              </p>
              <p className="db-card-time">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{marginRight:4}}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {statsError || "Live from backend"}
              </p>
              <button className="db-view-btn">View Details</button>
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-img db-card-img--truck" />
            <div className="db-card-body">
              <h3 className="db-card-title">Active Routes</h3>
              <p className="db-card-desc">
                You have <strong>{isStatsLoading ? "..." : `${activeRoutes} ${routeLabel}`}</strong> currently published.
              </p>
              <p className="db-card-time">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{marginRight:4}}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {statsError || "Live from backend"}
              </p>
              <button className="db-view-btn">View Details</button>
            </div>
          </div>

        </div>

        <div className="db-bottom-nav">
          <button className={`db-nav-item ${activeTab === "home" ? "db-nav-item--active" : ""}`} onClick={() => handleNav("home")}>
            <HomeIcon active={activeTab === "home"} />
            <span>HOME</span>
          </button>
          <button className={`db-nav-item ${activeTab === "shipments" ? "db-nav-item--active" : ""}`} onClick={() => handleNav("shipments")}>
            <TruckIcon active={activeTab === "shipments"} />
            <span>SHIPMENTS</span>
          </button>
          <button className={`db-nav-item ${activeTab === "routes" ? "db-nav-item--active" : ""}`} onClick={() => handleNav("routes")}>
            <RouteIcon active={activeTab === "routes"} />
            <span>ROUTES</span>
          </button>
          <button className={`db-nav-item ${activeTab === "profile" ? "db-nav-item--active" : ""}`} onClick={() => handleNav("profile")}>
            <ProfileIcon active={activeTab === "profile"} />
            <span>PROFILE</span>
          </button>
        </div>

      </div>
    </div>
  );
}