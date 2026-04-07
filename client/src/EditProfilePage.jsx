import { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile } from "./services/profileService";
import { uploadPhoto } from "./services/uploadService";
import { resolveMediaUrl } from "./utils/media";
import ThemeToggle from "./ThemeToggle";
import "./EPPages.css";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function AvatarPlaceholder() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#f5f5f5" />
      <circle cx="50" cy="38" r="17" fill="#b3b3b3" />
      <path d="M16 87c5-16 19-24 34-24s29 8 34 24" fill="#b3b3b3" />
    </svg>
  );
}

export default function EditProfilePage({ onBack }) {
  const photoInputRef = useRef(null);
  const [meta, setMeta] = useState({
    id: null,
    type: "INDIVIDUAL",
    profilePhoto: "",
  });
  const [form, setForm] = useState({
    profileKind: "individual",
    fullName: "",
    phone: "",
    email: "",
    location: "",
    nin: "",
    businessName: "",
    rcNumber: "",
    legalForm: "",
    nif: "",
    nis: "",
    businessLocation: "",
    workingTime: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ kind: "", text: "" });

  const triggerPhotoPicker = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ kind: "error", text: "Please choose a valid image file" });
      return;
    }

    try {
      const uploadedPath = await uploadPhoto(file);
      if (!uploadedPath) {
        setStatus({ kind: "error", text: "Unable to upload selected image" });
        return;
      }

      setMeta((prev) => ({ ...prev, profilePhoto: uploadedPath }));
      setStatus({ kind: "success", text: "New profile photo uploaded" });
    } catch {
      setStatus({ kind: "error", text: "Unable to upload selected image" });
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const profile = await getMyProfile();
        if (!isMounted) return;

        const userType = String(profile?.type || "INDIVIDUAL").toUpperCase();
        const isBusiness = userType === "BUSINESS";
        const businessLocations = Array.isArray(profile?.business?.locations)
          ? profile.business.locations
          : [];
        const businessLocationText = businessLocations
          .map((value) => String(value || "").trim())
          .filter(Boolean)
          .join(", ");

        setMeta({
          id: Number(profile?.id) || null,
          type: userType,
          profilePhoto: typeof profile?.profile_Photo === "string" ? profile.profile_Photo.trim() : "",
        });

        setForm({
          profileKind: isBusiness ? "business" : "individual",
          fullName: profile?.individual?.full_Name || "",
          phone: profile?.phone || "",
          email: profile?.email || "",
          location: profile?.individual?.location || businessLocationText || businessLocations[0] || "",
          nin: profile?.individual?.nin || "",
          businessName: profile?.business?.business_Name || "",
          rcNumber: profile?.business?.rc_Number || "",
          legalForm: profile?.business?.form || "",
          nif: profile?.business?.nif != null ? String(profile.business.nif) : "",
          nis: profile?.business?.nis != null ? String(profile.business.nis) : "",
          businessLocation: businessLocationText || businessLocations[0] || "",
          workingTime: profile?.working_Time || "",
        });
      } catch {
        if (!isMounted) return;
        setStatus({ kind: "error", text: "Failed to load your profile" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!meta.id || saving) return;

    setSaving(true);
    setStatus({ kind: "", text: "" });

    try {
      const selectedType = form.profileKind === "business" ? "BUSINESS" : "INDIVIDUAL";

      if (selectedType !== meta.type) {
        setStatus({ kind: "error", text: "Profile type cannot be changed for this account" });
        setSaving(false);
        return;
      }

      const businessLocation = form.businessLocation.trim();

      const profilePayload = selectedType === "BUSINESS"
        ? {
            ...(form.businessName ? { business_Name: form.businessName } : {}),
            ...(form.rcNumber ? { rc_Number: form.rcNumber } : {}),
            ...(form.legalForm ? { form: form.legalForm } : {}),
            ...(form.nif ? { nif: Number(form.nif) } : {}),
            ...(form.nis ? { nis: Number(form.nis) } : {}),
            ...(businessLocation ? { locations: [businessLocation] } : {}),
          }
        : {
            ...(form.fullName ? { full_Name: form.fullName } : {}),
            ...(form.nin ? { nin: form.nin } : {}),
            ...(form.location ? { location: form.location } : {}),
          };

      await updateMyProfile({
        user: {
          id: meta.id,
          type: selectedType,
          ...(form.phone ? { phone: form.phone } : {}),
          ...(form.workingTime ? { working_Time: form.workingTime } : {}),
          ...(meta.profilePhoto ? { profile_Photo: meta.profilePhoto } : {}),
        },
        profile: profilePayload,
      });

      setStatus({ kind: "success", text: "Profile updated successfully" });
    } catch {
      setStatus({ kind: "error", text: "Unable to update profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "var(--bg-primary)", display: "flex", justifyContent: "center", transition: "background 0.3s" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh" }}>
        <div className="screen-card">
          <div className="screen-header">
            <div className="screen-header-left">
              <button className="back-btn" onClick={onBack} type="button"><BackIcon /></button>
              <span className="screen-title">Edit Profile</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="ep-body">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="ep-hidden-file"
              onChange={handlePhotoChange}
            />

            <div className="ep-avatar-wrap">
              <div className="ep-avatar-ring">
                <button
                  className="ep-avatar-img"
                  type="button"
                  onClick={triggerPhotoPicker}
                  aria-label="Change profile photo"
                >
                  {meta.profilePhoto ? (
                    <img src={resolveMediaUrl(meta.profilePhoto)} alt="profile" className="ep-avatar-photo" />
                  ) : (
                    <AvatarPlaceholder />
                  )}
                </button>
                <button className="ep-camera-btn" type="button" aria-label="Profile photo" onClick={triggerPhotoPicker}><CameraIcon /></button>
              </div>
            </div>

            <div className="ep-fields">
              <div className="ep-field">
                <label>Profile Type</label>
                <div className="ep-segmented">
                  <button
                    type="button"
                    className={`ep-segment-btn ${form.profileKind === "individual" ? "active" : ""}`}
                    onClick={() => setForm((prev) => ({ ...prev, profileKind: "individual" }))}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    className={`ep-segment-btn ${form.profileKind === "business" ? "active" : ""}`}
                    onClick={() => setForm((prev) => ({ ...prev, profileKind: "business" }))}
                  >
                    Business
                  </button>
                </div>
              </div>

              {[
                { label: "Phone Number", key: "phone", placeholder: "e.g. 0561 89 24 36" },
                { label: "Email Address", key: "email", placeholder: "e.g. os_bouanani@esi.dz", readOnly: true },
                { label: "Working Time (HH:MM-HH:MM)", key: "workingTime", placeholder: "e.g. 08:00-18:00" },
              ].map((f) => (
                <div className="ep-field" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    readOnly={Boolean(f.readOnly)}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}

              {form.profileKind === "business" ? (
                <>
                  {[
                    { label: "Business Name", key: "businessName", placeholder: "e.g. Wesselli Logistics" },
                    { label: "RC Number", key: "rcNumber", placeholder: "e.g. RC-123456" },
                    { label: "Legal Form", key: "legalForm", placeholder: "e.g. SARL" },
                    { label: "NIF", key: "nif", placeholder: "e.g. 123456789" },
                    { label: "NIS", key: "nis", placeholder: "e.g. 987654321" },
                    { label: "Location", key: "businessLocation", placeholder: "e.g. Algiers" },
                  ].map((f) => (
                    <div className="ep-field" key={f.key}>
                      <label>{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: "Full Name", key: "fullName", placeholder: "e.g. Bouanani Sohaib" },
                    { label: "NIN", key: "nin", placeholder: "e.g. 123456789012345678" },
                    { label: "Current Location", key: "location", placeholder: "e.g. Algiers, Oued Smar" },
                  ].map((f) => (
                    <div className="ep-field" key={f.key}>
                      <label>{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>

            {loading && <div className="ep-loading">Loading...</div>}

            {!!status.text && !loading && (
              <div className={`ep-toast ${status.kind}`} role="status" aria-live="polite">
                <span className="ep-toast-dot" />
                <span>{status.text}</span>
              </div>
            )}

            <button className="ep-confirm-btn" type="button" onClick={handleSave} disabled={loading || saving}>
              {saving ? "Saving..." : "Confirm Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
