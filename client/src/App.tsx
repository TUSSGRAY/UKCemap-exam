import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Quiz from "@/pages/quiz";
import Results from "@/pages/results";
import Certificate from "@/pages/certificate";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import PrivacyPolicy from "@/pages/privacy-policy";
import CemapQualification from "@/pages/cemap-qualification";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quiz/practice">
        {() => <Quiz mode="practice" />}
      </Route>
      <Route path="/quiz/exam">
        {() => <Quiz mode="exam" />}
      </Route>
      <Route path="/quiz/scenario">
        {() => <Quiz mode="scenario" />}
      </Route>
      <Route path="/quiz/topic-exam">
        {() => <Quiz mode="topic-exam" />}
      </Route>
      <Route path="/cemap-qualification" component={CemapQualification} />
      <Route path="/results" component={Results} />
      <Route path="/certificate" component={Certificate} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
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
