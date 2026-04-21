import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import {
  MapPin, Mail, Phone, Settings, Bell, LogOut,
  ChevronRight, Star, CheckCircle, Truck, Edit3,
  ArrowLeft, XCircle, AlertCircle, Check, X, Package
} from "lucide-react";
import { getMyProfile, getShipmentHistory, getRouteHistory, getVehicles } from "./services/profileService";
import { logout } from "./services/authService";
import { resolveMediaUrl } from "./utils/media";
import "./Profile.css";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DefaultAvatar = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <circle cx="50" cy="50" r="50" fill="#f5f5f5" />
    <circle cx="50" cy="38" r="17" fill="#b3b3b3" />
    <path d="M16 87c5-16 19-24 34-24s29 8 34 24" fill="#b3b3b3" />
  </svg>
);

const statusStyles = {
  COMPLETED:   { color: "#00c46a", bg: "#e8faf2", border: "#b2f0d4" },
  ACTIVE:      { color: "#f59e0b", bg: "#fff7ed", border: "#fde68a" },
  "IN DELIVERY": { color: "#f59e0b", bg: "#fff7ed", border: "#fde68a" },
  "IN STOCK": { color: "#64748b", bg: "#f8fafc", border: "#cbd5e1" },
  PENDING:     { color: "#f59e0b", bg: "#fff7ed", border: "#fde68a" },
  Available:   { color: "#64748b", bg: "#f8fafc", border: "#cbd5e1" },
  FAILED:      { color: "#ef4444", bg: "#fff0f0", border: "#fecaca" },
  CANCELLED:   { color: "#ef4444", bg: "#fff0f0", border: "#fecaca" },
  Maintenance: { color: "#f59e0b", bg: "#fff7ed", border: "#fde68a" },
};

function StatusBadge({ status }) {
  const s = statusStyles[status] || statusStyles.Available;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "4px 11px",
      whiteSpace: "nowrap", border: `1px solid ${s.border}`,
      color: s.color, background: s.bg, fontFamily: "inherit"
    }}>{status}</span>
  );
}

function HistoryIconBox({ type }) {
  const configs = {
    check: { bg: "#e8faf2", icon: <CheckCircle size={20} color="#00c46a" /> },
    truck: { bg: "#fff3e0", icon: <Truck size={20} color="#f59e0b" /> },
    box: { bg: "#94a3b8", icon: <Package size={20} color="#ffffff" /> },
    alert: { bg: "#fff0f0", icon: <AlertCircle size={20} color="#ef4444" /> },
  };
  const c = configs[type];
  return (
    <div style={{ width: 44, height: 44, borderRadius: 13, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {c.icon}
    </div>
  );
}

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

const getHistoryIconType = (status) => {
  if (status === "FAILED" || status === "CANCELLED") return "alert";
  if (status === "IN STOCK") return "box";
  if (status === "IN DELIVERY" || status === "ACTIVE" || status === "PENDING") return "truck";
  return "check";
};

export default function Profile({ onNavigate, hasUnreadNotifications = false }) {
  const [page, setPage] = useState("profile");
  const [activeNav, setActiveNav] = useState("profile");
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [userData, setUserData] = useState({
    verified: false,
    subscriptionTier: "Free",
    name: "",
    location: "",
    rating: 0,
    reviews: 0,
    email: "",
    phone: "",
    profilePhoto: "",
  });
  const [historyItems, setHistoryItems] = useState([]);
  const [truckItems, setTruckItems] = useState([]);

  const verified = Boolean(userData.verified);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Proceed with client-side logout even if server logout fails.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      onNavigate?.("landing");
    }
  };

  const handleNav = (tab) => {
    setActiveNav(tab);
    if (!onNavigate) return;
    if (tab === "home") onNavigate("dashboard");
    if (tab === "shipments") onNavigate("shipments");
    if (tab === "routes") onNavigate("routes");
    if (tab === "profile") onNavigate("profile");
  };

  const handleHistoryItemClick = (item) => {
    if (!onNavigate || !item) return;

    if (item.type === "shipment") {
      if (item.rawId != null) {
        onNavigate("shipmentDetails", { shipmentId: item.rawId });
        return;
      }

      onNavigate("shipments");
      return;
    }

    if (item.type === "route") {
      if (item.rawId != null) {
        onNavigate("routeDetails", { routeId: item.rawId, from: "profile" });
        return;
      }

      onNavigate("routes");
      return;
    }

    onNavigate("routes");
  };

  useEffect(() => {
    let isMounted = true;

    const toHistoryStatusLabel = (status) => {
      const raw = String(status || "").trim().toLowerCase();
      if (raw.includes("delivery")) return "IN DELIVERY";
      if (raw.includes("stock")) return "IN STOCK";
      if (raw.includes("pending")) return "PENDING";
      if (raw.includes("fail")) return "FAILED";
      if (raw.includes("cancel")) return "CANCELLED";
      if (raw.includes("active")) return "ACTIVE";
      if (raw.includes("complete") || raw.includes("delivered")) return "COMPLETED";
      return "COMPLETED";
    };

    const loadProfileData = async () => {
      try {
        const [profile, historyResponse, routeHistoryResponse, vehiclesResponse] = await Promise.all([
          getMyProfile(),
          getShipmentHistory(),
          getRouteHistory(),
          getVehicles(),
        ]);

        if (!isMounted) return;

        const businessLocations = Array.isArray(profile?.business?.locations)
          ? profile.business.locations.map((value) => String(value || "").trim()).filter(Boolean)
          : [];
        const businessLocationText =
          businessLocations.length > 1 ? businessLocations.join(", ") : businessLocations[0] || "";

        setUserData({
          verified: Boolean(profile?.individual || profile?.business),
          subscriptionTier: profile?.subscription?.tier || "Free",
          name: profile?.displayName || "",
          location: profile?.individual?.location || businessLocationText,
          rating: Number(profile?.rating ?? 0),
          reviews: Number(profile?.reviews ?? 0),
          email: profile?.email || "",
          phone: profile?.phone || "",
          profilePhoto: typeof profile?.profile_Photo === "string" ? profile.profile_Photo.trim() : "",
        });

        const shipments = Array.isArray(historyResponse?.shipments)
          ? historyResponse.shipments
          : Array.isArray(historyResponse?.data)
          ? historyResponse.data
          : [];

        const normalizedHistory = shipments.map((item) => {
          const normalizedStatus = toHistoryStatusLabel(item?.status);
          const shipmentId = item?.shipment_ID || item?.id || null;
          const normalizedTitle =
            String(item?.title || "").trim() ||
            String(item?.shipmentName || "").trim() ||
            String(item?.name || "").trim() ||
            (item?.category ? `${item.category} Shipment` : "") ||
            (shipmentId ? `Shipment #${shipmentId}` : "Shipment");

          return {
            id: shipmentId || `ID-${Math.random().toString(36).slice(2, 7)}`,
            rawId: shipmentId,
            type: "shipment",
            title: normalizedTitle,
            date: item?.date || "Unknown date",
            kindLabel: "SHIPMENT",
            status: normalizedStatus,
            icon: getHistoryIconType(normalizedStatus),
          };
        });

        const routes = Array.isArray(routeHistoryResponse?.routes)
          ? routeHistoryResponse.routes
          : Array.isArray(routeHistoryResponse?.data)
          ? routeHistoryResponse.data
          : [];

        const normalizedRouteHistory = routes.map((item) => {
          const normalizedStatus = toHistoryStatusLabel(item?.status);
          const routeId = item?.route_ID || item?.id || null;
          const isRegionPost =
            String(item?.post_type || "").toUpperCase() === "REGION" ||
            (!item?.origin && !item?.destination && !!item?.region);
          const routeDate =
            String(item?.date_type || "").toUpperCase() === "INTERVAL"
              ? `${item?.interval_start || "Unknown start"} to ${item?.interval_end || "Unknown end"}`
              : item?.date || "Unknown date";
          const routeTitle =
            isRegionPost
              ? `Region: ${item?.region || "Unknown region"}`
              : item?.name ||
                item?.route_Name ||
                `${item?.origin || "Unknown origin"} -> ${item?.destination || "Unknown destination"}`;

          return {
            id: routeId || `R-${Math.random().toString(36).slice(2, 7)}`,
            rawId: routeId,
            type: "route",
            title: routeTitle,
            date: routeDate,
            kindLabel: isRegionPost ? "REGION POST" : "ORIGIN/DESTINATION",
            status: normalizedStatus,
            icon: getHistoryIconType(normalizedStatus),
          };
        });

        const mergedHistory = [...normalizedHistory, ...normalizedRouteHistory].sort((a, b) => {
          const aDate = Date.parse(a?.date || "");
          const bDate = Date.parse(b?.date || "");

          if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) return bDate - aDate;

          const aId = Number(a?.rawId);
          const bId = Number(b?.rawId);
          if (!Number.isNaN(aId) && !Number.isNaN(bId)) return bId - aId;

          return 0;
        });

        setHistoryItems(mergedHistory);

        const vehicles = Array.isArray(vehiclesResponse?.vehicles)
          ? vehiclesResponse.vehicles
          : Array.isArray(vehiclesResponse?.data)
          ? vehiclesResponse.data
          : [];

        const normalizedTrucks = vehicles.map((vehicle, index) => {
          const hasActiveRoute = Array.isArray(vehicle?.routes)
            ? vehicle.routes.some((route) => String(route?.status || "").toLowerCase() === "active")
            : false;

          const photo = typeof vehicle?.photo === "string" ? vehicle.photo.trim() : "";

          return {
            name: vehicle?.vehicle_Name || `Vehicle ${index + 1}`,
            capacity: `${vehicle?.capacity ?? "-"} Tons`,
            status: hasActiveRoute ? "Active" : "Available",
            img: photo,
            hasPhoto: Boolean(photo),
            year: vehicle?.year || "-",
            plate: vehicle?.plate_Number || "-",
            driver: "-",
            trips: Array.isArray(vehicle?.routes) ? vehicle.routes.length : 0,
            fuel: "-",
            color: String(vehicle?.color || "").trim() || "-",
          };
        });

        setTruckItems(normalizedTrucks);
      } catch {
        if (!isMounted) return;
        setHistoryItems([]);
        setTruckItems([]);
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const previewHistory = historyItems.slice(0, 2);

  const subPageHeader = (title, onBack) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 20px 16px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", position: "sticky", top: 0, zIndex: 10 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, color: "var(--text-primary)" }}>
        <ArrowLeft size={22} />
      </button>
      <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "1.2px", color: "var(--text-primary)" }}>{title}</span>
    </div>
  );

  const shell = (children) => (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "var(--bg-primary)", display: "flex", justifyContent: "center", transition: "background 0.3s" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", background: "var(--bg-secondary)", boxShadow: "var(--shadow-lg)", paddingBottom: 40 }}>{children}</div>
    </div>
  );

  if (page === "allHistory") return shell(<>
    {subPageHeader("ALL HISTORY", () => setPage("profile"))}
    <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "12px 16px 0", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
      {historyItems.length === 0 ? (
        <div style={{ padding: "18px", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
          No history
        </div>
      ) : historyItems.map((item, i) => (
        <div
          key={i}
          onClick={() => handleHistoryItemClick(item)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", ...(i < historyItems.length - 1 ? { borderBottom: "1px solid var(--border-color)" } : {}) }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <HistoryIconBox type={item.icon} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{item.title}</div>
              <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-secondary)" }}>
                {item.date}{item.kindLabel ? ` • ${item.kindLabel}` : ""} • #{item.id}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StatusBadge status={item.status} />
            <ChevronRight size={14} color="var(--text-secondary)" />
          </div>
        </div>
      ))}
    </div>
  </>);

  if (page === "allTrucks") return shell(<>
    {subPageHeader("ALL TRUCKS", () => setPage("profile"))}
    <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "12px 16px 0", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
      {truckItems.length === 0 ? (
        <div style={{ padding: "18px", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
          No vehicles
        </div>
      ) : truckItems.map((truck, i) => (
        <div key={i}
          onClick={() => { setSelectedTruck(truck); setPage("truckDetail"); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", ...(i < truckItems.length - 1 ? { borderBottom: "1px solid var(--border-color)" } : {}) }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {truck.hasPhoto ? (
              <img src={resolveMediaUrl(truck.img)} alt={truck.name} style={{ width: 52, height: 52, borderRadius: 13, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 13, background: "rgba(148, 163, 184, 0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Truck size={24} color="#94a3b8" />
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{truck.name}</div>
              <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-secondary)" }}>Capacity: {truck.capacity}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StatusBadge status={truck.status} />
            <ChevronRight size={14} color="var(--text-secondary)" />
          </div>
        </div>
      ))}
    </div>
  </>);

  if (page === "truckDetail" && selectedTruck) {
    const t = selectedTruck;
    const st = statusStyles[t.status] || statusStyles.Available;
    const details = [
      { label: "Plate Number", value: t.plate },
      { label: "Year",         value: t.year },
      { label: "Capacity",     value: t.capacity },
      { label: "Fuel Type",    value: t.fuel },
      { label: "Color",        value: t.color },
      { label: "Driver",       value: t.driver },
      { label: "Total Trips",  value: t.trips },
    ];
    return shell(<>
      {subPageHeader("TRUCK DETAILS", () => setPage("allTrucks"))}

      <div style={{ margin: "12px 16px 0", borderRadius: 16, overflow: "hidden", height: 180, position: "relative" }}>
        <img src={resolveMediaUrl(t.img)} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{t.name}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{t.plate}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "4px 12px", border: `1px solid ${st.border}`, color: st.color, background: st.bg }}>{t.status}</span>
        </div>
      </div>

      <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "10px 16px 0", padding: 20, border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 14 }}>Truck Information</div>
        {details.map((d, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", ...(i < details.length - 1 ? { borderBottom: "1px solid var(--border-color)" } : {}) }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </>);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "var(--bg-primary)", display: "flex", justifyContent: "center", transition: "background 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", background: "var(--bg-secondary)", boxShadow: "var(--shadow-lg)", paddingBottom: 0 }}>

        <div style={{ background: "var(--bg-secondary)", borderRadius: 0, margin: "0", overflow: "visible", position: "relative", border: "none", boxShadow: "none" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, letterSpacing: "1.5px", color: "var(--text-primary)" }}>
              <ProfileIcon active={false} />
              MY PROFILE
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <ThemeToggle />
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => onNavigate("notifications")}
                style={{
                  position: "relative",
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "none",
                  background: "var(--button-secondary-bg)",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <BellIcon />
                {hasUnreadNotifications && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border-color)", margin: "0 20px" }} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 30px", gap: 10 }}>
            <button
              type="button"
              onClick={() => onNavigate?.("editProfile")}
              aria-label="Edit profile photo"
              style={{ position: "relative", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <div style={{ width: 100, height: 100, borderRadius: "50%", padding: 3, border: `3px solid ${verified ? "#22c55e" : "#ef4444"}` }}>
                {userData.profilePhoto ? (
                  <img src={resolveMediaUrl(userData.profilePhoto)} alt="profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                    <DefaultAvatar />
                  </div>
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: verified ? "#22c55e" : "#ef4444",
                  border: "2px solid var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {verified ? <Check size={13} color="#ffffff" strokeWidth={3} /> : <X size={13} color="#ffffff" strokeWidth={3} />}
              </div>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ borderRadius: 20, padding: "3px 12px", display: "flex", alignItems: "center", gap: 5, background: verified ? "#e8faf2" : "#fff0f0" }}>
                {verified ? <CheckCircle size={13} color="#22c55e" /> : <XCircle size={13} color="#ef4444" />}
                <span style={{ fontSize: 12, fontWeight: 600, color: verified ? "#22c55e" : "#ef4444" }}>{verified ? "Verified" : "Not Verified"}</span>
              </div>
              <div style={{ borderRadius: 20, padding: "3px 12px", display: "flex", alignItems: "center", gap: 5, background: "#ecfeff" }}>
                <CheckCircle size={13} color="#0891b2" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0e7490" }}>Tier: {userData.subscriptionTier || "Free"}</span>
              </div>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{userData.name || "User"}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{userData.location || "Location not provided"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e8faf2", borderRadius: 20, padding: "5px 14px" }}>
              <Star size={14} color="#22c55e" fill="#22c55e" />
              <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 14 }}>{userData.rating}/5 Rating</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>({userData.reviews} Reviews)</span>
            </div>
            <button
              style={{ marginTop: 8, background: "var(--text-primary)", color: "var(--bg-secondary)", border: "none", borderRadius: 28, padding: "13px 36px", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, letterSpacing: "1px" }}
              onClick={() => onNavigate?.("editProfile")}
              type="button"
            >
              <Edit3 size={15} /> EDIT PROFILE
            </button>
          </div>
        </div>

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "0 16px", padding: 20, border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, background: "rgba(34,197,94,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={14} color="#22c55e" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Contact Information</span>
          </div>
          {[
            { icon: <Mail size={16} color="#22c55e" />, value: userData.email || "No email" },
            { icon: <Phone size={16} color="#22c55e" />, value: userData.phone || "No phone" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border-color)", gap: 12 }}>
              <div style={{ width: 34, height: 34, background: "rgba(34,197,94,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</div>
              <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "0 16px", padding: 20, border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>History</span>
            <button style={{ background: "none", border: "none", color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }} onClick={() => setPage("allHistory")}>VIEW ALL</button>
          </div>
          {previewHistory.length === 0 ? (
            <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, textAlign: "center", padding: "6px 0 2px" }}>
              No history
            </div>
          ) : previewHistory.map((item, i) => (
            <div
              key={i}
              onClick={() => handleHistoryItemClick(item)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border-color)", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <HistoryIconBox type={item.icon} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{item.title}</div>
                  <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-secondary)" }}>
                    {item.date}{item.kindLabel ? ` • ${item.kindLabel}` : ""} • #{item.id}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StatusBadge status={item.status} />
                <ChevronRight size={14} color="var(--text-secondary)" />
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "0 16px", padding: 20, border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>My Trucks</span>
            <button style={{ background: "none", border: "none", color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }} onClick={() => setPage("allTrucks")}>VIEW ALL</button>
          </div>
          {truckItems.length === 0 ? (
            <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, textAlign: "center", padding: "6px 0 2px" }}>
              No vehicles
            </div>
          ) : truckItems.slice(0, 3).map((truck, i) => (
            <div key={i}
              onClick={() => { setSelectedTruck(truck); setPage("truckDetail"); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border-color)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {truck.hasPhoto ? (
                  <img src={resolveMediaUrl(truck.img)} alt={truck.name} style={{ width: 52, height: 52, borderRadius: 13, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 13, background: "rgba(148, 163, 184, 0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Truck size={24} color="#94a3b8" />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{truck.name}</div>
                  <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-secondary)" }}>Capacity: {truck.capacity}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StatusBadge status={truck.status} />
                <ChevronRight size={14} color="var(--text-secondary)" />
              </div>
            </div>
          ))}
          <button
            style={{
              width: "100%",
              marginTop: 14,
              background: "#22c55e",
              border: "none",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              padding: "12px 14px",
              borderRadius: 12,
              letterSpacing: "0.6px",
            }}
            onClick={() => onNavigate?.("vehicle")}
          >
            ADD VEHICLE
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-primary)", borderRadius: 16, margin: "0 16px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          {[
            { icon: <Settings size={18} />, label: "Settings", red: false, action: "profileSettings" },
            { icon: <LogOut size={18} />, label: "Logout", red: true, action: "logout" },
          ].map((item, i, arr) => (
            <div
              key={i}
              onClick={() => {
                if (item.action === "logout") handleLogout();
                else if (item.action === "profileSettings") onNavigate("profileSettings");
              }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 20px", cursor: "pointer", ...(i < arr.length - 1 ? { borderBottom: "1px solid var(--border-color)" } : {}) }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ color: item.red ? "#ef4444" : "var(--text-secondary)" }}>{item.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: item.red ? "#ef4444" : "var(--text-primary)", fontFamily: "inherit" }}>{item.label}</span>
              </div>
              <ChevronRight size={16} color={item.red ? "#ef4444" : "var(--text-secondary)"} />
            </div>
          ))}
        </div>

        <div style={{ height: 20 }} />

        <div className="sh-bottom-nav">
          <button className={`sh-nav-item ${activeNav === "home" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("home")} type="button">
            <HomeIcon active={activeNav === "home"} />
            <span>HOME</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "shipments" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("shipments")} type="button">
            <TruckIcon active={activeNav === "shipments"} />
            <span>SHIPMENTS</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "routes" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("routes")} type="button">
            <RouteIcon active={activeNav === "routes"} />
            <span>ROUTES</span>
          </button>
          <button className={`sh-nav-item ${activeNav === "profile" ? "sh-nav-item--active" : ""}`} onClick={() => handleNav("profile")} type="button">
            <ProfileIcon active={activeNav === "profile"} />
            <span>PROFILE</span>
          </button>
        </div>

      </div>
    </div>
  );
}