import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import LandingPage from "./Getstarted";
import CreateAccountScreen from "./Createaccountscreen";
import IndividualRegScreen from "./individualregscreen";
import BusinessRegScreen from "./Businessregscreen";
import Verification from "./Verification";
import Login from "./Login";
import ForgotPassword from "./Forgotpassword";
import ResetPassword from "./Resetpassword";
import Dashboard from "./Dashboard";
import Shipments from "./Shipments";
import RoutesScreen from "./Routes";
import Profile from "./Profile";
import CreateRoute from "./Createroute";
import ShipmentDetails from "./Shipmentdetails";
import CreateShipment from "./Createshipment";
import { getMyProfile } from "./services/profileService";
import "./App.css";

const getPathForScreen = (screen, { shipmentId, resetToken } = {}) => {
  switch (screen) {
    case "landing":
      return "/";
    case "login":
      return "/login";
    case "forgot":
      return "/forgot-password";
    case "create":
      return "/create-account";
    case "individual":
      return "/register/individual";
    case "business":
      return "/register/business";
    case "verification":
      return "/verification";
    case "dashboard":
      return "/dashboard";
    case "shipments":
      return "/shipments";
    case "routes":
      return "/routes";
    case "profile":
      return "/profile";
    case "createRoute":
      return "/routes/create";
    case "createShipment":
      return "/shipments/create";
    case "shipmentDetails":
      return shipmentId != null
        ? `/shipments/${encodeURIComponent(String(shipmentId))}`
        : "/shipments/details";
    case "resetPassword":
      return resetToken
        ? `/resetpassword/${encodeURIComponent(String(resetToken))}`
        : "/resetpassword";
    default:
      return "/";
  }
};

const hasAuthToken = () => {
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
};

const publicScreens = new Set([
  "landing",
  "create",
  "login",
  "verification",
  "forgot",
  "resetPassword",
  "individual",
  "business",
]);

const hasSavedSession = () => {
  try {
    return hasAuthToken();
  } catch {
    return false;
  }
};

const resolveScreenFromPath = (pathname) => {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (normalized === "/") {
    if (hasSavedSession()) {
      return { screen: "dashboard", redirectTo: "/dashboard" };
    }
    return { screen: "landing" };
  }
  if (normalized === "/login") return { screen: "login" };
  if (normalized === "/forgot-password" || normalized === "/forgot") {
    return { screen: "forgot" };
  }
  if (normalized === "/create-account" || normalized === "/create") {
    return { screen: "create" };
  }
  if (normalized === "/register/individual" || normalized === "/individual") {
    return { screen: "individual" };
  }
  if (normalized === "/register/business" || normalized === "/business") {
    return { screen: "business" };
  }
  if (normalized === "/verification") return { screen: "verification" };
  if (normalized === "/dashboard") return { screen: "dashboard" };
  if (normalized === "/shipments") return { screen: "shipments" };
  if (normalized === "/routes") return { screen: "routes" };
  if (normalized === "/profile") return { screen: "profile" };
  if (normalized === "/routes/create") return { screen: "createRoute" };
  if (normalized === "/shipments/create") return { screen: "createShipment" };
  if (normalized === "/shipments/details") {
    return { screen: "shipmentDetails", shipmentId: null };
  }

  if (normalized.startsWith("/shipments/")) {
    const shipmentId = decodeURIComponent(normalized.split("/")[2] || "").trim();
    if (shipmentId) {
      return { screen: "shipmentDetails", shipmentId };
    }
  }

  if (normalized.startsWith("/resetpassword/")) {
    const resetToken = decodeURIComponent(normalized.split("/")[2] || "").trim();
    return { screen: "resetPassword", resetToken };
  }

  if (normalized === "/resetpassword") {
    return { screen: "resetPassword", resetToken: "" };
  }

  return { screen: "landing" };
};

export default function App() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const pendingPathRef = useRef(null);

  const [current, setCurrent] = useState("landing");
  const [next, setNext] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [direction, setDirection] = useState("forward");
  const [role, setRole] = useState("Individual");
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [shipmentsRefreshKey, setShipmentsRefreshKey] = useState(0);
  const [displayName, setDisplayName] = useState("User");
  const [resetToken, setResetToken] = useState("");

  const clearResetPath = () => {
    routerNavigate("/", { replace: true });
  };

  const navigate = (to, dir = "forward", payload = {}) => {
    if (phase !== "idle") return;

    const nextShipmentId = payload?.shipmentId ?? selectedShipmentId;
    const nextResetToken = payload?.token ?? resetToken;
    const targetPath = getPathForScreen(to, {
      shipmentId: nextShipmentId,
      resetToken: nextResetToken,
    });

    if (payload?.shipmentId != null) {
      setSelectedShipmentId(payload.shipmentId);
    }
    if (to === "resetPassword") {
      setResetToken(nextResetToken || "");
    }

    pendingPathRef.current = targetPath;
    setDirection(dir);
    setNext(to);
    setPhase("exit");
  };

  useEffect(() => {
    const routeState = resolveScreenFromPath(location.pathname);

    if (routeState.redirectTo && location.pathname !== routeState.redirectTo) {
      routerNavigate(routeState.redirectTo, { replace: true });
      return;
    }

    if (!publicScreens.has(routeState.screen) && !hasAuthToken()) {
      if (location.pathname !== "/login") {
        routerNavigate("/login", { replace: true });
      }
      setCurrent("login");
      setNext(null);
      setPhase("idle");
      return;
    }

    if (routeState.screen === "resetPassword") {
      setResetToken(routeState.resetToken || "");
    }

    if (routeState.screen === "shipmentDetails") {
      setSelectedShipmentId(routeState.shipmentId ?? null);
    }

    if (routeState.screen !== current) {
      setCurrent(routeState.screen);
      setNext(null);
      setPhase("idle");
    }
  }, [location.pathname, current, routerNavigate]);

  useEffect(() => {
    if (phase === "exit") {
      const t = setTimeout(() => {
        setCurrent(next);
        setPhase("enter");
      }, 250);
      return () => clearTimeout(t);
    }
    if (phase === "enter") {
      const t = setTimeout(() => {
        setPhase("idle");
        setNext(null);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [phase, next]);

  useEffect(() => {
    const pendingPath = pendingPathRef.current;
    if (!pendingPath) return;

    if (location.pathname !== pendingPath) {
      routerNavigate(pendingPath);
    }

    pendingPathRef.current = null;
  }, [current, location.pathname, routerNavigate]);

  useEffect(() => {
    let isMounted = true;

    const loadDisplayName = async () => {
      try {
        const profile = await getMyProfile();
        if (!isMounted) return;

        const resolvedName =
          profile?.displayName ||
          profile?.individual?.full_Name ||
          profile?.business?.business_Name ||
          (profile?.email ? String(profile.email).split("@")[0] : "User");

        setDisplayName(resolvedName);
      } catch {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const fallback =
          storedUser?.full_Name ||
          storedUser?.business_Name ||
          storedUser?.name ||
          (storedUser?.email ? String(storedUser.email).split("@")[0] : "User");
        if (isMounted) setDisplayName(fallback);
      }
    };

    loadDisplayName();

    return () => {
      isMounted = false;
    };
  }, [current]);

  const goTo = (to, payload) => navigate(to, "forward", payload);
  const goBack = (to, payload) => navigate(to, "back", payload);

  const cls =
    phase === "exit"
      ? `exit-${direction}`
      : phase === "enter"
      ? `enter-${direction}`
      : "";

  return (
    <ThemeProvider>
      <div className={`app-wrapper ${cls}`}>
        
        {current === "landing" && (
          <LandingPage
            onGetStarted={() => goTo("create")}
            onLogin={() => goTo("login")}
          />
        )}

        {current === "login" && (
          <Login
            onBack={() => goBack("landing")}
            onCreateAccount={() => goTo("create")}
            onForgotPassword={() => goTo("forgot")}
            onSuccess={() => goTo("dashboard")}
          />
        )}

        {current === "forgot" && (
          <ForgotPassword
            onBack={() => goBack("login")}
            onSuccess={() => goTo("login")}
          />
        )}

        {current === "resetPassword" && (
          <ResetPassword
            token={resetToken}
            onBack={() => {
              clearResetPath();
              goBack("login");
            }}
            onSuccess={() => {
              clearResetPath();
              goTo("login");
            }}
          />
        )}

        {current === "create" && (
          <CreateAccountScreen
            onBack={() => goBack("landing")}
            onLogin={() => goTo("login")}
            onNext={(selectedRole) => {
              setRole(selectedRole);
              if (selectedRole === "Individual") goTo("individual");
              else goTo("business");
            }}
          />
        )}

        {current === "individual" && (
          <IndividualRegScreen
            onBack={() => goBack("create")}
            onLogin={() => goTo("login")}
            onNext={() => goTo("verification")}
          />
        )}

        {current === "business" && (
          <BusinessRegScreen
            onBack={() => goBack("create")}
            onLogin={() => goTo("login")}
            onNext={() => goTo("verification")}
          />
        )}

        {current === "verification" && (
          <Verification
            onBack={() => goBack(role === "Individual" ? "individual" : "business")}
            onSuccess={() => goTo("dashboard")}
          />
        )}

        {current === "dashboard" && (
          <Dashboard
            onNavigate={(screen) => goTo(screen)}
            userName={displayName}
          />
        )}

        {current === "shipments" && (
          <Shipments
            refreshKey={shipmentsRefreshKey}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
            onBack={() => goBack("dashboard")}
          />
        )}

        {current === "routes" && (
          <RoutesScreen
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "profile" && (
          <Profile
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "createRoute" && (
          <CreateRoute />
        )}

        {current === "shipmentDetails" && (
          <ShipmentDetails
            shipmentId={selectedShipmentId}
            onBack={() => goBack("shipments")}
          />
        )}

        {current === "createShipment" && (
          <CreateShipment
            onBack={() => goBack("shipments")}
            onCreated={(shipmentId) => {
              if (shipmentId != null) {
                setSelectedShipmentId(shipmentId);
                setShipmentsRefreshKey((prev) => prev + 1);
                goTo("shipmentDetails", { shipmentId });
              }
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}