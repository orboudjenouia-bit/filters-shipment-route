import { Toaster } from "sonner";
import { useTheme } from "./ThemeContext";

export default function GlobalToaster() {
  const { isDarkMode } = useTheme();

  return (
    <Toaster
      className="app-toaster"
      position="top-right"
      theme={isDarkMode ? "dark" : "light"}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "toast-card",
          title: "toast-title",
          description: "toast-description",
          actionButton: "toast-action",
          cancelButton: "toast-cancel",
        },
      }}
    />
  );
}
