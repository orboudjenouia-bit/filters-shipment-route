import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  CreditCard,
  Loader2,
  MoreVertical,
  PauseCircle,
  Trash2,
} from "lucide-react";
import {
  activateAdminUser,
  deleteAdminUser,
  getAdminUsers,
  getUserSubscriptionHistory,
  suspendAdminUser,
} from "./services/adminService";
import { toastError, toastSuccess } from "./services/toastService";
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
      <button className="ctx-menu-item" type="button" onClick={() => handleAction("subscriptionHistory")}>
        <Clock3 size={16} color="#2563eb" />
        Subscription History
      </button>
      <button className="ctx-menu-item ctx-menu-item--danger" type="button" onClick={() => handleAction("delete")}>
        <Trash2 size={16} color="#dc2626" />
        Delete
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
  const [historyOpen,     setHistoryOpen]     = useState(false);
  const [historyLoading,  setHistoryLoading]  = useState(false);
  const [historyError,    setHistoryError]    = useState("");
  const [historyData,     setHistoryData]     = useState(null);

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

  useEffect(() => {
    if (!error) return;
    toastError(error);
  }, [error]);

  useEffect(() => {
    if (!actionError) return;
    toastError(actionError);
  }, [actionError]);

  useEffect(() => {
    if (!historyError) return;
    toastError(historyError);
  }, [historyError]);

  // ── Actions: active / suspend ──────────────────────────────
  const handleAction = async (action, user) => {
    if (action === "subscriptionHistory") {
      setHistoryOpen(true);
      setHistoryLoading(true);
      setHistoryError("");
      setHistoryData(null);

      try {
        const data = await getUserSubscriptionHistory(user.id);
        setHistoryData(data);
      } catch (err) {
        setHistoryError(err?.message || "Failed to load subscription history.");
      } finally {
        setHistoryLoading(false);
      }
      return;
    }

    if (action === "delete") {
      const ok = window.confirm(`Delete user ${user.name} (ID: ${user.userId})? This cannot be undone.`);
      if (!ok) return;
    }

    setActionLoadingId(user.id);
    setActionError(null);

    try {
      if (action === "active") {
        await activateAdminUser(user.id);
        toastSuccess("User activated");
      } else if (action === "suspend") {
        await suspendAdminUser(user.id);
        toastSuccess("User suspended");
      } else if (action === "delete") {
        await deleteAdminUser(user.id);
        toastSuccess("User deleted");
      }

      setUsers((prev) => {
        if (action === "delete") {
          return prev.filter((u) => u.id !== user.id);
        }

        return prev.map((u) =>
          u.id === user.id
            ? { ...u, status: action === "active" ? "active" : "suspended" }
            : u
        );
      });
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

      {historyOpen && (
        <div className="ul-modal-backdrop" role="dialog" aria-modal="true" aria-label="Subscription history">
          <div className="ul-modal-card">
            <div className="ul-modal-head">
              <h3>Subscription History</h3>
              <button
                type="button"
                className="ul-modal-close"
                onClick={() => setHistoryOpen(false)}
              >
                X
              </button>
            </div>

            {historyLoading ? (
              <div className="ul-modal-loading">
                <Loader2 size={16} className="ul-spin" />
                <span>Loading history...</span>
              </div>
            ) : historyError ? (
              <p className="ul-modal-error">{historyError}</p>
            ) : (
              <>
                <div className="ul-sub-headline">
                  <div className="ul-sub-row">
                    <CreditCard size={15} />
                    <span>{historyData?.user?.name || "User"}</span>
                  </div>
                  <p>
                    {historyData?.currentSubscription
                      ? `Current: ${historyData.currentSubscription.tier} (${historyData.currentSubscription.isActive ? "Active" : "Inactive"})`
                      : "Current: No active subscription"}
                  </p>
                </div>

                <div className="ul-history-list">
                  {Array.isArray(historyData?.history) && historyData.history.length > 0 ? (
                    historyData.history.map((item) => (
                      <article key={item.notif_ID} className="ul-history-item">
                        <p className="ul-history-title">{item.title}</p>
                        <p className="ul-history-message">{item.message}</p>
                        <span className="ul-history-time">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </article>
                    ))
                  ) : (
                    <p className="ul-history-empty">No subscription history events found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}