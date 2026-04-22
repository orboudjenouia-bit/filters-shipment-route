import { toast } from "sonner";

const TOAST_STYLES = {
  light: {
    success: {
      background: "linear-gradient(140deg, rgba(6,95,70,0.92), rgba(13,148,136,0.95))",
      color: "#ecfeff",
      border: "1px solid rgba(153,246,228,0.55)",
      backdropFilter: "blur(8px)",
    },
    error: {
      background: "linear-gradient(140deg, rgba(127,29,29,0.95), rgba(190,24,93,0.95))",
      color: "#fff1f2",
      border: "1px solid rgba(254,205,211,0.55)",
      backdropFilter: "blur(8px)",
    },
    info: {
      background: "linear-gradient(140deg, rgba(30,64,175,0.93), rgba(8,145,178,0.94))",
      color: "#ecfeff",
      border: "1px solid rgba(186,230,253,0.55)",
      backdropFilter: "blur(8px)",
    },
  },
  dark: {
    success: {
      background: "linear-gradient(135deg, #0b1120, #134e4a)",
      color: "#ccfbf1",
      border: "1px solid rgba(45,212,191,0.4)",
    },
    error: {
      background: "linear-gradient(135deg, #0b1120, #4c0519)",
      color: "#ffe4e6",
      border: "1px solid rgba(244,63,94,0.4)",
    },
    info: {
      background: "linear-gradient(135deg, #0b1120, #1e3a8a)",
      color: "#dbeafe",
      border: "1px solid rgba(96,165,250,0.4)",
    },
  },
};

const getTheme = () => {
  if (typeof document === "undefined") return "light";
  return document.body.classList.contains("dark-mode") ? "dark" : "light";
};

const getStyle = (variant) => {
  const theme = getTheme();
  return TOAST_STYLES[theme][variant];
};

const DEFAULT_TOAST_DURATION = {
  success: 3500,
  error: 5000,
  info: 4000,
};

const DEFAULT_TOAST_DESCRIPTION = {
  success: "Your action was completed successfully.",
  error: "Something went wrong. Please try again.",
  info: "Here is an important update from the app.",
};

const getToastOptions = (variant, options = {}) => ({
  description: options.description ?? DEFAULT_TOAST_DESCRIPTION[variant],
  action: options.action,
  cancel: options.cancel,
  duration: options.duration ?? DEFAULT_TOAST_DURATION[variant],
  style: getStyle(variant),
});

export const toastSuccess = (title, options = {}) => {
  toast.success(title, getToastOptions("success", options));
};

export const toastError = (title, options = {}) => {
  toast.error(title, getToastOptions("error", options));
};

export const toastInfo = (title, options = {}) => {
  toast.message(title, getToastOptions("info", options));
};

export const toastLoading = (title, options = {}) => {
  return toast.loading(title, getToastOptions("info", options));
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
