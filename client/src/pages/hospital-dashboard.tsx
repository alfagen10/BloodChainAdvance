import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Building2, 
  Droplets, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Search,
  Filter,
  BarChart3,
  Activity,
  Calendar,
  MapPin
} from "lucide-react";
import { BLOOD_TYPES } from "@shared/schema";

export default function HospitalDashboard() {
  const [filterBloodType, setFilterBloodType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: metrics } = useQuery({
    queryKey: ['/api/analytics/metrics'],
  });

  const { data: bloodTypes } = useQuery({
    queryKey: ['/api/analytics/blood-types'],
  });

  const { data: donations } = useQuery({
    queryKey: ['/api/donations'],
  });

  const inventoryData = BLOOD_TYPES.map(type => {
    const count = Array.isArray(bloodTypes) ? bloodTypes.find((bt: any) => bt.bloodType === type)?.count || 0 : 0;
    const status = count < 5 ? 'critical' : count < 15 ? 'low' : 'good';
    return { type, count, status };
  });

  const urgentRequests = [
    { bloodType: 'O-', units: 5, priority: 'critical', hospital: 'General Hospital', eta: '2 hours' },
    { bloodType: 'AB+', units: 3, priority: 'high', hospital: 'City Medical Center', eta: '4 hours' },
    { bloodType: 'B-', units: 2, priority: 'medium', hospital: 'Regional Clinic', eta: '6 hours' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'low': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary text-foreground">
      <Navigation />
      
      {/* Header */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center animate-glow">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">Hospital Dashboard</h1>
                <p className="text-muted-foreground">Blood inventory management & donation tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                <Calendar className="w-3 h-3 mr-1" />
                Updated 2 min ago
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="text-2xl font-bold text-white">{(metrics as any)?.totalUnits || 147}</p>
                    <p className="text-xs text-green-400">+12% this week</p>
                  </div>
                  <Droplets className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Donors</p>
                    <p className="text-2xl font-bold text-white">{(metrics as any)?.totalDonors || 892}</p>
                    <p className="text-xs text-green-400">+8% this month</p>
                  </div>
                  <Users className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Alerts</p>
                    <p className="text-2xl font-bold text-red-400">3</p>
                    <p className="text-xs text-red-400">Requires attention</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Donations</p>
                    <p className="text-2xl font-bold text-white">23</p>
                    <p className="text-xs text-green-400">Above average</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Blood Inventory */}
            <div className="lg:col-span-2">
              <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                    <Droplets className="w-5 h-5 text-accent" />
                    <span>Blood Inventory Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {inventoryData.map((item) => (
                      <Card key={item.type} className="bg-secondary/30 border-white/10">
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{item.type}</span>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-white mb-1">{item.count}</p>
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {item.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Donations */}
              <Card className="bg-glass backdrop-blur-md border-white/10 card-hover mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-accent" />
                      <span>Recent Donations</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search donations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-secondary/50 border-white/20 text-white w-48"
                        />
                      </div>
                      <Select value={filterBloodType} onValueChange={setFilterBloodType}>
                        <SelectTrigger className="w-32 bg-secondary/50 border-white/20 text-white">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">O+</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">Donor #{1000 + i}</p>
                            <p className="text-xs text-muted-foreground">2 units • General Hospital</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">+20 BLOOD</p>
                          <p className="text-xs text-muted-foreground">{i} hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Urgent Requests */}
            <div>
              <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>Urgent Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {urgentRequests.map((request, index) => (
                    <Card key={index} className="bg-secondary/30 border-red-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getPriorityColor(request.priority)} text-white`}>
                            {request.priority.toUpperCase()}
                          </Badge>
                          <span className="text-white font-bold">{request.bloodType}</span>
                        </div>
                        <p className="text-white font-semibold mb-1">{request.units} units needed</p>
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          {request.hospital}
                        </div>
                        <p className="text-xs text-muted-foreground">ETA: {request.eta}</p>
                        <Button className="w-full mt-3 gradient-accent hover:opacity-90 text-sm">
                          Fulfill Request
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-glass backdrop-blur-md border-white/10 card-hover mt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full gradient-gold hover:opacity-90 justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button className="w-full bg-secondary/50 hover:bg-secondary/70 justify-start text-white">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                  <Button className="w-full bg-secondary/50 hover:bg-secondary/70 justify-start text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Contact Donors
                  </Button>
                  <Button className="w-full bg-secondary/50 hover:bg-secondary/70 justify-start text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Drive
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}