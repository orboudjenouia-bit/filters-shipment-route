import { useEffect, useState } from "react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { getRoutes, updateRoute } from "./services/routeService";
import { toastError, toastSuccess } from "./services/toastService";
import "./Createroute.css";

export default function EditActiveRoutePage({ routeId, onBack, onSaved }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    origin: "",
    destination: "",
    waypoints: [],
    region: "",
    date: "",
    post_type: "ORIGIN_DESTINATION",
    date_type: "DAY",
    interval_start: "",
    interval_end: "",
    vehicle_plate: "",
    status: "Active",
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getRoutes();
        const found = list.find((it) => String(it?.route_ID || it?.id) === String(routeId));
        if (!found) {
          toastError("Route not found.");
          return;
        }

        setForm({
          name: found.name || "",
          origin: found.origin || "",
          destination: found.destination || "",
          waypoints: Array.isArray(found.waypoints) ? found.waypoints : [],
          region: found.region || "",
          date: found.date || "",
          post_type: found.post_type || "ORIGIN_DESTINATION",
          date_type: found.date_type || "DAY",
          interval_start: found.interval_start || "",
          interval_end: found.interval_end || "",
          vehicle_plate: String(found.vehicle_plate ?? ""),
          status: found.status || "Active",
        });
      } catch (err) {
        const message = err?.message || "Failed to load route.";
        toastError(message);
      } finally {
        setLoading(false);
      }
    };

    if (routeId != null) load();
  }, [routeId]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addWaypoint = () => {
    setForm((prev) => ({ ...prev, waypoints: [...prev.waypoints, ""] }));
  };

  const updateWaypoint = (index, value) => {
    setForm((prev) => ({
      ...prev,
      waypoints: prev.waypoints.map((stop, i) => (i === index ? value : stop)),
    }));
  };

  const removeWaypoint = (index) => {
    setForm((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index),
    }));
  };

  const clearWaypoints = () => {
    setForm((prev) => ({ ...prev, waypoints: [] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateRoute({
        route_ID: Number(routeId),
        ...form,
        waypoints:
          form.post_type === "REGION"
            ? []
            : form.waypoints.map((stop) => stop.trim()).filter(Boolean),
        vehicle_plate: form.vehicle_plate ? String(form.vehicle_plate).trim() : undefined,
      });
      setSuccess(true);
      toastSuccess("Route updated", { description: "Route changes were saved successfully." });
      onSaved?.();
    } catch (err) {
      const message = err?.message || "Failed to update route.";
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cr-page">
      <div className={`cr-card ${mounted ? "cr-card--visible" : ""}`}>
        <div className="cr-header">
          <button className="cr-back" onClick={onBack} type="button">
            <ArrowLeft size={18} />
          </button>
          <h2 className="cr-title">Update Route</h2>
          <ThemeToggle />
        </div>

        <form onSubmit={handleSave} noValidate>
          {loading ? <div className="cr-msg-error">Loading route...</div> : null}

          {!loading ? (
            <>
              <div className="cr-section-label">
                <span className="cr-dot" />
                Route Information
              </div>

              <div className="cr-field">
                <label className="cr-label">Route Name</label>
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>

              <div className="cr-field">
                <label className="cr-label">Post Type</label>
                <div className="cr-segmented">
                  <button type="button" className={`cr-segment-btn ${form.post_type === "ORIGIN_DESTINATION" ? "active" : ""}`} onClick={() => updateField("post_type", "ORIGIN_DESTINATION")}>Origin / Destination</button>
                  <button type="button" className={`cr-segment-btn ${form.post_type === "REGION" ? "active" : ""}`} onClick={() => updateField("post_type", "REGION")}>Region</button>
                </div>
              </div>

              <div className="cr-field">
                <label className="cr-label">Date Type</label>
                <div className="cr-segmented">
                  <button type="button" className={`cr-segment-btn ${form.date_type === "DAY" ? "active" : ""}`} onClick={() => updateField("date_type", "DAY")}>Day</button>
                  <button type="button" className={`cr-segment-btn ${form.date_type === "INTERVAL" ? "active" : ""}`} onClick={() => updateField("date_type", "INTERVAL")}>Interval</button>
                </div>
              </div>

              <div className="cr-field cr-date-grid">
                <div>
                  <label className="cr-label">Date</label>
                  <input value={form.date} onChange={(e) => updateField("date", e.target.value)} />
                </div>
                <div>
                  <label className="cr-label">Vehicle Plate</label>
                  <input value={form.vehicle_plate} onChange={(e) => updateField("vehicle_plate", e.target.value)} />
                </div>
              </div>

              <div className="cr-field cr-date-grid">
                <div>
                  <label className="cr-label">Interval Start</label>
                  <input value={form.interval_start} onChange={(e) => updateField("interval_start", e.target.value)} />
                </div>
                <div>
                  <label className="cr-label">Interval End</label>
                  <input value={form.interval_end} onChange={(e) => updateField("interval_end", e.target.value)} />
                </div>
              </div>

              <div className="cr-field">
                <label className="cr-label">Origin</label>
                <input value={form.origin} onChange={(e) => updateField("origin", e.target.value)} />
              </div>

              <div className="cr-field">
                <label className="cr-label">Destination</label>
                <input value={form.destination} onChange={(e) => updateField("destination", e.target.value)} />
              </div>

              {form.post_type === "ORIGIN_DESTINATION" ? (
                <div className="cr-field">
                  <div className="cr-stops-header">
                    <label className="cr-label cr-stops-title">WAYPOINTS &amp; STOPS</label>
                    <button
                      type="button"
                      className="cr-stops-clear"
                      onClick={clearWaypoints}
                      disabled={form.waypoints.length === 0}
                    >
                      Clear All
                    </button>
                  </div>
                  {form.waypoints.map((stop, index) => (
                    <div className="cr-stop-card" key={`edit-waypoint-${index}`}>
                      <div className="cr-stop-main">
                        <span className="cr-stop-tag cr-stop-tag--waypoint">Stop {index + 1}</span>
                        <input
                          type="text"
                          className="cr-stop-input"
                          placeholder="Enter stop"
                          value={stop}
                          onChange={(e) => updateWaypoint(index, e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="cr-stop-remove"
                        onClick={() => removeWaypoint(index)}
                        aria-label={`Remove stop ${index + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="cr-add-stop-btn" onClick={addWaypoint}>
                    <Plus size={18} />
                    Add Stop
                  </button>
                </div>
              ) : null}

              <div className="cr-field">
                <label className="cr-label">Region</label>
                <input value={form.region} onChange={(e) => updateField("region", e.target.value)} />
              </div>

              <div className="cr-field">
                <label className="cr-label">Status</label>
                <input value={form.status} onChange={(e) => updateField("status", e.target.value)} />
              </div>
            </>
          ) : null}

          {success ? <div className="cr-msg-success">Route updated successfully!</div> : null}

          <button className="cr-submit-btn" type="submit" disabled={saving || loading}>
            {saving ? "Saving..." : "Save Changes"}
            {!saving && <Save size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
