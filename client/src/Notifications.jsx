import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import {
  getNotifications,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markManyNotificationsAsRead,
} from "./services/notificationService";
import { toastError, toastSuccess } from "./services/toastService";
import "./Notifications.css";

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="19" r="2" fill="currentColor" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 20H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
  </svg>
);

const ReadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M21 16V8C21 7.3 20.6 6.7 20 6.4L13 2.4C12.4 2.1 11.6 2.1 11 2.4L4 6.4C3.4 6.7 3 7.3 3 8V16C3 16.7 3.4 17.3 4 17.6L11 21.6C11.6 21.9 12.4 21.9 13 21.6L20 17.6C20.6 17.3 21 16.7 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.3 7L12 12L20.7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const normalizeNotificationType = (type) => {
  const value = String(type || "").toLowerCase();

  if (["shipment", "shipments", "delivery", "deliveries"].includes(value)) return "shipments";
  if (["route", "routes"].includes(value)) return "routes";
  if (["alert", "alerts", "warning", "error"].includes(value)) return "alerts";
  if (["account", "profile", "auth", "success", "info"].includes(value)) return "account";

  return "account";
};

const getNotificationIcon = (type) => {
  switch (normalizeNotificationType(type)) {
    case "shipments":
      return <div style={{ color: "#22c55e" }}><BoxIcon /></div>;
    case "routes":
      return <div style={{ color: "#f59e0b" }}><TruckIcon /></div>;
    case "alerts":
      return <div style={{ color: "#ef4444" }}><AlertIcon /></div>;
    case "account":
      return <div style={{ color: "#6b7280" }}><CheckIcon /></div>;
    default:
      return <div style={{ color: "#6b7280" }}><InfoIcon /></div>;
  }
};

const formatTime = (createdAt) => {
  if (!createdAt) return "Recently";
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  } catch {
    return "Recently";
  }
};

export default function Notifications({ onNavigate, onBack, onNotificationsChanged }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [menuOpen, setMenuOpen] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const tabs = ["all", "shipments", "routes", "account", "alerts"];

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getNotifications();
        if (!isMounted) return;

        const normalized = data.map((item) => ({
          ...item,
          type: normalizeNotificationType(item.type),
        }));

        setNotifications(normalized);
      } catch (err) {
        if (isMounted) {
          const message = err.message || "Failed to load notifications";
          setError(message);
          toastError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const getTabColor = (tab) => {
    switch (tab.toLowerCase()) {
      case "all":
        return "#22c55e"; // green
      case "shipments":
        return "#22c55e"; // green
      case "routes":
        return "#f59e0b"; // orange
      case "account":
        return "#6b7280"; // grey
      case "alerts":
        return "#ef4444"; // red
      default:
        return "#22c55e";
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications;
    if (activeTab === "shipments") return notifications.filter(n => normalizeNotificationType(n.type) === "shipments");
    if (activeTab === "routes") return notifications.filter(n => normalizeNotificationType(n.type) === "routes");
    if (activeTab === "account") return notifications.filter(n => normalizeNotificationType(n.type) === "account");
    if (activeTab === "alerts") return notifications.filter(n => normalizeNotificationType(n.type) === "alerts");
    return notifications;
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.notif_ID !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      setMenuOpen(null);
      toastSuccess("Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
      toastError(err?.message || "Failed to delete notification.");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n.notif_ID === id ? { ...n, isRead: true } : n)));
      setMenuOpen(null);
      toastSuccess("Notification marked as read");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toastError(err?.message || "Failed to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setSelectionMode(false);
      setSelectedIds([]);
      setHeaderMenuOpen(false);
      setMenuOpen(null);
      toastSuccess("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      toastError(err?.message || "Failed to mark all notifications as read.");
    }
  };

  const handleToggleSelectMode = () => {
    setSelectionMode(prev => !prev);
    setSelectedIds([]);
    setHeaderMenuOpen(false);
    setMenuOpen(null);
  };

  const handleToggleSelected = (id) => {
    setSelectedIds(prev => (
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    ));
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.length === 0) return;

    try {
      await markManyNotificationsAsRead(selectedIds);
      setNotifications(prev => prev.map(n => (
        selectedIds.includes(n.notif_ID) ? { ...n, isRead: true } : n
      )));
      setSelectedIds([]);
      setSelectionMode(false);
      setHeaderMenuOpen(false);
      toastSuccess("Selected notifications marked as read");
    } catch (err) {
      console.error("Error marking selected notifications as read:", err);
      toastError(err?.message || "Failed to mark selected notifications as read.");
    }
  };

  const filteredNotifications = getFilteredNotifications();

  useEffect(() => {
    if (typeof onNotificationsChanged !== "function") return;
    onNotificationsChanged(notifications.some((item) => item?.isRead === false));
  }, [notifications, onNotificationsChanged]);

  return (
    <div className="notifications-screen">
      <div className="notif-container">
        {/* Header */}
        <div className="notif-header">
          <button className="notif-back-btn" onClick={onBack}>
            <BackIcon />
          </button>
          <h1 className="notif-title">Notifications</h1>
          <div className="notif-header-actions">
            <ThemeToggle />
            <div style={{ position: "relative" }}>
              <button
                className="notif-menu-btn"
                onClick={() => setHeaderMenuOpen(prev => !prev)}
              >
                <MenuIcon />
              </button>
              {headerMenuOpen && (
                <div className="notif-header-menu">
                  <button className="notif-menu-item" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </button>
                  <button className="notif-menu-item" onClick={handleToggleSelectMode}>
                    {selectionMode ? "Cancel select" : "Select"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="notif-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`notif-tab ${activeTab === tab ? "notif-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? { backgroundColor: getTabColor(tab), color: "white" } : {}}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="notif-content">
          {selectionMode && (
            <div className="notif-select-actions">
              <span>{selectedIds.length} selected</span>
              <button
                className="notif-select-read-btn"
                onClick={handleMarkSelectedAsRead}
                disabled={selectedIds.length === 0}
              >
                Mark selected as read
              </button>
            </div>
          )}
          {isLoading ? (
            <div className="notif-loading">Loading notifications...</div>
          ) : error ? (
            <div className="notif-error">{error}</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notif-empty">No notifications</div>
          ) : (
            <div className="notif-list">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.notif_ID}
                  className={`notif-card ${notification.isRead ? "notif-card--read" : "notif-card--unread"}`}
                >
                  {selectionMode && (
                    <input
                      type="checkbox"
                      className="notif-select-checkbox"
                      checked={selectedIds.includes(notification.notif_ID)}
                      onChange={() => handleToggleSelected(notification.notif_ID)}
                    />
                  )}
                  <div className="notif-card-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notif-card-content">
                    <div className="notif-card-title">{notification.title}</div>
                    <div className="notif-card-message">{notification.message}</div>
                  </div>
                  <div className="notif-card-right">
                    <div className="notif-card-time">{formatTime(notification.createdAt)}</div>
                    <div className="notif-card-menu" style={{ position: "relative" }}>
                      <button
                        className="notif-card-menu-btn"
                        onClick={() => setMenuOpen(menuOpen === notification.notif_ID ? null : notification.notif_ID)}
                      >
                        <MenuIcon />
                      </button>
                      {menuOpen === notification.notif_ID && (
                        <div className="notif-card-menu-dropdown">
                          {!notification.isRead && (
                            <button
                              className="notif-menu-item"
                              onClick={() => handleMarkAsRead(notification.notif_ID)}
                              style={{ display: "flex", alignItems: "center", gap: "8px" }}
                            >
                              <ReadIcon />
                              Mark as read
                            </button>
                          )}
                          <button
                            className="notif-menu-item notif-menu-item--delete"
                            onClick={() => handleDeleteNotification(notification.notif_ID)}
                            style={{ display: "flex", alignItems: "center", gap: "8px" }}
                          >
                            <DeleteIcon />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
