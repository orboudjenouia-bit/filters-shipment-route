import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import "./EPPages.css";
import "./ActiveDevicesPage.css";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 20h20" />
    </svg>
  );
}

const initialDevices = [
  { id: "d1", name: "Windows Chrome", location: "Algiers, Algeria", lastActive: "Now", current: true, type: "desktop" },
  { id: "d2", name: "iPhone Safari", location: "Algiers, Algeria", lastActive: "2h ago", current: false, type: "mobile" },
  { id: "d3", name: "MacBook Chrome", location: "Oran, Algeria", lastActive: "Yesterday", current: false, type: "desktop" },
];

export default function ActiveDevicesPage({ onBack }) {
  const [devices, setDevices] = useState(initialDevices);

  const signOutDevice = (id) => {
    setDevices((prev) => prev.filter((item) => item.id !== id));
  };

  const signOutAllOtherDevices = () => {
    setDevices((prev) => prev.filter((item) => item.current));
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "var(--bg-primary)", display: "flex", justifyContent: "center", transition: "background 0.3s" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh" }}>
        <div className="screen-card">
          <div className="screen-header">
            <div className="screen-header-left">
              <button className="back-btn" onClick={onBack} type="button"><BackIcon /></button>
              <span className="screen-title">Active Devices</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="ad-body">
            <div className="ad-top-row">
              <p className="ad-subtitle">Manage sessions signed in to your account.</p>
              <button type="button" className="ad-link-btn" onClick={signOutAllOtherDevices}>Sign Out Others</button>
            </div>

            <div className="ad-list">
              {devices.map((device) => (
                <div className="ad-item" key={device.id}>
                  <div className="ad-icon-wrap">
                    {device.type === "mobile" ? <PhoneIcon /> : <LaptopIcon />}
                  </div>

                  <div className="ad-content">
                    <div className="ad-name-row">
                      <span className="ad-name">{device.name}</span>
                      {device.current && <span className="ad-badge">Current</span>}
                    </div>
                    <div className="ad-meta">{device.location}</div>
                    <div className="ad-meta">Last active: {device.lastActive}</div>
                  </div>

                  {device.current ? (
                    <button type="button" className="ad-action-btn ad-action-btn--disabled" disabled>
                      This Device
                    </button>
                  ) : (
                    <button type="button" className="ad-action-btn" onClick={() => signOutDevice(device.id)}>
                      Sign Out
                    </button>
                  )}
                </div>
              ))}

              {devices.length === 0 && (
                <div className="ad-empty">No active sessions found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
