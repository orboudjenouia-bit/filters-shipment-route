import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ConfirmDialog from "./ConfirmDialog";
import {
  deleteSubscription,
  listSubscriptions,
  updateSubscription,
} from "./services/subscriptionService";
import "./AdminSubscriptions.css";

const FILTERS = ["all", "active", "inactive", "free", "individual", "business"];

export default function AdminSubscriptions({ onBack, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listSubscriptions();
      setItems(data.subs || []);
    } catch (err) {
      setError(err?.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    return items.filter((sub) => {
      if (filter === "all") return true;
      if (filter === "active") return Boolean(sub?.isActive);
      if (filter === "inactive") return !Boolean(sub?.isActive);
      return String(sub?.tier || "").toLowerCase() === filter;
    });
  }, [items, filter]);

  const handleQuickTierUpdate = async (sub, newTier) => {
    if (!sub?.sub_ID) return;
    setBusyId(sub.sub_ID);
    setError("");

    try {
      const updated = await updateSubscription(sub.sub_ID, {
        tier: newTier,
        isActive: Boolean(sub.isActive),
        endDate: sub.endDate || null,
      });

      setItems((prev) => prev.map((item) => (item.sub_ID === sub.sub_ID ? updated : item)));
    } catch (err) {
      setError(err?.message || "Failed to update subscription.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmTarget?.sub_ID) return;

    setBusyId(confirmTarget.sub_ID);
    setError("");

    try {
      await deleteSubscription(confirmTarget.sub_ID);
      setItems((prev) => prev.filter((item) => item.sub_ID !== confirmTarget.sub_ID));
      setConfirmTarget(null);
    } catch (err) {
      setError(err?.message || "Failed to delete subscription.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="as-page">
      <div className="as-card">
        <header className="as-header">
          <button className="as-back" onClick={onBack} type="button">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Subscriptions</h1>
            <p>View all subscriptions and perform admin actions.</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="as-filters">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={`as-filter ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {error ? <div className="as-error">{error}</div> : null}

        {loading ? (
          <div className="as-loading">
            <Loader2 size={18} className="as-spin" />
            <span>Loading subscriptions...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="as-empty">No subscriptions found.</div>
        ) : (
          <div className="as-list">
            {filteredItems.map((sub) => {
              const isBusy = busyId === sub.sub_ID;
              return (
                <article className="as-item" key={sub.sub_ID}>
                  <div className="as-main">
                    <h3>#{sub.sub_ID} · User #{sub.user_ID}</h3>
                    <p>
                      Tier: <strong>{sub.tier}</strong> · {sub.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>

                  <div className="as-actions">
                    <button
                      type="button"
                      className="as-btn"
                      onClick={() => onNavigate?.("subscriptionDetails", { subscriptionId: sub.sub_ID, from: "adminSubscriptions" })}
                    >
                      View
                    </button>

                    <select
                      value={sub.tier}
                      onChange={(e) => handleQuickTierUpdate(sub, e.target.value)}
                      disabled={isBusy}
                    >
                      <option value="Free">Free</option>
                      <option value="Individual">Individual</option>
                      <option value="Business">Business</option>
                    </select>

                    <button
                      type="button"
                      className="as-btn as-btn-edit"
                      onClick={() => onNavigate?.("subscriptionDetails", { subscriptionId: sub.sub_ID, from: "adminSubscriptions" })}
                    >
                      <Pencil size={14} />
                      Update
                    </button>

                    <button
                      type="button"
                      className="as-btn as-btn-delete"
                      onClick={() => setConfirmTarget(sub)}
                      disabled={isBusy}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="Delete Subscription"
        message={confirmTarget ? `Do you want to delete subscription #${confirmTarget.sub_ID}?` : ""}
        confirmLabel="Yes"
        cancelLabel="No"
        loading={busyId === confirmTarget?.sub_ID}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
