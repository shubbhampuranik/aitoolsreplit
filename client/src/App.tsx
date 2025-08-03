import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tools from "@/pages/tools";
import Models from "@/pages/models";
import Prompts from "@/pages/prompts";
import Courses from "@/pages/courses";
import Jobs from "@/pages/jobs";
import News from "@/pages/news";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin/dashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes that work for both authenticated and unauthenticated users */}
      <Route path="/tools" component={Tools} />
      <Route path="/models" component={Models} />
      <Route path="/prompts" component={Prompts} />
      <Route path="/courses" component={Courses} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/news" component={News} />
      
      {/* Authenticated-only routes */}
      {isAuthenticated && (
        <>
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      
      {/* Home/Landing route */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
