import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { getShipments, updateShipment } from "./services/shipmentService";
import { toastError, toastSuccess } from "./services/toastService";
import "./Createshipment.css";

const categories = ["Electronics", "Furniture", "Apparel", "Food & Beverages", "Machinery", "Documents", "Other"];

export default function EditActiveShipmentPage({ shipmentId, onBack, onSaved }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    origin: "",
    destination: "",
    volume: "",
    weight: "",
    date: "",
    time: "",
    priority: "Normal",
    special_Information: "",
    status: "In-Stock",
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getShipments();
        const found = list.find((it) => String(it?.shipment_ID || it?.id) === String(shipmentId));
        if (!found) {
          toastError("Shipment not found.");
          return;
        }

        setForm({
          title: found.title || "",
          category: found.category || "",
          origin: found.origin || "",
          destination: found.destination || "",
          volume: String(found.volume ?? ""),
          weight: String(found.weight ?? ""),
          date: found.date || "",
          time: found.time || "",
          priority: found.priority || "Normal",
          special_Information: found.special_Information || "",
          status: found.status || "In-Stock",
        });
      } catch (err) {
        const message = err?.message || "Failed to load shipment.";
        toastError(message);
      } finally {
        setLoading(false);
      }
    };

    if (shipmentId != null) load();
  }, [shipmentId]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const parsedVolume = Number(form.volume);
      const parsedWeight = Number(form.weight);

      if (!Number.isFinite(parsedVolume) || parsedVolume <= 0 || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
        toastError("Weight and volume must be positive numbers.");
        setSaving(false);
        return;
      }

      await updateShipment({
        shipment_ID: Number(shipmentId),
        ...form,
        volume: parsedVolume,
        weight: parsedWeight,
      });
      setSuccess(true);
      toastSuccess("Shipment updated", { description: "Shipment changes were saved successfully." });
      onSaved?.();
    } catch (err) {
      const message = err?.message || "Failed to update shipment.";
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cs-screen">
      <div className={`cs-container ${mounted ? "cs-container--visible" : ""}`}>
        <div className="cs-header">
          <button className="cs-back-btn" onClick={onBack} type="button">
            <ArrowLeft size={18} />
          </button>
          <h2 className="cs-title">Update Shipment</h2>
          <ThemeToggle />
        </div>

        <form className="cs-body" onSubmit={handleSave} noValidate>
          {loading ? <div className="cs-feedback cs-feedback--error">Loading shipment...</div> : null}

          {!loading ? (
            <>
              <div className="cs-section-header">
                <span className="cs-section-dot" />
                <span className="cs-section-label">SHIPMENT INFORMATION</span>
              </div>

              <div className="cs-field">
                <label className="cs-label">Shipment Title</label>
                <input className="cs-input" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
              </div>

              <div className="cs-field-row">
                <div className="cs-field cs-field--half">
                  <label className="cs-label">Category</label>
                  <div className="cs-select-wrap">
                    <select className="cs-select" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <svg className="cs-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="cs-field cs-field--half">
                  <label className="cs-label">Priority</label>
                  <select className="cs-select" value={form.priority} onChange={(e) => updateField("priority", e.target.value)}>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="cs-field-row">
                <div className="cs-field cs-field--half">
                  <label className="cs-label">Weight</label>
                  <input className="cs-input" type="number" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} />
                </div>
                <div className="cs-field cs-field--half">
                  <label className="cs-label">Volume</label>
                  <input className="cs-input" type="number" value={form.volume} onChange={(e) => updateField("volume", e.target.value)} />
                </div>
              </div>

              <div className="cs-field">
                <label className="cs-label">Description / Special Information</label>
                <textarea className="cs-input cs-textarea" value={form.special_Information} onChange={(e) => updateField("special_Information", e.target.value)} />
              </div>

              <div className="cs-section-header">
                <span className="cs-section-dot" />
                <span className="cs-section-label">LOGISTICS & SCHEDULE</span>
              </div>

              <div className="cs-field">
                <label className="cs-label">Pickup Location</label>
                <input className="cs-input" value={form.origin} onChange={(e) => updateField("origin", e.target.value)} />
              </div>

              <div className="cs-field">
                <label className="cs-label">Delivery Location</label>
                <input className="cs-input" value={form.destination} onChange={(e) => updateField("destination", e.target.value)} />
              </div>

              <div className="cs-field-row">
                <div className="cs-field cs-field--half">
                  <label className="cs-label">Date</label>
                  <input className="cs-input" value={form.date} onChange={(e) => updateField("date", e.target.value)} />
                </div>
                <div className="cs-field cs-field--half">
                  <label className="cs-label">Time</label>
                  <input className="cs-input" value={form.time} onChange={(e) => updateField("time", e.target.value)} />
                </div>
              </div>

              <div className="cs-field">
                <label className="cs-label">Status</label>
                <select className="cs-select" value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                  <option value="In-Stock">In-Stock</option>
                  <option value="In-Delivery">In-Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </>
          ) : null}
        </form>

        <div className="cs-footer">
          {success ? <div className="cs-feedback cs-feedback--success">Shipment updated successfully!</div> : null}
          <button className="cs-submit-btn" type="button" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
