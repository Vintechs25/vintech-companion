import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";
import ClientLayout from "./layouts/ClientLayout";
import Dashboard from "./pages/Dashboard";
import MyHosting from "./pages/MyHosting";
import ServiceDetails from "./pages/ServiceDetails";
import OrderHosting from "./pages/OrderHosting";
import Domains from "./pages/Domains";
import DomainSearch from "./pages/DomainSearch";
import DomainRegister from "./pages/DomainRegister";
import DomainTransfer from "./pages/DomainTransfer";
import Invoices from "./pages/Invoices";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vintech-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/google/callback" element={<AuthCallback />} />
              <Route path="/domains/search" element={<DomainSearch />} />
              <Route path="/domains/register" element={<DomainRegister />} />
              <Route path="/domains/transfer" element={<DomainTransfer />} />
              
              {/* Protected client area */}
              <Route path="/" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="hosting" element={<MyHosting />} />
                <Route path="hosting/:id" element={<ServiceDetails />} />
                <Route path="order" element={<OrderHosting />} />
                <Route path="domains" element={<Domains />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="tickets/:id" element={<TicketDetail />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
