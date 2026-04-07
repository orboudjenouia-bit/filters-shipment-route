import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  Navigation,
  Send,
  FileText,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { createRoute } from "./services/routeService";
import { getVehicles } from "./services/profileService";
import { uploadPhoto } from "./services/uploadService";
import "./Createroute.css";

export default function CreateRoute() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    routeName: "",
    vehicle: "",
    postType: "originDestination",
    region: "",
    startLocation: "",
    endLocation: "",
    waypoints: [],
    dateMode: "day",
    dayDate: "",
    intervalStart: "",
    intervalEnd: "",
    description: "",
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchVehicles = async () => {
      setVehiclesLoading(true);

      try {
        const data = await getVehicles();
        const list = Array.isArray(data?.vehicles) ? data.vehicles : [];

        if (!isMounted) return;
        setVehicles(
          list.map((vehicle, index) => ({
            value:
              vehicle?.plate_Number ||
              vehicle?.plate ||
              vehicle?.id ||
              String(index + 1),
            label:
              vehicle?.vehicle_Name ||
              vehicle?.model ||
              vehicle?.name ||
              `Vehicle ${index + 1}`,
          }))
        );
      } catch {
        if (!isMounted) return;
        setVehicles([]);
      } finally {
        if (isMounted) {
          setVehiclesLoading(false);
        }
      }
    };

    fetchVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

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

  const handlePhotosChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotos(files.slice(0, 5));
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.routeName || !form.vehicle) {
      showError("Please fill in all required fields.");
      return;
    }

    if (form.postType === "originDestination" && (!form.startLocation || !form.endLocation)) {
      showError("Please provide both origin and destination.");
      return;
    }

    if (form.postType === "region" && !form.region) {
      showError("Please provide the region.");
      return;
    }

    if (form.dateMode === "day" && !form.dayDate) {
      showError("Please select a date.");
      return;
    }

    if (form.dateMode === "interval" && (!form.intervalStart || !form.intervalEnd)) {
      showError("Please provide start and end dates.");
      return;
    }

    if (
      form.dateMode === "interval" &&
      form.intervalStart &&
      form.intervalEnd &&
      form.intervalStart > form.intervalEnd
    ) {
      showError("Interval start date must be before end date.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showError("Please login first.");
      return;
    }

    const vehiclePlate = Number(form.vehicle);
    if (!Number.isInteger(vehiclePlate)) {
      showError("Please select a valid vehicle.");
      return;
    }

    const isRegion = form.postType === "region";
    const isInterval = form.dateMode === "interval";
    const normalizedWaypoints = (form.waypoints || [])
      .map((stop) => stop.trim())
      .filter(Boolean);

    const origin = isRegion ? null : form.startLocation.trim();
    const destination = isRegion ? null : form.endLocation.trim();
    const region = isRegion ? form.region.trim() : null;
    const date = isInterval ? null : form.dayDate;

    try {
      setLoading(true);
      setError("");

      const photoData = photos[0] ? await uploadPhoto(photos[0]) : null;

      const payload = {
        name: form.routeName.trim(),
        photo: photoData,
        origin,
        destination,
        waypoints: isRegion ? [] : normalizedWaypoints,
        region,
        date,
        post_type: form.postType === "region" ? "REGION" : "ORIGIN_DESTINATION",
        date_type: form.dateMode === "interval" ? "INTERVAL" : "DAY",
        interval_start: form.dateMode === "interval" ? form.intervalStart : null,
        interval_end: form.dateMode === "interval" ? form.intervalEnd : null,
        vehicle_plate: vehiclePlate,
        more_Information: form.description.trim() || null,
      };

      const data = await createRoute(payload);
      console.log("Success:", data);
      setSuccess(true);
      setPhotos([]);
      setForm({
        routeName: "",
        vehicle: "",
        postType: "originDestination",
        region: "",
        startLocation: "",
        endLocation: "",
        waypoints: [],
        dateMode: "day",
        dayDate: "",
        intervalStart: "",
        intervalEnd: "",
        description: "",
      });
      setTimeout(() => navigate("/routes"), 2000);
    } catch (err) {
      console.error(err);
      showError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-page">
      <div className="cr-card">
        <div className="cr-header">
          <button className="cr-back" onClick={() => navigate(-1)} type="button">
            <ArrowLeft size={20} />
          </button>
          <h2 className="cr-title">Create Route</h2>
          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="cr-section-label">
            <span className="cr-dot" />
            Route Information
          </div>

          <div className="cr-field">
            <label className="cr-label" htmlFor="routeName">Route Name</label>
            <input
              id="routeName"
              type="text"
              placeholder="e.g. Daily North Supply"
              value={form.routeName}
              onChange={handleChange("routeName")}
            />
          </div>

          <div className="cr-field">
            <label className="cr-label" htmlFor="vehicle">Vehicle</label>
            <div className="cr-select-wrapper">
              <select
                id="vehicle"
                value={form.vehicle}
                onChange={handleChange("vehicle")}
                disabled={vehiclesLoading || vehicles.length === 0}
              >
                {vehiclesLoading ? (
                  <option value="">Loading vehicles...</option>
                ) : vehicles.length === 0 ? (
                  <option value="">You don't have any vehicles, add one please</option>
                ) : (
                  <>
                    <option value="" disabled>Select vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.value} value={vehicle.value}>
                        {vehicle.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown size={16} className="cr-select-arrow" />
            </div>
          </div>

          <div className="cr-field">
            <label className="cr-label" htmlFor="description">
              <FileText size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Description
            </label>
            <textarea
              id="description"
              className="cr-textarea"
              placeholder="Describe this route, special instructions, notes..."
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
            />
          </div>

          <div className="cr-field">
            <label className="cr-label" htmlFor="cr-photos">Photos</label>
            <label className="cr-upload-box" htmlFor="cr-photos">
              <span className="cr-upload-main">Upload photos</span>
            </label>
            <input
              id="cr-photos"
              className="cr-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
            />
            {photos.length > 0 && (
              <p className="cr-upload-selected">{photos.length} photo(s) selected</p>
            )}
          </div>

          <div className="cr-section-label">
            <span className="cr-dot" />
            Locations
          </div>

          <div className="cr-field">
            <label className="cr-label">Post Type</label>
            <div className="cr-segmented">
              <button
                type="button"
                className={`cr-segment-btn ${form.postType === "originDestination" ? "active" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, postType: "originDestination" }))}
              >
                Origin / Destination
              </button>
              <button
                type="button"
                className={`cr-segment-btn ${form.postType === "region" ? "active" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, postType: "region" }))}
              >
                Region
              </button>
            </div>
          </div>

          <div className="cr-field">
            <label className="cr-label">Date Type</label>
            <div className="cr-segmented">
              <button
                type="button"
                className={`cr-segment-btn ${form.dateMode === "day" ? "active" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, dateMode: "day" }))}
              >
                Day
              </button>
              <button
                type="button"
                className={`cr-segment-btn ${form.dateMode === "interval" ? "active" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, dateMode: "interval" }))}
              >
                Interval
              </button>
            </div>
          </div>

          {form.dateMode === "day" ? (
            <div className="cr-field">
              <label className="cr-label" htmlFor="dayDate">Date</label>
              <input
                id="dayDate"
                type="date"
                value={form.dayDate}
                onChange={handleChange("dayDate")}
              />
            </div>
          ) : (
            <div className="cr-field cr-date-grid">
              <div>
                <label className="cr-label" htmlFor="intervalStart">Start Date</label>
                <input
                  id="intervalStart"
                  type="date"
                  value={form.intervalStart}
                  onChange={handleChange("intervalStart")}
                />
              </div>
              <div>
                <label className="cr-label" htmlFor="intervalEnd">End Date</label>
                <input
                  id="intervalEnd"
                  type="date"
                  value={form.intervalEnd}
                  onChange={handleChange("intervalEnd")}
                />
              </div>
            </div>
          )}

          {form.postType === "originDestination" ? (
            <>
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

                <div className="cr-stop-card cr-stop-card--start">
                  <div className="cr-stop-drag" aria-hidden="true">
                    <GripVertical size={16} />
                  </div>
                  <div className="cr-stop-main">
                    <span className="cr-stop-tag cr-stop-tag--start">Start</span>
                    <input
                      type="text"
                      className="cr-stop-input"
                      placeholder="Enter departure city"
                      value={form.startLocation}
                      onChange={handleChange("startLocation")}
                    />
                  </div>
                  <Navigation size={18} className="cr-stop-end-icon" />
                </div>

                {form.waypoints.map((stop, index) => (
                  <div className="cr-stop-card" key={`waypoint-${index}`}>
                    <div className="cr-stop-drag" aria-hidden="true">
                      <GripVertical size={16} />
                    </div>
                    <div className="cr-stop-main">
                      <span className="cr-stop-tag cr-stop-tag--waypoint">Stop {index + 1}</span>
                      <input
                        type="text"
                        className="cr-stop-input"
                        placeholder="Enter a stop"
                        value={stop}
                        onChange={(event) => updateWaypoint(index, event.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="cr-stop-remove"
                      aria-label={`Remove stop ${index + 1}`}
                      onClick={() => removeWaypoint(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <div className="cr-stop-card cr-stop-card--destination">
                  <div className="cr-stop-drag" aria-hidden="true">
                    <GripVertical size={16} />
                  </div>
                  <div className="cr-stop-main">
                    <span className="cr-stop-tag cr-stop-tag--destination">Destination</span>
                    <input
                      type="text"
                      className="cr-stop-input"
                      placeholder="Enter destination city"
                      value={form.endLocation}
                      onChange={handleChange("endLocation")}
                    />
                  </div>
                  <MapPin size={18} className="cr-stop-end-icon" />
                </div>

                <button type="button" className="cr-add-stop-btn" onClick={addWaypoint}>
                  <Plus size={18} />
                  Add Stop
                </button>
              </div>
            </>
          ) : (
            <div className="cr-field">
              <label className="cr-label">REGION</label>
              <div className="cr-location-input-box">
                <MapPin size={15} className="cr-loc-icon gray" />
                <input
                  type="text"
                  className="cr-loc-input"
                  placeholder="Enter region"
                  value={form.region}
                  onChange={handleChange("region")}
                />
              </div>
            </div>
          )}

          {error && <div className="cr-msg-error">{error}</div>}
          {success && <div className="cr-msg-success">Route posted! Redirecting...</div>}

          <button className="cr-submit-btn" type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post Route"}
            {!loading && <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
