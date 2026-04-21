import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  MoreVertical,
  PauseCircle,
} from "lucide-react";
import {
  activateAdminUser,
  getAdminUsers,
  suspendAdminUser,
} from "./services/adminService";
import ThemeToggle from "./ThemeToggle";
import { resolveMediaUrl } from "./utils/media";
import "./UsersList.css";

const FILTERS = [
  { label: "All", key: "all" },
  { label: "Active", key: "active" },
  { label: "Suspended", key: "suspended" },
  { label: "Admin", key: "admin" },
  { label: "User", key: "user" },
  { label: "Business", key: "business" },
  { label: "Individual", key: "individual" },
];

const statusClass = (value) => String(value || "").trim().toLowerCase();
const normalizeStatus = (value) => {
  const low = statusClass(value);
  if (low === "active") return "active";
  if (low === "suspended") return "suspended";
  return "unknown";
};

const mapUser = (user) => {
  const type = String(user?.type || "").toLowerCase();
  const role = String(user?.role || "").toLowerCase();

  return {
    id: user?.id,
    userId: String(user?.id ?? "-"),
    name:
      user?.individual?.full_Name ||
      user?.business?.business_Name ||
      user?.email ||
      "Unknown user",
    email: user?.email || "",
    phone: user?.phone || "-",
    profilePhoto: typeof user?.profile_Photo === "string" ? user.profile_Photo.trim() : "",
    type: type || "unknown",
    role: role || "user",
    status: normalizeStatus(user?.status),
  };
};

// ── Context Menu ──────────────────────────────────────────────
function ContextMenu({ user, onClose, onAction }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAction = (action) => {
    onAction(action, user);
    onClose();
  };

  return (
    <div className="ctx-menu open" ref={menuRef}>
      <button className="ctx-menu-item" type="button" onClick={() => handleAction("active")}>
        <CheckCircle size={16} color="#09c247" />
        Activate
      </button>
      <button className="ctx-menu-item" type="button" onClick={() => handleAction("suspend")}>
        <PauseCircle size={16} color="#f59e0b" />
        Suspend
      </button>
    </div>
  );
}

// ── User Item ─────────────────────────────────────────────────
function UserItem({ user, openMenuId, onToggleMenu, onCloseMenu, onAction, actionLoadingId, onOpenProfile }) {
  const isMenuOpen = openMenuId === user.id;
  const isLoading  = actionLoadingId === user.id;

  return (
    <div className={`ul-item ${isLoading ? "ul-item--loading" : ""}`}>
      <button
        className="ul-avatar"
        type="button"
        aria-label="Open user profile"
        onClick={() => onOpenProfile?.(user)}
      >
        {user.profilePhoto ? (
          <img
            src={resolveMediaUrl(user.profilePhoto)}
            alt={user.name}
            className="ul-avatar-img"
          />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke="#1e3a8a" strokeWidth="2" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <div className="ul-info">
        <button
          type="button"
          className="ul-name"
          style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
          onClick={() => onOpenProfile?.(user)}
        >
          {user.name}
        </button>
        <p className="ul-id">ID: {user.userId} · {user.email}</p>
        <div className="ul-badges">
          <span className={`ul-type-badge ul-type-${user.type || "unknown"}`}>
            {String(user.type || "UNKNOWN").toUpperCase()}
          </span>
          <span className={`ul-type-badge ul-role-${user.role || "user"}`}>
            {String(user.role || "USER").toUpperCase()}
          </span>
          <span className={`ul-status ul-status-${user.status || "unknown"}`}>
            <span className="ul-status-dot" />
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
        </div>
      </div>
      <button
        className="ul-more-btn"
        type="button"
        disabled={isLoading}
        onClick={(e) => { e.stopPropagation(); onToggleMenu(user.id); }}
      >
        {isLoading
          ? <Loader2 size={18} className="ul-spin" />
          : <MoreVertical size={18} />
        }
        {isMenuOpen && !isLoading && (
          <ContextMenu user={user} onClose={onCloseMenu} onAction={onAction} />
        )}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function UsersList({ onBack, onNavigate }) {
  const [users,           setUsers]           = useState([]);
  const [activeFilter,    setActiveFilter]    = useState("all");
  const [openMenuId,      setOpenMenuId]      = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Loading states
  const [initialLoading,  setInitialLoading]  = useState(true);

  // Error states
  const [error,           setError]           = useState(null);
  const [actionError,     setActionError]     = useState(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // ── 1. Initial load: getUsers ──────────────────────────────
  const fetchInitialUsers = useCallback(async () => {
    setInitialLoading(true);
    setError(null);

    try {
      const data = await getAdminUsers();
      setUsers(data.map(mapUser));
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialUsers();
  }, [fetchInitialUsers]);

  // ── Actions: active / suspend ──────────────────────────────
  const handleAction = async (action, user) => {
    setActionLoadingId(user.id);
    setActionError(null);

    try {
      if (action === "active") {
        await activateAdminUser(user.id);
      } else if (action === "suspend") {
        await suspendAdminUser(user.id);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: action === "active" ? "active" : "suspended" }
            : u
        )
      );
    } catch (err) {
      setActionError(`Failed to ${action} user: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Filtering ──────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const normalizedStatus = normalizeStatus(u.status);
    const normalizedType = String(u.type || "").toLowerCase();
    const normalizedRole = String(u.role || "").toLowerCase();

    const matchFilter =
      activeFilter === "all" ||
      normalizedStatus === activeFilter ||
      normalizedType === activeFilter ||
      normalizedRole === activeFilter;

    return matchFilter;
  });

  const handleToggleMenu = (id) =>
    setOpenMenuId((prev) => (prev === id ? null : id));

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="ul-page">
      <div className="ul-card">
        <div className="ul-header">
          <button className="ul-back-btn" type="button" onClick={onBack}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="ul-title">Users</h1>
            <p className="ul-subtitle">Manage account status from your admin workspace.</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Sticky top */}
        <div className="ul-sticky-top">
          <div className="ul-filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`ul-filter-btn ${activeFilter === f.key ? "active" : ""}`}
                onClick={() => setActiveFilter(f.key)}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="ul-count">
            {initialLoading
              ? "Loading users..."
              : `Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? "s" : ""}`
            }
          </p>
        </div>

        {/* Scrollable content */}
        <div className="ul-content">

          {/* Action error banner */}
          {actionError && (
            <div className="ul-error-banner">
              {actionError}
              <button onClick={() => setActionError(null)} className="ul-error-close">✕</button>
            </div>
          )}

          {/* Initial loading skeleton */}
          {initialLoading ? (
            <div className="ul-list">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ul-skeleton" />
              ))}
            </div>

          /* Error state */
          ) : error ? (
            <div className="ul-error-state">
              <p>{error}</p>
              <button className="ul-retry-btn" onClick={fetchInitialUsers} type="button">
                Retry
              </button>
            </div>

          /* Empty state */
          ) : filteredUsers.length === 0 ? (
            <p className="ul-empty">No users found.</p>

          /* User list */
          ) : (
            <div className="ul-list">
              {filteredUsers.map((u) => (
                <UserItem
                  key={u.id}
                  user={u}
                  openMenuId={openMenuId}
                  onToggleMenu={handleToggleMenu}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onAction={handleAction}
                  actionLoadingId={actionLoadingId}
                  onOpenProfile={(user) => {
                    if (user?.id != null) {
                      onNavigate?.("publicProfile", { userId: user.id, from: "usersList" });
                    }
                  }}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}