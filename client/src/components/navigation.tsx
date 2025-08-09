import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { WalletConnection } from "@/components/wallet-connection";
import { Box, Activity, Award, Code, BarChart3, Building2, Users } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/analytics", label: "Analytics", icon: Activity },
    { path: "/nft-certificates", label: "NFT Certificates", icon: Award },
    { path: "/smart-contracts", label: "Smart Contracts", icon: Code },
    { path: "/donor-registration", label: "Register Donor", icon: Users },
    { path: "/hospital-dashboard", label: "Hospital", icon: Building2 },
  ];

  return (
    <nav className="relative z-10 px-6 py-4 bg-glass backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center animate-glow">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">BloodChain</h1>
            <p className="text-xs text-muted-foreground">Advanced Blockchain Platform</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-2 transition-colors duration-300 ${
                    isActive 
                      ? 'text-accent bg-accent/10' 
                      : 'text-muted-foreground hover:text-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          {/* Network Status */}
          <div className="hidden lg:flex items-center space-x-2 bg-glass backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Polygon Amoy</span>
          </div>
          
          <WalletConnection />
        </div>
      </div>
    </nav>
  );
}
