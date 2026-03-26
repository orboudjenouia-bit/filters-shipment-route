import React, { useState, useEffect } from "react";
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
import ShipmentDetails from "./Shipmentdetails";
import CreateShipment from "./Createshipment";
import { getMyProfile } from "./services/profileService";
import "./App.css";

export default function App() {
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
    if (window.location.pathname !== "/") {
      window.history.replaceState({}, "", "/");
    }
  };

  const navigate = (to, dir = "forward") => {
    if (phase !== "idle") return;
    setDirection(dir);
    setNext(to);
    setPhase("exit");
  };

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "resetpassword" && parts[1]) {
      setResetToken(parts[1]);
      setCurrent("resetPassword");
    }
  }, []);

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

  const goTo = (to) => navigate(to, "forward");
  const goBack = (to) => navigate(to, "back");

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
              if (screen === "shipmentDetails" && payload?.shipmentId != null) {
                setSelectedShipmentId(payload.shipmentId);
              }
              goTo(screen);
            }}
            onBack={() => goBack("dashboard")}
          />
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
                goTo("shipmentDetails");
              }
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}