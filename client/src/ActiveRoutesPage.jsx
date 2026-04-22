import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ConfirmDialog from "./ConfirmDialog";
import { deleteRoute, getMyRoutes } from "./services/routeService";
import { toastError, toastSuccess } from "./services/toastService";
import "./Routes.css";
import "./ActiveManage.css";

const isActiveRoute = (status) => String(status || "active").toLowerCase().includes("active");

export default function ActiveRoutesPage({ onBack, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!error) return;
    toastError(error);
  }, [error]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyRoutes();
        const normalized = data.map((item) => ({
          ...item,
          id: item?.route_ID || item?.id,
          name: item?.name || "Unnamed route",
        }));
        setItems(normalized.filter((item) => isActiveRoute(item?.status)));
      } catch (err) {
        setError(err?.message || "Failed to load active routes.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sortedItems = useMemo(() => [...items].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0)), [items]);

  const handleDelete = async () => {
    if (!confirmTarget?.id) return;
    setBusyId(confirmTarget.id);
    try {
      await deleteRoute(confirmTarget.id);
      setItems((prev) => prev.filter((item) => item.id !== confirmTarget.id));
      setConfirmTarget(null);
      toastSuccess("Route deleted");
    } catch (err) {
      setError(err?.message || "Failed to delete route.");
    } finally {
      setBusyId(null);
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
            <h1>Active Routes</h1>
            <p>Manage your active route posts.</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="am-body">
          {error ? <div className="am-state">{error}</div> : null}
          {loading ? (
            <div className="am-state">Loading...</div>
          ) : sortedItems.length === 0 ? (
            <div className="am-state">No active routes found.</div>
          ) : (
            <div className="am-list">
              {sortedItems.map((item) => (
                <article className="sh-card am-card-item" key={item.id}>
                  <div className="sh-card-top">
                    <div className="sh-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="#9ca3af" strokeWidth="2" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="sh-card-info">
                      <span className="sh-card-name">{item.name}</span>
                      <span className="sh-card-time">Route #{item.id}</span>
                    </div>

                    <button
                      className="am-menu-btn am-menu-btn--floating"
                      type="button"
                      onClick={() => setOpenMenuId((prev) => (prev === item.id ? null : item.id))}
                      disabled={busyId === item.id}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === item.id && (
                      <div className="am-actions-menu" ref={menuRef}>
                        <button className="am-actions-item" type="button" onClick={() => onNavigate("editActiveRoute", { activeRouteId: item.id, from: "activeRoutes" })}>
                          <Pencil size={18} /> Update
                        </button>
                        <button className="am-actions-item" type="button" onClick={() => onNavigate("routeDetails", { routeId: item.id, from: "activeRoutes" })}>
                          <Eye size={18} /> View Details
                        </button>
                        <button className="am-actions-item am-actions-item--delete" type="button" onClick={() => setConfirmTarget(item)}>
                          <Trash2 size={18} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sh-card-footer">
                    <div className="sh-card-tags">
                      <span className="sh-tag">Status: {item.status || "active"}</span>
                      <span className="sh-tag">Type: {item.post_type || "ORIGIN_DESTINATION"}</span>
                      {item.vehicle_plate != null ? <span className="sh-tag">Plate: {item.vehicle_plate}</span> : null}
                      {item.date ? <span className="sh-tag">Date: {item.date}</span> : null}
                    </div>
                  </div>

                  <p className="am-card-description">
                    {String(item.more_Information || item.description || item.notes || "No description provided.")}
                  </p>
                  <div className="sh-card-route">
                    {item.post_type === "REGION" ? (
                      <div className="sh-route-row">
                        <span className="sh-route-dot sh-route-dot--green" />
                        <div>
                          <span className="sh-route-label">REGION</span>
                          <span className="sh-route-val">{item.region || "Region not specified"}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="sh-route-row">
                          <span className="sh-route-dot sh-route-dot--green" />
                          <div>
                            <span className="sh-route-label">ORIGIN</span>
                            <span className="sh-route-val">{item.origin || "Origin not specified"}</span>
                          </div>
                        </div>
                        <div className="sh-route-row">
                          <span className="sh-route-dot sh-route-dot--gray" />
                          <div>
                            <span className="sh-route-label">DESTINATION</span>
                            <span className="sh-route-val">{item.destination || "Destination not specified"}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="am-row-meta">
                    {item.interval_start ? <span className="am-chip">From: {item.interval_start}</span> : null}
                    {item.interval_end ? <span className="am-chip">To: {item.interval_end}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="Delete Route"
        message={confirmTarget ? `Delete route #${confirmTarget.id}?` : ""}
        confirmLabel="Yes"
        cancelLabel="No"
        loading={busyId === confirmTarget?.id}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
