import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import {
  MapPin, Mail, Phone, Settings, Bell, LogOut,
  ChevronRight, Star, CheckCircle, Truck, Edit3,
  ArrowLeft, XCircle, AlertCircle
} from "lucide-react";
import "./Profile.css";

const USER = {
  verified: true,
  name: "Wesselli",
  location: "Algiers, Algeria",
  rating: 4.8,
  reviews: 124,
  email: "ow_wesselli@esi.dz",
  phone: "+213 5563294178",
};

const NOTIFICATIONS = [
  { id: 1, title: "Package Delivered", message: "Your package #ID-001 has been delivered.", time: "2 min ago", read: false, icon: "check" },
  { id: 2, title: "New Truck Assigned", message: "Swift Hauler has been assigned to route #45.", time: "1 hr ago", read: false, icon: "truck" },
  { id: 3, title: "Delivery Failed", message: "Package #ID-007 could not be delivered.", time: "3 hrs ago", read: true, icon: "alert" },
  { id: 4, title: "Payment Received", message: "You received a payment of $240.", time: "Yesterday", read: true, icon: "check" },
];

const allHistory = [
  { id: "ID-001", title: "Package Delivered",  date: "Oct 24, 2025", status: "COMPLETED", icon: "check" },
  { id: "ID-002", title: "In Delivery",         date: "Today, 2:15 PM", status: "ACTIVE", icon: "truck" },
  { id: "ID-003", title: "Package Delivered",  date: "Oct 18, 2025", status: "COMPLETED", icon: "check" },
  { id: "ID-004", title: "Package Delivered",  date: "Oct 10, 2025", status: "COMPLETED", icon: "check" },
  { id: "ID-005", title: "In Delivery",         date: "Oct 5, 2025", status: "ACTIVE", icon: "truck" },
  { id: "ID-006", title: "Package Delivered",  date: "Sep 28, 2025", status: "COMPLETED", icon: "check" },
  { id: "ID-007", title: "Delivery Failed",    date: "Sep 20, 2025", status: "FAILED", icon: "alert" },
  { id: "ID-008", title: "Package Delivered",  date: "Sep 12, 2025", status: "COMPLETED", icon: "check" },
  { id: "ID-009", title: "In Delivery",         date: "Sep 1, 2025", status: "ACTIVE", icon: "truck" },
  { id: "ID-010", title: "Package Delivered",  date: "Aug 22, 2025", status: "COMPLETED", icon: "check" },
];

const allTrucks = [
  { name: "Swift Hauler",  capacity: "3.5 Tons", status: "ACTIVE",      img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=80&h=80&fit=crop", year: 2021, plate: "16-ALG-201", driver: "Karim B.", trips: 142, fuel: "Diesel", color: "White" },
  { name: "Prime Carrier", capacity: "5.0 Tons", status: "Available",   img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=80&h=80&fit=crop", year: 2020, plate: "09-ORA-088", driver: "Youcef M.", trips: 98, fuel: "Diesel", color: "Blue" },
  { name: "Urban Express", capacity: "1.2 Tons", status: "ACTIVE",      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop", year: 2022, plate: "31-ANN-445", driver: "Amine T.", trips: 210, fuel: "Gasoline", color: "Gray" },
  { name: "Desert Runner", capacity: "4.0 Tons", status: "Available",   img: "https://images.unsplash.com/photo-1586191582056-b3f09e5a6e99?w=80&h=80&fit=crop", year: 2019, plate: "25-CON-311", driver: "Salim D.", trips: 77, fuel: "Diesel", color: "Beige" },
  { name: "Night Mover",   capacity: "2.8 Tons", status: "ACTIVE",      img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=80&h=80&fit=crop", year: 2023, plate: "16-ALG-789", driver: "Riad K.", trips: 55, fuel: "Gasoline", color: "Black" },
  { name: "Coastal King",  capacity: "6.0 Tons", status: "Maintenance", img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=80&h=80&fit=crop", year: 2018, plate: "06-BEJ-102", driver: "Nassim H.", trips: 301, fuel: "Diesel", color: "Red" },
];

const statusStyles = {
  COMPLETED:   { color: "#00c46a", bg: "#e8faf2", border: "#b2f0d4" },
  ACTIVE:      { color: "#00c46a", bg: "#e8faf2", border: "#b2f0d4" },
  Available:   { color: "#888",    bg: "#f5f5f5", border: "#ddd" },
  FAILED:      { color: "#ef4444", bg: "#fff0f0", border: "#fecaca" },
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
    alert: { bg: "#fff0f0", icon: <AlertCircle size={20} color="#ef4444" /> },
  };
  const c = configs[type];
  return (
    <div style={{ width: 44, height: 44, borderRadius: 13, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {c.icon}
    </div>
  );
}

export default function Profile() {
  const [page, setPage] = useState("profile");
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const verified = USER.verified;
  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;
  const totalCount = notifications.length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const previewHistory = [
    allHistory.find(h => h.status === "COMPLETED"),
    allHistory.find(h => h.status === "ACTIVE"),
  ].filter(Boolean);

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
      <div style={{ width: "100%", maxWidth: 430, paddingBottom: 40 }}>{children}</div>
    </div>
  );

  if (page === "allHistory") return shell(<>
    {subPageHeader("ALL HISTORY", () => setPage("profile"))}
    <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "12px 16px 0", overflow: "hidden" }}>
      {allHistory.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", ...(i < allHistory.length - 1 ? { borderBottom: "1px solid var(--border-color)" } : {}) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <HistoryIconBox type={item.icon} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{item.title}</div>
              <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-secondary)" }}>{item.date} • #{item.id}</div>
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>
      ))}
    </div>
  </>);

  if (page === "allTrucks") return shell(<>
    {subPageHeader("ALL TRUCKS", () => setPage("profile"))}
    <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "12px 16px 0", overflow: "hidden" }}>
      {allTrucks.map((truck, i) => (
        <div key={i}
          onClick={() => { setSelectedTruck(truck); setPage("truckDetail"); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", ...(i < allTrucks.length - 1 ? { borderBottom: "1px solid var(--border-color)" } : {}) }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={truck.img} alt={truck.name} style={{ width: 52, height: 52, borderRadius: 13, objectFit: "cover", flexShrink: 0 }} />
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
        <img src={t.img.replace("w=80&h=80", "w=430&h=180")} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{t.name}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{t.plate}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "4px 12px", border: `1px solid ${st.border}`, color: st.color, background: st.bg }}>{t.status}</span>
        </div>
      </div>

      <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "10px 16px 0", padding: 20 }}>
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
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "var(--bg-primary)", display: "flex", justifyContent: "center", transition: "background 0.3s" }}
      onClick={() => showNotifDropdown && setShowNotifDropdown(false)}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 430, paddingBottom: 40 }}>

        <div style={{ background: "var(--bg-secondary)", borderRadius: 20, margin: "16px 16px 0", overflow: "visible", position: "relative" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}>
              <div style={{ height: 2, width: 20, borderRadius: 2, background: "var(--text-primary)" }} />
              <div style={{ height: 2, width: 20, borderRadius: 2, background: "var(--text-primary)" }} />
              <div style={{ height: 2, width: 14, borderRadius: 2, background: "var(--text-primary)" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "1.5px", color: "var(--text-primary)" }}>MY PROFILE</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <ThemeToggle />
              <div style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setShowNotifDropdown(p => !p); }}>
                <Bell size={22} color="var(--text-primary)" style={{ cursor: "pointer" }} />
                {hasUnread && (
                  <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: `1.5px solid var(--bg-secondary)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.3px" }}>
                    {totalCount > 9 ? "9+" : totalCount}
                  </div>
                )}
                {showNotifDropdown && (
                  <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 32, right: 0, width: 300, zIndex: 999, background: "var(--bg-secondary)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--border-color)" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Notifications</span>
                      {hasUnread && <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#22c55e", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>Mark all read</button>}
                    </div>
                    {notifications.map((n, i) => (
                      <div key={n.id} onClick={() => markRead(n.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", cursor: "pointer", background: !n.read ? "rgba(34,197,94,0.1)" : "transparent", borderBottom: i < notifications.length - 1 ? "1px solid var(--border-color)" : "none", transition: "background 0.2s" }}>
                        <HistoryIconBox type={n.icon} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{n.title}</span>
                            {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.message}</div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border-color)", margin: "0 20px" }} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 30px", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", padding: 3, border: `3px solid ${verified ? "#22c55e" : "#ef4444"}` }}>
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face" alt="profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, borderRadius: "50%", padding: 1, background: "var(--bg-secondary)" }}>
                {verified ? <CheckCircle size={22} color="#22c55e" fill="#22c55e" /> : <XCircle size={22} color="#ef4444" fill="#ef4444" />}
              </div>
            </div>
            <div style={{ borderRadius: 20, padding: "3px 12px", display: "flex", alignItems: "center", gap: 5, background: verified ? "#e8faf2" : "#fff0f0" }}>
              {verified ? <CheckCircle size={13} color="#22c55e" /> : <XCircle size={13} color="#ef4444" />}
              <span style={{ fontSize: 12, fontWeight: 600, color: verified ? "#22c55e" : "#ef4444" }}>{verified ? "Verified" : "Not Verified"}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{USER.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{USER.location}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e8faf2", borderRadius: 20, padding: "5px 14px" }}>
              <Star size={14} color="#22c55e" fill="#22c55e" />
              <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 14 }}>{USER.rating}/5 Rating</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>({USER.reviews} Reviews)</span>
            </div>
            <button style={{ marginTop: 8, background: "var(--text-primary)", color: "var(--bg-secondary)", border: "none", borderRadius: 28, padding: "13px 36px", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, letterSpacing: "1px" }}>
              <Edit3 size={15} /> EDIT PROFILE
            </button>
          </div>
        </div>

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "0 16px", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, background: "rgba(34,197,94,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={14} color="#22c55e" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Contact Information</span>
          </div>
          {[
            { icon: <Mail size={16} color="#22c55e" />, value: USER.email },
            { icon: <Phone size={16} color="#22c55e" />, value: USER.phone },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border-color)", gap: 12 }}>
              <div style={{ width: 34, height: 34, background: "rgba(34,197,94,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</div>
              <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "0 16px", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>History</span>
            <button style={{ background: "none", border: "none", color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }} onClick={() => setPage("allHistory")}>VIEW ALL</button>
          </div>
          {previewHistory.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <HistoryIconBox type={item.icon} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{item.title}</div>
                  <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-secondary)" }}>{item.date} • #{item.id}</div>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "0 16px", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>My Trucks</span>
            <button style={{ background: "none", border: "none", color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }} onClick={() => setPage("allTrucks")}>VIEW ALL</button>
          </div>
          {allTrucks.slice(0, 3).map((truck, i) => (
            <div key={i}
              onClick={() => { setSelectedTruck(truck); setPage("truckDetail"); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border-color)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={truck.img} alt={truck.name} style={{ width: 52, height: 52, borderRadius: 13, objectFit: "cover", flexShrink: 0 }} />
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

        <div style={{ height: 10 }} />

        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, margin: "0 16px", overflow: "hidden" }}>
          {[
            { icon: <Settings size={18} />, label: "Settings", red: false },
            { icon: <Bell size={18} />, label: "Notification Preferences", red: false },
            { icon: <LogOut size={18} />, label: "Logout", red: true },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 20px", cursor: "pointer", ...(i < 2 ? { borderBottom: "1px solid var(--border-color)" } : {}) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ color: item.red ? "#ef4444" : "var(--text-secondary)" }}>{item.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: item.red ? "#ef4444" : "var(--text-primary)", fontFamily: "inherit" }}>{item.label}</span>
              </div>
              <ChevronRight size={16} color={item.red ? "#ef4444" : "var(--text-secondary)"} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}