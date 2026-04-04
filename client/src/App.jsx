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
import Vehicle from "./Vehicle";
import CreateRoute from "./Createroute";
import ShipmentDetails from "./Shipmentdetails";
import CreateShipment from "./Createshipment";
import Notifications from "./Notifications";
import AdminPanel from "./AdminPanel";
import UsersList from "./UsersList";
import EditProfilePage from "./EditProfilePage";
import ProfileSettingsPage from "./ProfileSettingsPage";
import ActiveDevicesPage from "./ActiveDevicesPage";
import { getMyProfile } from "./services/profileService";
import SubscriptionPlans from './SubscriptionPlans';
import { getNotifications } from "./services/notificationService";
import "./App.css";

const ADMIN_ROLE = "ADMIN";

const isAdminRole = (role) =>
  String(role || "").trim().toUpperCase() === ADMIN_ROLE;

const getStoredRole = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    return storedUser?.role || "USER";
  } catch {
    return "USER";
  }
};

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
    case "editProfile":
      return "/profile/edit";
    case "profileSettings":
      return "/profile/settings";
    case "activeDevices":
      return "/profile/settings/devices";
    case "vehicle":
      return "/vehicles/create";
    case "createRoute":
      return "/routes/create";
    case "createShipment":
      return "/shipments/create";
    case "shipmentDetails":
      return shipmentId != null
        ? `/shipments/${encodeURIComponent(String(shipmentId))}`
        : "/shipments";
    case "resetPassword":
      return resetToken
        ? `/resetpassword/${encodeURIComponent(String(resetToken))}`
        : "/resetpassword";
    case "subscription":
      return "/subscription";
    case "notifications":
      return "/notifications";
    case "adminPanel":
      return "/adminPanel";
    case "usersList":
      return "/adminPanel/users";
    default:
      return "/";
  }
};

const hasAuthToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const parts = token.split(".");
    if (parts.length !== 3) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    const exp = Number(payload?.exp);

    if (Number.isFinite(exp) && exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const isSessionInvalidError = (err) => {
  const status = Number(err?.status);
  const code = String(err?.code || "").toUpperCase();
  const message = String(err?.message || "").toLowerCase();

  if (status === 401) return true;
  if (status === 404 && code === "USER_NOT_FOUND") return true;
  if (status === 404 && message.includes("user not found")) return true;

  return false;
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
  "subscription",
]);

const adminOnlyScreens = new Set(["adminPanel", "usersList"]);

const resolveScreenFromPath = (pathname) => {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (normalized === "/") {
    if (hasAuthToken()) {
      return { screen: "dashboard", redirectTo: "/dashboard" };
    }
    return { screen: "landing" };
  }
  if (normalized === "/login") return { screen: "login" };
  if (normalized === "/forgot-password") {
    return { screen: "forgot" };
  }
  if (normalized === "/create-account") {
    return { screen: "create" };
  }
  if (normalized === "/register/individual") {
    return { screen: "individual" };
  }
  if (normalized === "/register/business") {
    return { screen: "business" };
  }
  if (normalized === "/verification") return { screen: "verification" };
  if (normalized === "/dashboard") return { screen: "dashboard" };
  if (normalized === "/shipments") return { screen: "shipments" };
  if (normalized === "/routes") return { screen: "routes" };
  if (normalized === "/profile") return { screen: "profile" };
  if (normalized === "/profile/edit") return { screen: "editProfile" };
  if (normalized === "/profile/settings") return { screen: "profileSettings" };
  if (normalized === "/profile/settings/devices") return { screen: "activeDevices" };
  if (normalized === "/vehicles/create") return { screen: "vehicle" };
  if (normalized === "/routes/create") return { screen: "createRoute" };
  if (normalized === "/shipments/create") return { screen: "createShipment" };
  if (normalized === "/shipments/details") {
    return { screen: "shipmentDetails", shipmentId: null };
  }
  if (normalized === "/subscription") return { screen: "subscription" };

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

  if (normalized === "/notifications") {
    return { screen: "notifications" };
  }

  if (normalized === "/adminPanel") {
    return { screen: "adminPanel" };
  }

  if (normalized === "/adminPanel/users") {
    return { screen: "usersList" };
  }

  return { screen: "landing" };
};

export default function App() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const pendingPathRef = useRef(null);
  const backStackRef = useRef([]);

  const [current, setCurrent] = useState("landing");
  const [next, setNext] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [direction, setDirection] = useState("forward");
  const [role, setRole] = useState("Individual");
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [shipmentDetailsBackScreen, setShipmentDetailsBackScreen] = useState("shipments");
  const [shipmentsRefreshKey, setShipmentsRefreshKey] = useState(0);
  const [displayName, setDisplayName] = useState("User");
  const [userRole, setUserRole] = useState(getStoredRole());
  const [resetToken, setResetToken] = useState("");
  const [notificationsBackScreen, setNotificationsBackScreen] = useState("dashboard");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const forceLogoutToLogin = () => {
    clearStoredAuth();
    setCurrent("login");
    setNext(null);
    setPhase("idle");
    if (location.pathname !== "/login") {
      routerNavigate("/login", { replace: true });
    }
  };

  const clearResetPath = () => {
    routerNavigate("/", { replace: true });
  };

  const navigate = (to, dir = "forward", payload = {}) => {
    if (phase !== "idle") return;

    let resolvedTarget = to;

    if (dir === "forward" && current && current !== to) {
      backStackRef.current.push(current);
    }

    if (dir === "back") {
      const previous = backStackRef.current.pop();
      resolvedTarget = previous || to || "dashboard";
    }

    if (adminOnlyScreens.has(resolvedTarget) && !isAdminRole(userRole)) return;

    const nextShipmentId = payload.shipmentId ?? selectedShipmentId;
    const nextResetToken = payload.token ?? resetToken;

    if (resolvedTarget === "shipmentDetails") {
      const previousScreen =
        payload.from ||
        (current === "shipmentDetails" ? shipmentDetailsBackScreen : current) ||
        "shipments";
      setShipmentDetailsBackScreen(previousScreen);
    }

    if (resolvedTarget === "notifications") {
      const previousScreen = payload.from || current || "dashboard";
      setNotificationsBackScreen(previousScreen);
    }

    const targetPath = getPathForScreen(resolvedTarget, {
      shipmentId: nextShipmentId,
      resetToken: nextResetToken,
    });

    if (payload.shipmentId != null) {
      setSelectedShipmentId(payload.shipmentId);
    }
    if (resolvedTarget === "resetPassword") {
      setResetToken(nextResetToken || "");
    }

    pendingPathRef.current = targetPath;
    setDirection(dir);
    setNext(resolvedTarget);
    setPhase("exit");
  };

  useEffect(() => {
    const routeState = resolveScreenFromPath(location.pathname);
    const roleFromStorage = getStoredRole();

    if (routeState.redirectTo && location.pathname !== routeState.redirectTo) {
      routerNavigate(routeState.redirectTo, { replace: true });
      return;
    }

    if (adminOnlyScreens.has(routeState.screen) && !isAdminRole(userRole || roleFromStorage)) {
      routerNavigate("/dashboard", { replace: true });
      setCurrent("dashboard");
      setNext(null);
      setPhase("idle");
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
  }, [location.pathname, current, routerNavigate, userRole]);

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
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const fallback =
        (storedUser?.email ? String(storedUser.email).split("@")[0] : "User");
      const fallbackRole = storedUser?.role || "USER";

      if (!hasAuthToken()) {
        if (isMounted) {
          setDisplayName(fallback);
          setUserRole(fallbackRole);
        }
        return;
      }

      try {
        const profile = await getMyProfile();
        if (!isMounted) return;

        const resolvedName =
          profile?.displayName ||
          (profile?.email ? String(profile.email).split("@")[0] : "User");

        setDisplayName(resolvedName);
        setUserRole(profile?.role || fallbackRole);
      } catch (err) {
        if (!publicScreens.has(current) && isSessionInvalidError(err)) {
          if (isMounted) forceLogoutToLogin();
          return;
        }

        if (isMounted) {
          setDisplayName(fallback);
          setUserRole(fallbackRole);
        }
      }
    };

    loadDisplayName();

    return () => {
      isMounted = false;
    };
  }, [current]);

  useEffect(() => {
    const handleAuthLogout = () => {
      forceLogoutToLogin();
    };

    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!hasAuthToken() || publicScreens.has(current)) return;

    let isActive = true;

    const validateSession = async () => {
      try {
        await getMyProfile();
      } catch (err) {
        if (isActive && isSessionInvalidError(err)) {
          forceLogoutToLogin();
        }
      }
    };

    validateSession();
    const intervalId = setInterval(validateSession, 30000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [current]);

  useEffect(() => {
    if (!hasAuthToken() || publicScreens.has(current)) {
      setHasUnreadNotifications(false);
      return;
    }

    let isMounted = true;

    const refreshUnreadNotifications = async () => {
      try {
        const list = await getNotifications();
        if (!isMounted) return;
        setHasUnreadNotifications(list.some((item) => item?.isRead === false));
      } catch {
        if (!isMounted) return;
        setHasUnreadNotifications(false);
      }
    };

    refreshUnreadNotifications();
    const intervalId = setInterval(refreshUnreadNotifications, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
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
            userRole={userRole}
            hasUnreadNotifications={hasUnreadNotifications}
          />
        )}

        {current === "shipments" && (
          <Shipments
            refreshKey={shipmentsRefreshKey}
            hasUnreadNotifications={hasUnreadNotifications}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
            onBack={() => goBack("dashboard")}
          />
        )}

        {current === "routes" && (
          <RoutesScreen
            hasUnreadNotifications={hasUnreadNotifications}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "profile" && (
          <Profile
            hasUnreadNotifications={hasUnreadNotifications}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "editProfile" && (
          <EditProfilePage
            onBack={() => goBack("profile")}
          />
        )}

        {current === "profileSettings" && (
          <ProfileSettingsPage
            onBack={() => goBack("profile")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "activeDevices" && (
          <ActiveDevicesPage
            onBack={() => goBack("profileSettings")}
          />
        )}

        {current === "vehicle" && (
          <Vehicle
            onBack={() => goBack("profile")}
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
            onBack={() => goBack(shipmentDetailsBackScreen || "shipments")}
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

        {current === "subscription" && (
          <SubscriptionPlans />
        )}
        {current === "notifications" && (
          <Notifications
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
            onBack={() => goBack(notificationsBackScreen || "dashboard")}
            onNotificationsChanged={(hasUnread) => {
              setHasUnreadNotifications(Boolean(hasUnread));
            }}
          />
        )}

        {current === "adminPanel" && (
          <AdminPanel
            onBack={() => goBack("dashboard")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "usersList" && (
          <UsersList
            onBack={() => goBack("adminPanel")}
          />
        )}
      </div>
    </ThemeProvider>
  );
}