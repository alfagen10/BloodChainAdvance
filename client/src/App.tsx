import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/context/web3-context";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import NFTCertificates from "@/pages/nft-certificates";
import SmartContracts from "@/pages/smart-contracts";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/nft-certificates" component={NFTCertificates} />
      <Route path="/smart-contracts" component={SmartContracts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-primary text-foreground">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
