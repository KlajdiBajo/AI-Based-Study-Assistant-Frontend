import { useEffect, useRef } from "react";
import { Toaster } from "./hooks/use-toast.jsx"; // Import the new Toaster
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppRouter } from "./router";
import { useAuthStore } from "./store";

const App = () => {
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const hasInitialized = useRef(false);
  const isChecking = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || isChecking.current) return;

    const initializeAuth = async () => {
      isChecking.current = true;

      try {
        if (!isAuthenticated || !user) {
          console.log("App: Checking auth...");
          await checkAuth();
        } else {
          console.log("App: Already authenticated");
        }
      } finally {
        hasInitialized.current = true;
        isChecking.current = false;
      }
    };

    initializeAuth();
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRouter />
    </TooltipProvider>
  );
};

export default App;
