import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ConfirmDialog from "./ConfirmDialog";
import {
  deleteSubscription,
  getMySubscription,
  getSubscriptionById,
  updateSubscription,
} from "./services/subscriptionService";
import { SUBSCRIPTION_PLANS } from "./subscriptionPlansData";
import "./SubscriptionDetailsPage.css";

const TIERS = ["Free", "Individual", "Business"];

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toIsoOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

const buildProgressData = (startDateValue, endDateValue) => {
  const start = new Date(startDateValue);
  const end = new Date(endDateValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      elapsedPercent: 0,
      remainingPercent: 0,
      remainingLabel: "Timeline unavailable",
    };
  }

  const totalMs = Math.max(end.getTime() - start.getTime(), 0);
  if (totalMs === 0) {
    return {
      elapsedPercent: 100,
      remainingPercent: 0,
      remainingLabel: "Ended",
    };
  }

  const now = Date.now();
  const elapsedMs = Math.min(Math.max(now - start.getTime(), 0), totalMs);
  const remainingMs = Math.max(end.getTime() - now, 0);

  const elapsedPercent = Math.round((elapsedMs / totalMs) * 100);
  const remainingPercent = Math.max(100 - elapsedPercent, 0);
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  return {
    elapsedPercent,
    remainingPercent,
    remainingLabel: remainingMs <= 0 ? "Ended" : `${remainingDays} day${remainingDays === 1 ? "" : "s"} left`,
  };
};

export default function SubscriptionDetailsPage({ subId, isAdmin = false, onBack, onNavigate }) {
  const [mounted, setMounted] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [tier, setTier] = useState("Free");
  const [isActive, setIsActive] = useState(true);
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const resolvedTitle = useMemo(
    () => (isAdmin ? "Subscription Details (Admin)" : "My Subscription Details"),
    [isAdmin]
  );

  const progressData = useMemo(
    () => buildProgressData(subscription?.startDate, subscription?.endDate),
    [subscription?.startDate, subscription?.endDate]
  );

  const currentPlanFeatures = useMemo(() => {
    const currentTier = String(subscription?.tier || "").toLowerCase();
    const matchedPlan = SUBSCRIPTION_PLANS.find(
      (plan) => String(plan.tier || "").toLowerCase() === currentTier
    );
    return Array.isArray(matchedPlan?.features) ? matchedPlan.features : [];
  }, [subscription?.tier]);

  const loadDetails = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = subId ? await getSubscriptionById(subId) : await getMySubscription();
      const sub = data || null;
      setSubscription(sub);
      setTier(String(sub?.tier || "Free"));
      setIsActive(Boolean(sub?.isActive));
      setEndDate(toDateInputValue(sub?.endDate));
    } catch (err) {
      setError(err?.message || "Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [subId]);

  const handleUpdate = async () => {
    if (!isAdmin) return;
    if (!subscription?.sub_ID) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updated = await updateSubscription(subscription.sub_ID, {
        tier,
        isActive,
        endDate: toIsoOrNull(endDate),
      });

      setSubscription(updated);
      setSuccessMessage("Subscription updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update subscription.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subscription?.sub_ID) return;

    setDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteSubscription(subscription.sub_ID);
      setSuccessMessage("Subscription deleted successfully.");
      if (isAdmin) {
        onNavigate?.("adminSubscriptions");
      } else {
        onNavigate?.("subscription");
      }
    } catch (err) {
      setError(err?.message || "Failed to delete subscription.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="subd-screen">
      <div className={`subd-container ${mounted ? "subd-container--visible" : ""}`}>
        <div className="subd-header">
          <button className="subd-back-btn" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="subd-title">{resolvedTitle}</h2>
          <ThemeToggle />
        </div>

        <div className="subd-body">
          {loading ? (
            <div className="subd-id-row">
              <h1 className="subd-id">Loading subscription...</h1>
            </div>
          ) : error ? (
            <div className="subd-id-row">
              <h1 className="subd-id">{error}</h1>
            </div>
          ) : !subscription ? (
            <div className="subd-id-row">
              <h1 className="subd-id">No subscription found.</h1>
            </div>
          ) : (
            <>
              <div className="subd-id-row">
                <div>
                  <h1 className="subd-id">#SUB-{subscription.sub_ID}</h1>
                  <p className="subd-type">Plan: {subscription.tier}</p>
                </div>
                <span className="subd-status-badge">
                  {subscription.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="subd-info-row">
                <div className="subd-info-card">
                  <span className="subd-info-label">USER</span>
                  <span className="subd-info-val">ID: {subscription.user_ID}</span>
                </div>
                <div className="subd-info-card">
                  <span className="subd-info-label">TIER</span>
                  <span className="subd-info-val">{subscription.tier}</span>
                </div>
              </div>

              <div className="subd-features-card">
                <h3 className="subd-features-title">Plan Features</h3>
                {currentPlanFeatures.length === 0 ? (
                  <p className="subd-features-empty">No features available for this tier.</p>
                ) : (
                  <ul className="subd-features-list">
                    {currentPlanFeatures.map((feature) => (
                      <li key={feature} className="subd-feature-item">
                        <span className="subd-feature-check">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="subd-progress-card">
                <div className="subd-progress-dates">
                  <div>
                    <span className="subd-progress-label">START DATE</span>
                    <span className="subd-progress-date">{formatDate(subscription.startDate)}</span>
                  </div>
                  <div className="subd-progress-right">
                    <span className="subd-progress-label">END DATE</span>
                    <span className="subd-progress-date">{formatDate(subscription.endDate)}</span>
                  </div>
                </div>

                <div className="subd-progress-track" aria-label="subscription timeline progress">
                  <div
                    className="subd-progress-elapsed"
                    style={{ width: `${progressData.elapsedPercent}%` }}
                  />
                  <div
                    className="subd-progress-remaining"
                    style={{ width: `${progressData.remainingPercent}%` }}
                  />
                </div>

                <p className="subd-progress-meta">{progressData.remainingLabel}</p>
              </div>

              {isAdmin && (
                <div className="subd-edit-card">
                  <h3 className="subd-edit-title">Admin Controls</h3>
                  <div className="subd-edit-grid">
                    <label>
                      <span>Tier</span>
                      <select value={tier} onChange={(e) => setTier(e.target.value)}>
                        {TIERS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Status</span>
                      <select
                        value={isActive ? "active" : "inactive"}
                        onChange={(e) => setIsActive(e.target.value === "active")}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>

                    <label className="subd-edit-full">
                      <span>End Date</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {successMessage ? <div className="subd-success">{successMessage}</div> : null}

              <div className="subd-actions">
                {isAdmin && (
                  <button
                    type="button"
                    className="subd-btn subd-btn-primary"
                    onClick={handleUpdate}
                    disabled={saving || deleting}
                  >
                    {saving ? "Saving..." : "Update Subscription"}
                  </button>
                )}

                <button
                  type="button"
                  className="subd-btn subd-btn-danger"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={saving || deleting}
                >
                  {deleting ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Subscription
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription?"
        confirmLabel="Yes"
        cancelLabel="No"
        loading={deleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await handleDelete();
          setConfirmDeleteOpen(false);
        }}
      />
    </div>
  );
}
