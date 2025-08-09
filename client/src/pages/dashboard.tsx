import { Navigation } from "@/components/navigation";
import { BlockchainAnalytics } from "@/components/blockchain-analytics";
import { SmartContractPanel } from "@/components/smart-contract-panel";
import { NFTGrid } from "@/components/nft-grid";
import { TokenEconomics } from "@/components/token-economics";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Droplets, Coins, Award } from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/analytics/metrics'],
  });

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(124, 58, 237, 0.8)), url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const floatingParticles = (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute top-20 left-20 w-32 h-32 bg-accent/10 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-gold/15 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-purple/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-primary text-foreground overflow-x-hidden">
      {floatingParticles}
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 rounded-20 p-20 relative" style={heroStyle}>
            <div className="relative z-10">
              <h2 className="text-5xl font-bold mb-6 text-gradient">
                Revolutionizing Blood Donation with Blockchain
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Secure, transparent, and incentivized blood donation system powered by smart contracts, NFT certificates, and AI-driven shortage prediction.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="gradient-gold hover:opacity-90 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 btn-glow">
                  <Users className="w-5 h-5 mr-2 inline" />
                  Register as Donor
                </button>
                <button className="bg-glass backdrop-blur-sm border border-white/20 hover:border-accent/50 px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                  <TrendingUp className="w-5 h-5 mr-2 inline" />
                  Hospital Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <MetricCard
              icon={<Droplets className="w-6 h-6" />}
              title="Total Donations"
              value={(metrics as any)?.totalDonations || 0}
              change="+12.5%"
              loading={metricsLoading}
            />
            <MetricCard
              icon={<Coins className="w-6 h-6" />}
              title="BLOOD Tokens"
              value={(metrics as any)?.totalTokensDistributed || 0}
              change="+8.3%"
              loading={metricsLoading}
            />
            <MetricCard
              icon={<Award className="w-6 h-6" />}
              title="NFT Certificates"
              value={(metrics as any)?.totalNFTsMinted || 0}
              change="+15.7%"
              loading={metricsLoading}
            />
            <MetricCard
              icon={<Users className="w-6 h-6" />}
              title="Registered Donors"
              value={(metrics as any)?.totalDonors || 0}
              change="+22.1%"
              loading={metricsLoading}
            />
            <MetricCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Total Units"
              value={(metrics as any)?.totalUnits || 0}
              change="+5.8%"
              loading={metricsLoading}
            />
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Analytics & Smart Contracts */}
            <div className="lg:col-span-2 space-y-8">
              <BlockchainAnalytics />
              <SmartContractPanel />
            </div>

            {/* Right Column: NFTs & Token Economics */}
            <div className="space-y-8">
              <NFTGrid />
              <TokenEconomics />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  change: string;
  loading?: boolean;
}

function MetricCard({ icon, title, value, change, loading }: MetricCardProps) {
  return (
    <Card className="bg-glass backdrop-blur-md border-white/10 hover:border-accent/50 transition-all duration-300 group card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center group-hover:animate-glow text-white">
            {icon}
          </div>
          <div className="text-sm text-green-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>{change}</span>
          </div>
        </div>
        <h3 className="text-3xl font-bold text-white mb-2">
          {loading ? (
            <div className="h-8 bg-muted animate-pulse rounded"></div>
          ) : (
            value.toLocaleString()
          )}
        </h3>
        <p className="text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
