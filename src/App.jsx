import { Toaster } from "./hooks/use-toast.jsx"; // Import the new Toaster
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppRouter } from "./router";

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRouter />
    </TooltipProvider>
  );
};

export default App;