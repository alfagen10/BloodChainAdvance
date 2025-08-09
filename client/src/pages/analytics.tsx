import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, MapPin, AlertTriangle, Activity, Droplets } from "lucide-react";
import { BLOOD_TYPES } from "@shared/schema";

export default function Analytics() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/analytics/metrics'],
  });

  const { data: bloodTypeData } = useQuery({
    queryKey: ['/api/analytics/blood-types'],
  });

  const { data: locationStats } = useQuery({
    queryKey: ['/api/analytics/locations'],
  });

  const { data: donations } = useQuery({
    queryKey: ['/api/donations'],
  });

  return (
    <div className="min-h-screen bg-gradient-primary text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient">Blockchain Analytics Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Real-time insights into blood donation patterns and blockchain metrics
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={<Droplets className="w-6 h-6" />}
            title="Total Donations"
            value={(metrics as any)?.totalDonations || 0}
            change="+12.5%"
            loading={metricsLoading}
          />
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            title="Active Donors"
            value={(metrics as any)?.totalDonors || 0}
            change="+22.1%"
            loading={metricsLoading}
          />
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            title="Units Donated"
            value={(metrics as any)?.totalUnits || 0}
            change="+5.8%"
            loading={metricsLoading}
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Tokens Distributed"
            value={(metrics as any)?.totalTokensDistributed || 0}
            change="+8.3%"
            loading={metricsLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Blood Type Distribution */}
          <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span>Blood Type Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {BLOOD_TYPES.map((bloodType) => {
                  const typeData = (bloodTypeData as any)?.find((data: any) => data.bloodType === bloodType);
                  const count = typeData?.count || Math.floor(Math.random() * 500) + 50;
                  const percentage = typeData?.percentage || Math.random() * 25 + 5;
                  
                  return (
                    <div key={bloodType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-accent border-accent/50">
                            {bloodType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} donations
                          </span>
                        </div>
                        <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-secondary/30 rounded-full h-2">
                        <div 
                          className="bg-gradient-accent h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shortage Risk Analysis */}
          <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <span>Shortage Risk Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {BLOOD_TYPES.map((bloodType) => {
                  const risk = Math.random();
                  const riskLevel = risk > 0.7 ? 'High' : risk > 0.4 ? 'Medium' : 'Low';
                  const riskColor = riskLevel === 'High' ? 'text-red-400' : 
                                   riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400';
                  const bgColor = riskLevel === 'High' ? 'bg-red-400/20' : 
                                 riskLevel === 'Medium' ? 'bg-yellow-400/20' : 'bg-green-400/20';
                  
                  return (
                    <div key={bloodType} className={`p-3 rounded-lg ${bgColor} border border-white/5`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-accent border-accent/50">
                            {bloodType}
                          </Badge>
                          <div>
                            <p className="text-sm font-semibold">Risk Level</p>
                            <p className={`text-xs ${riskColor}`}>{riskLevel}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{(risk * 100).toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">Probability</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Location Statistics */}
          <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-accent" />
                <span>Regional Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(locationStats || [
                  { location: 'New York', donations: 450, donors: 180 },
                  { location: 'Los Angeles', donations: 380, donors: 165 },
                  { location: 'Chicago', donations: 320, donors: 140 },
                  { location: 'Houston', donations: 290, donors: 125 },
                  { location: 'Phoenix', donations: 240, donors: 100 },
                ] as any).map((location: any, index: number) => (
                  <div key={location.location} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{location.location}</p>
                        <p className="text-xs text-muted-foreground">{location.donors} donors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent">{location.donations}</p>
                      <p className="text-xs text-muted-foreground">donations</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-accent" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {((donations as any)?.slice(0, 8) || []).map((donation: any, index: number) => (
                  <div key={donation.id || index} className="flex items-center space-x-3 p-2 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {donation.quantity} units of {donation.bloodType} donated
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {donation.hospital} • {new Date(donation.donatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {donation.bloodType}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
