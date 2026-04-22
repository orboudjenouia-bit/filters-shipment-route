import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { getPublicProfile } from "./services/profileService";
import { toastError } from "./services/toastService";
import { resolveMediaUrl } from "./utils/media";
import "./Shipmentdetails.css";
import "./PublicProfilePage.css";

const AvatarPlaceholder = () => (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: "50%",
      background: "rgba(34, 197, 94, 0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="#16a34a" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

export default function PublicProfilePage({ userId, onBack }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!error) return;
    toastError(error);
  }, [error]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getPublicProfile(userId);
        if (!isMounted) return;
        setProfile(result);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load profile");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (userId != null) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <div className="sd-screen">
      <div className={`sd-container ${mounted ? "sd-container--visible" : ""}`}>
        <div className="sd-header">
          <button className="sd-back-btn" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="sd-title">User Profile</h2>
          <ThemeToggle />
        </div>

        <div className="sd-body">
          {loading ? <div className="sd-id-row"><h1 className="sd-id">Loading profile...</h1></div> : null}
          {!loading && error ? <div className="sd-id-row"><h1 className="sd-id">{error}</h1></div> : null}

          {!loading && !error && profile ? (
            <>
              <div className="pp-hero-avatar-wrap">
                {profile?.profile_Photo ? (
                  <img
                    src={resolveMediaUrl(profile.profile_Photo)}
                    alt={profile.displayName}
                    className="pp-hero-avatar"
                  />
                ) : (
                  <AvatarPlaceholder />
                )}
              </div>

              <div className="sd-sender-card" style={{ marginBottom: 16 }}>
                <div className="sd-sender-avatar">
                  {profile?.profile_Photo ? (
                    <img
                      src={resolveMediaUrl(profile.profile_Photo)}
                      alt={profile.displayName}
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
                  <span className="sd-sender-label">NAME</span>
                  <span className="sd-sender-name">{profile.displayName}</span>
                </div>
                <button className="sd-msg-btn pp-type-pill" type="button" aria-label="Type">
                  {String(profile?.type || "USER")}
                </button>
              </div>

              <div className="pp-cards-grid">
                <div className="pp-info-card">
                  <div className="pp-info-top">
                    <span className="pp-info-label">EMAIL</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <p className="pp-info-value">{profile.email || "Not shared"}</p>
                </div>

                <div className="pp-info-card">
                  <div className="pp-info-top">
                    <span className="pp-info-label">PHONE</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L9.1 10.6a16 16 0 0 0 4.3 4.3l1.15-1.18a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="pp-info-value">{profile.phone || "Not shared"}</p>
                </div>

                <div className="pp-info-card">
                  <div className="pp-info-top">
                    <span className="pp-info-label">LOCATION</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22s7-7.75 7-13a7 7 0 1 0-14 0c0 5.25 7 13 7 13z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <p className="pp-info-value">{profile.location || "Not shared"}</p>
                </div>

                <div className="pp-info-card">
                  <div className="pp-info-top">
                    <span className="pp-info-label">WORKING TIME</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="pp-info-value">{profile.working_Time || "Not shared"}</p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
