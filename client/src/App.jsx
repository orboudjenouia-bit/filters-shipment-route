import React, { useState, useEffect, useRef, useCallback } from "react";
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
import ActiveShipmentsPage from "./ActiveShipmentsPage";
import ActiveShipmentDetailsPage from "./ActiveShipmentDetailsPage";
import EditActiveShipmentPage from "./EditActiveShipmentPage";
import ActiveRoutesPage from "./ActiveRoutesPage";
import ActiveRouteDetailsPage from "./ActiveRouteDetailsPage";
import EditActiveRoutePage from "./EditActiveRoutePage";
import Profile from "./Profile";
import Vehicle from "./Vehicle";
import CreateRoute from "./Createroute";
import ShipmentDetails from "./Shipmentdetails";
import CreateShipment from "./Createshipment";
import Notifications from "./Notifications";
import AdminPanel from "./AdminPanel";
import UsersList from "./UsersList";
import AdminSubscriptions from "./AdminSubscriptions";
import EditProfilePage from "./EditProfilePage";
import ProfileSettingsPage from "./ProfileSettingsPage";
import ActiveDevicesPage from "./ActiveDevicesPage";
import AboutUsPage from "./AboutUsPage";
import PublicProfilePage from "./PublicProfilePage";
import { getMyProfile } from "./services/profileService";
import SubscriptionPlans from './SubscriptionPlans';
import SubscriptionDetailsPage from "./SubscriptionDetailsPage";
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

const getPathForScreen = (screen, { shipmentId, subscriptionId, activeShipmentId, activeRouteId, routeId, publicUserId, resetToken } = {}) => {
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
    case "routeDetails":
      return routeId != null
        ? `/routes/${encodeURIComponent(String(routeId))}`
        : "/routes";
    case "profile":
      return "/profile";
    case "publicProfile":
      return publicUserId != null
        ? `/users/${encodeURIComponent(String(publicUserId))}`
        : "/profile";
    case "editProfile":
      return "/profile/edit";
    case "profileSettings":
      return "/profile/settings";
    case "about":
      return "/about";
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
    case "adminSubscriptions":
      return "/adminPanel/subscriptions";
    case "subscriptionDetails":
      return subscriptionId != null
        ? `/subscription/details/${encodeURIComponent(String(subscriptionId))}`
        : "/subscription";
    case "activeShipments":
      return "/active/shipments";
    case "activeShipmentDetails":
      return activeShipmentId != null
        ? `/active/shipments/${encodeURIComponent(String(activeShipmentId))}`
        : "/active/shipments";
    case "editActiveShipment":
      return activeShipmentId != null
        ? `/active/shipments/${encodeURIComponent(String(activeShipmentId))}/edit`
        : "/active/shipments";
    case "activeRoutes":
      return "/active/routes";
    case "activeRouteDetails":
      return activeRouteId != null
        ? `/active/routes/${encodeURIComponent(String(activeRouteId))}`
        : "/active/routes";
    case "editActiveRoute":
      return activeRouteId != null
        ? `/active/routes/${encodeURIComponent(String(activeRouteId))}/edit`
        : "/active/routes";
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
]);

const adminOnlyScreens = new Set(["adminPanel", "usersList", "adminSubscriptions"]);

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
  if (normalized.startsWith("/routes/")) {
    const routeId = decodeURIComponent(normalized.split("/")[2] || "").trim();
    if (routeId && routeId !== "create") {
      return { screen: "routeDetails", routeId };
    }
  }
  if (normalized === "/profile") return { screen: "profile" };
  if (normalized.startsWith("/users/")) {
    const publicUserId = decodeURIComponent(normalized.split("/")[2] || "").trim();
    if (publicUserId) {
      return { screen: "publicProfile", publicUserId };
    }
  }
  if (normalized === "/profile/edit") return { screen: "editProfile" };
  if (normalized === "/profile/settings") return { screen: "profileSettings" };
  if (normalized === "/about") return { screen: "about" };
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

  if (normalized === "/adminPanel/subscriptions") {
    return { screen: "adminSubscriptions" };
  }

  if (normalized.startsWith("/subscription/details/")) {
    const subId = decodeURIComponent(normalized.split("/")[3] || "").trim();
    if (subId) {
      return { screen: "subscriptionDetails", subscriptionId: subId };
    }
  }

  if (normalized === "/active/shipments") {
    return { screen: "activeShipments" };
  }

  if (normalized.startsWith("/active/shipments/") && normalized.endsWith("/edit")) {
    const activeShipmentId = decodeURIComponent(normalized.split("/")[3] || "").trim();
    if (activeShipmentId) {
      return { screen: "editActiveShipment", activeShipmentId };
    }
  }

  if (normalized.startsWith("/active/shipments/")) {
    const activeShipmentId = decodeURIComponent(normalized.split("/")[3] || "").trim();
    if (activeShipmentId) {
      return { screen: "activeShipmentDetails", activeShipmentId };
    }
  }

  if (normalized === "/active/routes") {
    return { screen: "activeRoutes" };
  }

  if (normalized.startsWith("/active/routes/") && normalized.endsWith("/edit")) {
    const activeRouteId = decodeURIComponent(normalized.split("/")[3] || "").trim();
    if (activeRouteId) {
      return { screen: "editActiveRoute", activeRouteId };
    }
  }

  if (normalized.startsWith("/active/routes/")) {
    const activeRouteId = decodeURIComponent(normalized.split("/")[3] || "").trim();
    if (activeRouteId) {
      return { screen: "activeRouteDetails", activeRouteId };
    }
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
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedActiveShipmentId, setSelectedActiveShipmentId] = useState(null);
  const [selectedActiveRouteId, setSelectedActiveRouteId] = useState(null);
  const [selectedPublicUserId, setSelectedPublicUserId] = useState(null);
  const [shipmentDetailsBackScreen, setShipmentDetailsBackScreen] = useState("shipments");
  const [subscriptionDetailsBackScreen, setSubscriptionDetailsBackScreen] = useState("subscription");
  const [routeDetailsBackScreen, setRouteDetailsBackScreen] = useState("routes");
  const [activeShipmentBackScreen, setActiveShipmentBackScreen] = useState("activeShipments");
  const [activeRouteBackScreen, setActiveRouteBackScreen] = useState("activeRoutes");
  const [publicProfileBackScreen, setPublicProfileBackScreen] = useState("dashboard");
  const [shipmentsRefreshKey, setShipmentsRefreshKey] = useState(0);
  const [displayName, setDisplayName] = useState("User");
  const [userRole, setUserRole] = useState(getStoredRole());
  const [profileGate, setProfileGate] = useState({ loading: true, hasProfile: true, type: "", isVerified: true });
  const [resetToken, setResetToken] = useState("");
  const [forgotBackScreen, setForgotBackScreen] = useState("login");
  const [resetPasswordBackScreen, setResetPasswordBackScreen] = useState("login");
  const [notificationsBackScreen, setNotificationsBackScreen] = useState("dashboard");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const forceLogoutToLogin = useCallback(() => {
    clearStoredAuth();
    setCurrent("login");
    setNext(null);
    setPhase("idle");
    if (location.pathname !== "/login") {
      routerNavigate("/login", { replace: true });
    }
  }, [location.pathname, routerNavigate]);

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
      if (to) {
        resolvedTarget = to;
      } else {
        const previous = backStackRef.current.pop();
        resolvedTarget = previous || "dashboard";
      }
    }

    if (adminOnlyScreens.has(resolvedTarget) && !isAdminRole(userRole)) return;

    const nextShipmentId = payload.shipmentId ?? selectedShipmentId;
    const nextSubscriptionId = payload.subscriptionId ?? selectedSubscriptionId;
    const nextRouteId = payload.routeId ?? selectedRouteId;
    const nextActiveShipmentId = payload.activeShipmentId ?? selectedActiveShipmentId;
    const nextActiveRouteId = payload.activeRouteId ?? selectedActiveRouteId;
    const nextPublicUserId = payload.userId ?? selectedPublicUserId;
    const nextResetToken = payload.token ?? resetToken;

    if (resolvedTarget === "shipmentDetails") {
      const previousScreen =
        payload.from ||
        (current === "publicProfile"
          ? publicProfileBackScreen
          : current === "shipmentDetails"
          ? shipmentDetailsBackScreen
          : current) ||
        "shipments";
      setShipmentDetailsBackScreen(previousScreen);
    }

    if (resolvedTarget === "subscriptionDetails") {
      const previousScreen =
        payload.from ||
        (current === "subscriptionDetails" ? subscriptionDetailsBackScreen : current) ||
        "subscription";
      setSubscriptionDetailsBackScreen(previousScreen);
    }

    if (resolvedTarget === "routeDetails") {
      const previousScreen =
        payload.from ||
        (current === "publicProfile"
          ? publicProfileBackScreen
          : current === "routeDetails"
          ? routeDetailsBackScreen
          : current) ||
        "routes";
      setRouteDetailsBackScreen(previousScreen);
    }

    if (resolvedTarget === "notifications") {
      const previousScreen = payload.from || current || "dashboard";
      setNotificationsBackScreen(previousScreen);
    }

    if (resolvedTarget === "forgot") {
      const previousScreen =
        payload.from ||
        (current === "forgot" ? forgotBackScreen : current) ||
        "login";
      setForgotBackScreen(previousScreen);
    }

    if (resolvedTarget === "resetPassword") {
      const previousScreen =
        payload.from ||
        (current === "resetPassword" ? resetPasswordBackScreen : current) ||
        forgotBackScreen ||
        "login";
      setResetPasswordBackScreen(previousScreen);
    }

    if (resolvedTarget === "publicProfile") {
      const previousScreen =
        payload.from ||
        (current === "publicProfile" ? publicProfileBackScreen : current) ||
        "dashboard";
      setPublicProfileBackScreen(previousScreen);
    }

    if (resolvedTarget === "activeShipmentDetails" || resolvedTarget === "editActiveShipment") {
      const previousScreen =
        payload.from ||
        (current === "activeShipmentDetails" || current === "editActiveShipment" ? activeShipmentBackScreen : current) ||
        "activeShipments";
      setActiveShipmentBackScreen(previousScreen);
    }

    if (resolvedTarget === "activeRouteDetails" || resolvedTarget === "editActiveRoute") {
      const previousScreen =
        payload.from ||
        (current === "activeRouteDetails" || current === "editActiveRoute" ? activeRouteBackScreen : current) ||
        "activeRoutes";
      setActiveRouteBackScreen(previousScreen);
    }

    const targetPath = getPathForScreen(resolvedTarget, {
      shipmentId: nextShipmentId,
      subscriptionId: nextSubscriptionId,
      routeId: nextRouteId,
      activeShipmentId: nextActiveShipmentId,
      activeRouteId: nextActiveRouteId,
      publicUserId: nextPublicUserId,
      resetToken: nextResetToken,
    });

    if (payload.shipmentId != null) {
      setSelectedShipmentId(payload.shipmentId);
    }
    if (payload.subscriptionId != null) {
      setSelectedSubscriptionId(payload.subscriptionId);
    }
    if (payload.routeId != null) {
      setSelectedRouteId(payload.routeId);
    }
    if (payload.activeShipmentId != null) {
      setSelectedActiveShipmentId(payload.activeShipmentId);
    }
    if (payload.activeRouteId != null) {
      setSelectedActiveRouteId(payload.activeRouteId);
    }
    if (payload.userId != null) {
      setSelectedPublicUserId(payload.userId);
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
    // Avoid syncing from stale pathname while a screen transition is in progress.
    if (phase !== "idle") return;
    if (pendingPathRef.current) return;

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

    if (routeState.screen === "subscriptionDetails") {
      setSelectedSubscriptionId(routeState.subscriptionId ?? null);
    }

    if (routeState.screen === "routeDetails") {
      setSelectedRouteId(routeState.routeId ?? null);
    }

    if (routeState.screen === "activeShipmentDetails" || routeState.screen === "editActiveShipment") {
      setSelectedActiveShipmentId(routeState.activeShipmentId ?? null);
    }

    if (routeState.screen === "activeRouteDetails" || routeState.screen === "editActiveRoute") {
      setSelectedActiveRouteId(routeState.activeRouteId ?? null);
    }

    if (routeState.screen === "publicProfile") {
      setSelectedPublicUserId(routeState.publicUserId ?? null);
    }

    if (routeState.screen !== current) {
      setCurrent(routeState.screen);
      setNext(null);
      setPhase("idle");
    }
  }, [location.pathname, current, routerNavigate, userRole, phase]);

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
      return;
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
        setProfileGate({
          loading: false,
          hasProfile: Boolean(profile?.hasProfile),
          type: String(profile?.type || "").toUpperCase(),
          isVerified: Boolean(profile?.isVerified),
        });
      } catch (err) {
        if (!publicScreens.has(current) && isSessionInvalidError(err)) {
          if (isMounted) forceLogoutToLogin();
          return;
        }

        if (isMounted) {
          setDisplayName(fallback);
          setUserRole(fallbackRole);
          setProfileGate((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    loadDisplayName();

    return () => {
      isMounted = false;
    };
  }, [current, forceLogoutToLogin]);

  useEffect(() => {
    if (!hasAuthToken()) {
      setProfileGate({ loading: false, hasProfile: true, type: "", isVerified: true });
      return;
    }

    if (profileGate.loading || profileGate.isVerified) return;

    const routeState = resolveScreenFromPath(location.pathname);
    const allowedScreens = new Set(["verification", "individual", "business"]);
    if (allowedScreens.has(routeState.screen)) return;

    if (location.pathname !== "/verification") {
      routerNavigate("/verification", { replace: true });
    }
  }, [profileGate, location.pathname, routerNavigate]);

  useEffect(() => {
    if (!hasAuthToken()) {
      setProfileGate({ loading: false, hasProfile: true, type: "", isVerified: true });
      return;
    }

    if (profileGate.loading || profileGate.hasProfile) return;
    if (!profileGate.isVerified) return;

    const routeState = resolveScreenFromPath(location.pathname);
    if (publicScreens.has(routeState.screen)) return;

    const target = profileGate.type === "BUSINESS" ? "/register/business" : "/register/individual";
    if (location.pathname !== target) {
      routerNavigate(target, { replace: true });
    }
  }, [profileGate, location.pathname, routerNavigate]);

  useEffect(() => {
    const handleAuthLogout = () => {
      forceLogoutToLogin();
    };

    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [location.pathname, forceLogoutToLogin]);

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
  }, [current, forceLogoutToLogin]);

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
            onSuccess={async () => {
              try {
                const profile = await getMyProfile();
                if (profile?.isVerified === true) {
                  goTo("dashboard");
                  return;
                }
                if (profile?.isVerified === false) {
                  goTo("verification");
                  return;
                }
              } catch {
                // fallback below
              }

              // Safe default: never grant normal access if verification status is unknown.
              goTo("verification");
            }}
          />
        )}

        {current === "forgot" && (
          <ForgotPassword
            onBack={() => goBack(forgotBackScreen || "login")}
            onSuccess={() => goTo("login")}
          />
        )}

        {current === "resetPassword" && (
          <ResetPassword
            token={resetToken}
            onBack={() => {
              clearResetPath();
              goBack(resetPasswordBackScreen || forgotBackScreen || "login");
            }}
            onSuccess={() => {
              clearResetPath();
              goBack(resetPasswordBackScreen || forgotBackScreen || "login");
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
            onSuccess={async () => {
              try {
                const profile = await getMyProfile();
                const resolvedName =
                  profile?.displayName ||
                  (profile?.email ? String(profile.email).split("@")[0] : "User");

                setDisplayName(resolvedName);
                setUserRole(profile?.role || getStoredRole());
                setProfileGate({
                  loading: false,
                  hasProfile: Boolean(profile?.hasProfile),
                  type: String(profile?.type || "").toUpperCase(),
                  isVerified: Boolean(profile?.isVerified),
                });

                if (profile?.isVerified) {
                  goTo("dashboard");
                  return;
                }
              } catch {
                // fall through to optimistic update below
              }

              // Optimistic fallback to avoid stale unverified state causing redirect loops.
              setProfileGate((prev) => ({ ...prev, loading: false, isVerified: true }));
              goTo("dashboard");
            }}
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

        {current === "activeShipments" && (
          <ActiveShipmentsPage
            onBack={() => goBack("dashboard")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "activeShipmentDetails" && (
          <ActiveShipmentDetailsPage
            shipmentId={selectedActiveShipmentId}
            onBack={() => goBack(activeShipmentBackScreen || "activeShipments")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "editActiveShipment" && (
          <EditActiveShipmentPage
            shipmentId={selectedActiveShipmentId}
            onBack={() => goBack(activeShipmentBackScreen || "activeShipmentDetails")}
            onSaved={() => {
              goTo("shipmentDetails", { shipmentId: selectedActiveShipmentId, from: "activeShipments" });
            }}
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

        {current === "routeDetails" && (
          <ActiveRouteDetailsPage
            routeId={selectedRouteId}
            source="all"
            allowActions={false}
            onBack={() => goBack("routes")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "activeRoutes" && (
          <ActiveRoutesPage
            onBack={() => goBack("dashboard")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "activeRouteDetails" && (
          <ActiveRouteDetailsPage
            routeId={selectedActiveRouteId}
            onBack={() => goBack(activeRouteBackScreen || "activeRoutes")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "editActiveRoute" && (
          <EditActiveRoutePage
            routeId={selectedActiveRouteId}
            onBack={() => goBack(activeRouteBackScreen || "activeRouteDetails")}
            onSaved={() => {
              goTo("routeDetails", { routeId: selectedActiveRouteId, from: "activeRoutes" });
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

        {current === "publicProfile" && (
          <PublicProfilePage
            userId={selectedPublicUserId}
            onBack={() => goBack(publicProfileBackScreen || "dashboard")}
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

        {current === "about" && (
          <AboutUsPage
            onBack={() => goBack("profileSettings")}
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
            onBack={() => goBack("shipments")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
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
          <SubscriptionPlans
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "subscriptionDetails" && (
          <SubscriptionDetailsPage
            subId={selectedSubscriptionId}
            isAdmin={subscriptionDetailsBackScreen === "adminSubscriptions"}
            onBack={() => goBack(subscriptionDetailsBackScreen || "subscription")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
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
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}

        {current === "adminSubscriptions" && (
          <AdminSubscriptions
            onBack={() => goBack("adminPanel")}
            onNavigate={(screen, payload) => {
              goTo(screen, payload);
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}