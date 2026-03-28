import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  Navigation,
  Send,
  RefreshCw,
  FileText,
} from "lucide-react";
import { createRoute } from "./services/routeService";
import "./Createroute.css";

const API_URL = process.env.REACT_APP_API_URL;

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export default function CreateRoute() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    routeName: "",
    vehicle: "",
    postType: "originDestination",
    region: "",
    startLocation: "",
    endLocation: "",
    dateMode: "day",
    dayDate: "",
    intervalStart: "",
    intervalEnd: "",
    description: "",
    recurring: true,
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
        const token = localStorage.getItem("token");
        if (!token) {
          if (isMounted) setVehicles([]);
          return;
        }

        const response = await fetch(`${API_URL}/profile/vehicles`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await parseJson(response);
        if (!response.ok) {
          throw new Error(data?.message || `Failed to fetch vehicles (${response.status})`);
        }

        const list = Array.isArray(data?.vehicles)
          ? data.vehicles
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

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

  const handlePhotosChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotos(files.slice(0, 5));
  };

  const toggleRecurring = () =>
    setForm((prev) => ({ ...prev, recurring: !prev.recurring }));

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

    const origin = isRegion ? null : form.startLocation.trim();
    const destination = isRegion ? null : form.endLocation.trim();
    const region = isRegion ? form.region.trim() : null;
    const date = isInterval ? null : form.dayDate;

    try {
      setLoading(true);
      setError("");

      const payload = {
        origin,
        destination,
        region,
        date,
        post_type: form.postType === "region" ? "REGION" : "ORIGIN_DESTINATION",
        date_type: form.dateMode === "interval" ? "INTERVAL" : "DAY",
        interval_start: form.dateMode === "interval" ? form.intervalStart : null,
        interval_end: form.dateMode === "interval" ? form.intervalEnd : null,
        vehicle_plate: vehiclePlate,
        more_Information: form.description.trim() || null,
      };

      const data = await createRoute(payload, token);
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
        dateMode: "day",
        dayDate: "",
        intervalStart: "",
        intervalEnd: "",
        description: "",
        recurring: true,
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
                <label className="cr-label">START LOCATION</label>
                <div className="cr-location-input-box">
                  <Navigation size={15} className="cr-loc-icon green" />
                  <input
                    type="text"
                    className="cr-loc-input"
                    placeholder="Enter departure city"
                    value={form.startLocation}
                    onChange={handleChange("startLocation")}
                  />
                </div>
              </div>

              <div className="cr-field">
                <label className="cr-label">END LOCATION</label>
                <div className="cr-location-input-box">
                  <MapPin size={15} className="cr-loc-icon gray" />
                  <input
                    type="text"
                    className="cr-loc-input"
                    placeholder="Enter destination city"
                    value={form.endLocation}
                    onChange={handleChange("endLocation")}
                  />
                </div>
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

          <div className="cr-recurring-box">
            <div className="cr-recurring-left">
              <div className="cr-recurring-icon">
                <RefreshCw size={16} color="#09c247" />
              </div>
              <div>
                <p className="cr-recurring-title">Recurring Route</p>
                <p className="cr-recurring-sub">Set this as a standard path</p>
              </div>
            </div>
            <button
              type="button"
              className={`cr-toggle ${form.recurring ? "on" : "off"}`}
              onClick={toggleRecurring}
            >
              <span className="cr-toggle-thumb" />
            </button>
          </div>

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
