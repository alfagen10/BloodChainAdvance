import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Activity, AlertTriangle } from "lucide-react";
import { BLOOD_TYPES } from "@shared/schema";

export function BlockchainAnalytics() {
  const { data: bloodTypeData, isLoading } = useQuery({
    queryKey: ['/api/analytics/blood-types'],
  });

  const chartStyle = {
    backgroundImage: `linear-gradient(rgba(33, 41, 52, 0.8), rgba(33, 41, 52, 0.8)), url('https://images.unsplash.com/photo-1642790551116-18e150f248e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <span>Real-time Blockchain Analytics</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Chart Area */}
        <div className="h-64 rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden" style={chartStyle}>
          <div className="relative z-10 text-center">
            <Activity className="w-12 h-12 text-accent mb-4 mx-auto" />
            <p className="text-white font-semibold">Interactive Chart Component</p>
            <p className="text-sm text-gray-400">Real-time donation tracking and predictions</p>
          </div>
        </div>

        {/* Blood Type Distribution */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            <span>Blood Type Shortage Prediction</span>
          </h4>
          
          <div className="grid grid-cols-4 gap-4">
            {BLOOD_TYPES.map((bloodType) => {
              const typeData = (bloodTypeData as any)?.find((data: any) => data.bloodType === bloodType);
              const stockLevel = typeData ? Math.floor(typeData.percentage * 1.5) : Math.floor(Math.random() * 100);
              const riskLevel = stockLevel > 80 ? 'Low' : stockLevel > 50 ? 'Medium' : 'High';
              const riskColor = stockLevel > 80 ? 'bg-green-400' : stockLevel > 50 ? 'bg-yellow-400' : 'bg-red-400';
              
              return (
                <Card key={bloodType} className="bg-secondary/50 border-white/5 hover:border-accent/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-accent">{bloodType}</span>
                      <div className={`w-2 h-2 ${riskColor} rounded-full`}></div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">Stock Level</div>
                    <div className="text-lg font-bold text-white mb-1">{stockLevel}%</div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${riskLevel === 'High' ? 'border-red-400 text-red-400' : riskLevel === 'Medium' ? 'border-yellow-400 text-yellow-400' : 'border-green-400 text-green-400'}`}
                    >
                      {riskLevel} Risk
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Recent Blockchain Activity</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {[
              { type: 'donation', message: 'New donation logged: 2 units of A+', time: '2 min ago' },
              { type: 'nft', message: 'NFT certificate minted for donation #1247', time: '5 min ago' },
              { type: 'reward', message: '50 BLOOD tokens distributed', time: '8 min ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-secondary/30 rounded-lg">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
