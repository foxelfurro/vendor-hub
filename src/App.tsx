import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VendorInventory from "./pages/VendorInventory";
import VendorExplore from "./pages/VendorExplore";
import Sales from "./pages/Sales";
import AdminCatalog from "./pages/AdminCatalog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/inventory" element={<AppLayout><VendorInventory /></AppLayout>} />
            <Route path="/explore" element={<AppLayout><VendorExplore /></AppLayout>} />
            <Route path="/sales" element={<AppLayout><Sales /></AppLayout>} />
            <Route path="/admin/catalog" element={<AppLayout><AdminCatalog /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
