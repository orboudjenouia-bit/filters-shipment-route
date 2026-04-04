import { logout } from "./services/authService";
import ThemeToggle from "./ThemeToggle";
import "./EPPages.css";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

const settingsGroups = [
  {
    label: "Account",
    items: [
      { label: "Subscription Plan", icon: "star", action: "subscription" },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "Change Password", icon: "lock", action: "forgot" },
      { label: "Active Devices", icon: "devices", action: "activeDevices" },
      { label: "Privacy Policy", icon: "privacy" },
    ],
  },
  {
    label: "Support & Info",
    items: [
      { label: "Help Center", icon: "help" },
      { label: "Contact Us", icon: "contact" },
      { label: "About Wesselli", icon: "info" },
      { label: "Logout", icon: "logout", red: true, action: "logout" },
    ],
  },
];

function SettingsIcon({ type }) {
  const icons = {
    star: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    devices: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="14" height="10" rx="2" />
        <path d="M8 20h2" />
        <rect x="18" y="8" width="4" height="8" rx="1" />
      </svg>
    ),
    privacy: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    help: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h.01M9 12h.01M9 15h.01M12 9h3M12 12h3M12 15h3" />
      </svg>
    ),
    contact: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  };

  return icons[type] || null;
}

export default function ProfileSettingsPage({ onBack, onNavigate }) {
  const handleAction = async (action) => {
    if (!action) return;

    if (action === "logout") {
      try {
        await logout();
      } catch {
        // Continue with client-side logout fallback.
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        onNavigate?.("landing");
      }
      return;
    }

    onNavigate?.(action);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "var(--bg-primary)", display: "flex", justifyContent: "center", transition: "background 0.3s" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh" }}>
        <div className="screen-card">
          <div className="screen-header">
            <div className="screen-header-left">
              <button className="back-btn" onClick={onBack} type="button"><BackIcon /></button>
              <span className="screen-title">Settings</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="st-body">
            {settingsGroups.map((group) => (
              <div key={group.label}>
                <div className="st-section-label">{group.label}</div>
                <div className="st-group">
                  {group.items.map((item) => (
                    <div className="st-item" key={item.label} onClick={() => handleAction(item.action)}>
                      <div className={`st-icon${item.red ? " red" : ""}`}>
                        <SettingsIcon type={item.icon} />
                      </div>
                      <span className={`st-item-label${item.red ? " red" : ""}`}>{item.label}</span>
                      {!item.red && <span className="st-chevron"><ChevronRight /></span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
