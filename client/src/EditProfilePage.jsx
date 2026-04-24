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
    businessLocations: [""],
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
          location: profile?.individual?.location || businessLocations[0] || "",
          nin: profile?.individual?.nin || "",
          businessName: profile?.business?.business_Name || "",
          rcNumber: profile?.business?.rc_Number || "",
          legalForm: profile?.business?.form || "",
          nif: profile?.business?.nif != null ? String(profile.business.nif) : "",
          nis: profile?.business?.nis != null ? String(profile.business.nis) : "",
          businessLocations:
            businessLocations.length > 0
              ? businessLocations.map((value) => String(value || ""))
              : [""],
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

      const normalizedBusinessLocations = Array.isArray(form.businessLocations)
        ? form.businessLocations.map((value) => String(value || "").trim()).filter(Boolean)
        : [];

      if (selectedType === "BUSINESS") {
        if (form.nif && !/^\d{15}$/.test(form.nif)) {
          setStatus({ kind: "error", text: "NIF must contain exactly 15 digits" });
          setSaving(false);
          return;
        }

        if (form.nis && !/^\d{15}$/.test(form.nis)) {
          setStatus({ kind: "error", text: "NIS must contain exactly 15 digits" });
          setSaving(false);
          return;
        }

        if (form.rcNumber && !/^\d{2}-[AB]-\d{7}$/i.test(form.rcNumber.trim())) {
          setStatus({ kind: "error", text: "RC Number format must be 00-A-0000000 or 00-B-0000000" });
          setSaving(false);
          return;
        }

        if (normalizedBusinessLocations.length === 0) {
          setStatus({ kind: "error", text: "At least one business location is required" });
          setSaving(false);
          return;
        }
      }

      if (selectedType === "INDIVIDUAL" && form.nin && !/^\d{18}$/.test(form.nin)) {
        setStatus({ kind: "error", text: "NIN must contain exactly 18 digits" });
        setSaving(false);
        return;
      }

      const profilePayload = selectedType === "BUSINESS"
        ? {
            ...(form.businessName ? { business_Name: form.businessName } : {}),
            ...(form.rcNumber ? { rc_Number: form.rcNumber.trim().toUpperCase() } : {}),
            ...(form.legalForm ? { form: form.legalForm } : {}),
            ...(form.nif ? { nif: form.nif } : {}),
            ...(form.nis ? { nis: form.nis } : {}),
            ...(normalizedBusinessLocations.length > 0 ? { locations: normalizedBusinessLocations } : {}),
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
                    { label: "NIF", key: "nif", placeholder: "15-digit NIF" },
                    { label: "NIS", key: "nis", placeholder: "15-digit NIS" },
                  ].map((f) => (
                    <div className="ep-field" key={f.key}>
                      <label>{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (f.key === "nif" || f.key === "nis") {
                            setForm((p) => ({ ...p, [f.key]: value.replace(/\D/g, "").slice(0, 15) }));
                            return;
                          }

                          if (f.key === "rcNumber") {
                            setForm((p) => ({ ...p, [f.key]: value.toUpperCase() }));
                            return;
                          }

                          setForm((p) => ({ ...p, [f.key]: value }));
                        }}
                      />
                    </div>
                  ))}

                  <div className="ep-field">
                    <label>Business Locations</label>
                    {form.businessLocations.map((location, index) => (
                      <div className="ep-row" key={`business-location-${index}`}>
                        <input
                          type="text"
                          placeholder={index === 0 ? "Main location" : `Location ${index + 1}`}
                          value={location}
                          onChange={(e) => {
                            const next = form.businessLocations.map((item, i) =>
                              i === index ? e.target.value : item
                            );
                            setForm((p) => ({ ...p, businessLocations: next }));
                          }}
                        />
                        <button
                          type="button"
                          className="ep-mini-btn"
                          onClick={() => {
                            const next = form.businessLocations.filter((_, i) => i !== index);
                            setForm((p) => ({
                              ...p,
                              businessLocations: next.length > 0 ? next : [""],
                            }));
                          }}
                          disabled={form.businessLocations.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="ep-mini-btn ep-mini-btn--add"
                      onClick={() => {
                        setForm((p) => ({ ...p, businessLocations: [...p.businessLocations, ""] }));
                      }}
                    >
                      Add Location
                    </button>
                  </div>
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
                        onChange={(e) => {
                          if (f.key === "nin") {
                            setForm((p) => ({ ...p, nin: e.target.value.replace(/\D/g, "").slice(0, 18) }));
                            return;
                          }

                          setForm((p) => ({ ...p, [f.key]: e.target.value }));
                        }}
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
