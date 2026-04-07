import React, { useEffect, useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Shipmentdetails.css";
import { getShipments } from "./services/shipmentService";
import { resolveMediaUrl } from "./utils/media";

const fallbackTimeline = [
  { id: 1, label: "Shipment Created", sub: "Request registered successfully", done: true },
  { id: 2, label: "Pending Assignment", sub: "Waiting for assignment", active: true },
  { id: 3, label: "In Delivery", sub: "Shipment will move after assignment" },
];

const toTitle = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Unknown";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const parseSpecialInformation = (text) => {
  if (!text) return "No additional notes";
  return String(text).trim();
};

export default function ShipmentDetails({ onBack, onNavigate, shipmentId }) {
  const [mounted, setMounted] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchShipment = async () => {
      if (shipmentId == null) {
        setError("No shipment selected.");
        setShipment(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const list = await getShipments(token);
        const found = list.find((item) => String(item.shipment_ID ?? item.id ?? item._id) === String(shipmentId));

        if (!isMounted) return;

        if (!found) {
          setShipment(null);
          setError("Shipment not found.");
          return;
        }

        setShipment(found);
      } catch {
        if (!isMounted) return;
        setShipment(null);
        setError("Could not load shipment details right now.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchShipment();

    return () => {
      isMounted = false;
    };
  }, [shipmentId]);

  const display = useMemo(() => {
    if (!shipment) return null;

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const senderName =
      shipment?.user?.individual?.full_Name ||
      shipment?.user?.business?.business_Name ||
      storedUser?.full_Name ||
      storedUser?.business_Name ||
      storedUser?.name ||
      "Unknown user";

    return {
      id: shipment.shipment_ID,
      photo: typeof shipment?.photo === "string" ? shipment.photo.trim() : "",
      senderId: shipment?.user?.id || null,
      senderPhoto: shipment?.user?.profile_Photo || storedUser?.profile_Photo || "",
      type: `${toTitle(shipment.priority)} Priority`,
      status: toTitle(shipment.status || "In-Stock"),
      origin: shipment.origin || "Origin not specified",
      destination: shipment.destination || "Destination not specified",
      date: shipment.date || "Date not specified",
      weight: `${shipment.weight ?? "-"}kg`,
      volume: `${shipment.volume ?? "-"}m³`,
      senderName,
      specialInformation: parseSpecialInformation(shipment.special_Information),
      priority: shipment.priority || "Normal",
    };
  }, [shipment]);

  return (
    <div className="sd-screen">
      <div className={`sd-container ${mounted ? "sd-container--visible" : ""}`}>

        <div className="sd-header">
          <button className="sd-back-btn" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="sd-title">Shipment Details</h2>
          <ThemeToggle />
        </div>

        <div className="sd-body">
          {isLoading ? (
            <div className="sd-id-row">
              <h1 className="sd-id">Loading shipment...</h1>
            </div>
          ) : error ? (
            <div className="sd-id-row">
              <h1 className="sd-id">{error}</h1>
            </div>
          ) : (
            <>
              <div className="sd-id-row">
                <div>
                  <h1 className="sd-id">#WES-{display.id}</h1>
                  <p className="sd-type">{display.type}</p>
                </div>
                <span className="sd-status-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {display.status.toUpperCase()}
                </span>
              </div>

              {display.photo ? (
                <div className="sd-map">
                  <div className="sd-map-bg">
                    <img
                      src={resolveMediaUrl(display.photo)}
                      alt={`Shipment ${display.id}`}
                      className="sd-cover-image"
                    />
                  </div>
                  <div className="sd-map-badge">
                    <span className="sd-map-label">SHIPMENT PRIORITY</span>
                    <span className="sd-map-loc">{display.priority}</span>
                  </div>
                </div>
              ) : null}

              <div className="sd-info-row">
                <div className="sd-info-card">
                  <span className="sd-info-label">ORIGIN</span>
                  <div className="sd-info-val-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="10" r="3" stroke="#22c55e" strokeWidth="2"/>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#22c55e" strokeWidth="2"/>
                    </svg>
                    <span className="sd-info-val">{display.origin}</span>
                  </div>
                </div>
                <div className="sd-info-card">
                  <span className="sd-info-label">WEIGHT / VOL</span>
                  <div className="sd-info-val-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4zM6 6h12l1 14H5L6 6z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="sd-info-val">{display.weight} • {display.volume}</span>
                  </div>
                </div>
              </div>

              <div className="sd-sender-card">
                <div className="sd-sender-avatar">
                  {display.senderPhoto ? (
                    <img
                      src={resolveMediaUrl(display.senderPhoto)}
                      alt={display.senderName}
                      className="sd-sender-avatar-img"
                    />
                  ) : (
                    <span className="sd-sender-avatar-fallback" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="sd-sender-info">
                  <span className="sd-sender-label">SENDER</span>
                  <span className="sd-sender-name">{display.senderName}</span>
                </div>
                {display.senderId ? (
                  <button
                    className="sd-msg-btn"
                    type="button"
                    aria-label="View sender profile"
                    onClick={() => onNavigate?.("publicProfile", { userId: display.senderId, from: "shipmentDetails" })}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ) : null}
              </div>

              <div className="sd-route">
                <div className="sd-route-item">
                  <div className="sd-route-dot sd-route-dot--active" />
                  <div className="sd-route-line" />
                  <div className="sd-route-content">
                    <span className="sd-route-label">PICKUP</span>
                    <span className="sd-route-place">{display.origin}</span>
                    <span className="sd-route-time">{display.date}</span>
                  </div>
                </div>
                <div className="sd-route-item">
                  <div className="sd-route-dot sd-route-dot--inactive" />
                  <div className="sd-route-content">
                    <span className="sd-route-label">DELIVERY</span>
                    <span className="sd-route-place">{display.destination}</span>
                    <span className="sd-route-time">Priority: {display.priority}</span>
                  </div>
                </div>
              </div>

              <h3 className="sd-timeline-title">Special Information</h3>
              <div className="sd-timeline">
                <div className="sd-timeline-item">
                  <div className="sd-timeline-icon sd-timeline-icon--done">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="sd-timeline-content">
                    <span className="sd-timeline-label">Description</span>
                    <span className="sd-timeline-sub">{display.specialInformation}</span>
                  </div>
                </div>
                {fallbackTimeline.map((step, i) => (
                  <div key={step.id} className="sd-timeline-item">
                    <div className={`sd-timeline-icon ${step.done ? "sd-timeline-icon--done" : ""} ${step.active ? "sd-timeline-icon--active" : ""}`}>
                      {step.done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="4" fill="white"/>
                          <path d="M12 8v4l3 3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    {i < fallbackTimeline.length - 1 && <div className="sd-timeline-connector" />}
                    <div className="sd-timeline-content">
                      <span className="sd-timeline-label">{step.label}</span>
                      <span className="sd-timeline-sub">{step.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}