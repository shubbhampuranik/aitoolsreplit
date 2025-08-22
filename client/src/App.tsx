import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NProgress from "nprogress";
import { HelmetProvider } from 'react-helmet-async';
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tools from "@/pages/tools";
import ToolDetails from "@/pages/tool-details";
import AlternativesPage from "@/pages/alternatives";
import ToolReviews from "@/pages/tool-reviews";
import Models from "@/pages/models";
import Prompts from "@/pages/prompts";
import Courses from "@/pages/courses";
import Jobs from "@/pages/jobs";
import News from "@/pages/news";
import Profile from "@/pages/profile";
import AdminPanel from "@/pages/admin";
import AdminDashboard from "@/pages/admin/dashboard";
import PromptMarketplace from "@/pages/admin/prompt-marketplace";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Configure NProgress
  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      minimum: 0.1,
      trickleSpeed: 800
    });
  }, []);

  // Show loading progress on route changes
  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location]);

  return (
    <Switch>
      {/* Public routes that work for both authenticated and unauthenticated users */}
      <Route path="/tools" component={Tools} />
      <Route path="/tools/:toolId/alternatives" component={AlternativesPage} />
      <Route path="/tools/:toolId/reviews" component={ToolReviews} />
      <Route path="/tools/:toolId" component={ToolDetails} />
      <Route path="/models" component={Models} />
      <Route path="/prompts" component={Prompts} />
      <Route path="/courses" component={Courses} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/news" component={News} />
      
      {/* Authenticated-only routes */}
      {isAuthenticated && (
        <>
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/prompt-marketplace" component={PromptMarketplace} />
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
