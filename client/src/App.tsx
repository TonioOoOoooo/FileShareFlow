import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ToastNotifications from "@/components/ToastNotifications";
import { AuthProvider } from "./context/AuthContext";
import { UploadProvider } from "./context/UploadContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UploadProvider>
          <div className="min-h-screen flex flex-col">
            <Router />
            <Toaster />
            <ToastNotifications />
            <footer className="bg-white border-t border-gray-100 py-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-xs text-gray-500">
                  OneDrive Upload & Markdown Processor • Built with Vite.js, React, and Microsoft Graph API
                </p>
              </div>
            </footer>
          </div>
        </UploadProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
