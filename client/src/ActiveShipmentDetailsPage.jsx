import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ConfirmDialog from "./ConfirmDialog";
import { deleteShipment, getShipments } from "./services/shipmentService";
import "./ActiveManage.css";

export default function ActiveShipmentDetailsPage({ shipmentId, onBack, onNavigate }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await getShipments();
        const found = list.find((it) => String(it?.shipment_ID || it?.id) === String(shipmentId));
        setItem(found || null);
        if (!found) setError("Shipment not found.");
      } catch (err) {
        setError(err?.message || "Failed to load shipment details.");
      } finally {
        setLoading(false);
      }
    };

    if (shipmentId != null) load();
  }, [shipmentId]);

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await deleteShipment(item.shipment_ID || item.id);
      onNavigate?.("activeShipments");
    } catch (err) {
      setError(err?.message || "Failed to delete shipment.");
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="am-page">
      <div className="am-card">
        <header className="am-header">
          <button className="am-back" onClick={onBack} type="button">
            <ArrowLeft size={18} />
          </button>
          <div className="am-headtext">
            <h1>Shipment Details</h1>
            <p>Review and manage this active shipment.</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="am-body">
          {loading ? <div className="am-state">Loading...</div> : null}
          {!loading && error ? <div className="am-state">{error}</div> : null}
          {!loading && item ? (
            <>
              <div className="am-detail">
                <div className="am-detail-item"><b>ID</b><span>{item.shipment_ID || item.id}</span></div>
                <div className="am-detail-item"><b>Status</b><span>{item.status || "N/A"}</span></div>
                <div className="am-detail-item"><b>Title</b><span>{item.title || "N/A"}</span></div>
                <div className="am-detail-item"><b>Category</b><span>{item.category || "N/A"}</span></div>
                <div className="am-detail-item"><b>Origin</b><span>{item.origin || "N/A"}</span></div>
                <div className="am-detail-item"><b>Destination</b><span>{item.destination || "N/A"}</span></div>
                <div className="am-detail-item"><b>Weight</b><span>{item.weight ?? "N/A"}</span></div>
                <div className="am-detail-item"><b>Volume</b><span>{item.volume ?? "N/A"}</span></div>
                <div className="am-detail-item"><b>Date</b><span>{item.date || "N/A"}</span></div>
                <div className="am-detail-item"><b>Time</b><span>{item.time || "N/A"}</span></div>
              </div>

              <div className="am-actions">
                <button className="am-btn am-btn-edit" type="button" onClick={() => onNavigate("editActiveShipment", { activeShipmentId: item.shipment_ID || item.id, from: "activeShipmentDetails" })}>
                  <Pencil size={13} /> Update
                </button>
                <button className="am-btn am-btn-delete" type="button" onClick={() => setConfirmDeleteOpen(true)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Shipment"
        message={item ? `Delete shipment #${item.shipment_ID || item.id}?` : ""}
        confirmLabel="Yes"
        cancelLabel="No"
        loading={deleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
