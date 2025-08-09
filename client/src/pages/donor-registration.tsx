import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWeb3 } from "@/context/web3-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, Heart, Shield, Award, CheckCircle, Star } from "lucide-react";
import { BLOOD_TYPES } from "@shared/schema";

export default function DonorRegistration() {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    bloodType: '',
    age: '',
    weight: '',
    phone: '',
    email: '',
    address: '',
    medicalHistory: '',
    emergencyContact: '',
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!account) throw new Error('Wallet not connected');
      
      return await apiRequest('POST', '/api/donors', {
        id: account,
        name: data.name,
        bloodType: data.bloodType,
        age: parseInt(data.age),
        weight: parseFloat(data.weight),
        phone: data.phone,
        email: data.email,
        address: data.address,
        medicalHistory: data.medicalHistory,
        emergencyContact: data.emergencyContact,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
      toast({
        title: "Registration Successful! 🎉",
        description: "Welcome to BloodChain! You can now start donating blood and earning rewards.",
      });
      setFormData({
        name: '', bloodType: '', age: '', weight: '', phone: '', email: '', 
        address: '', medicalHistory: '', emergencyContact: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register donor",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.bloodType || !formData.age) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    registrationMutation.mutate(formData);
  };

  const benefits = [
    { icon: <Award className="w-6 h-6" />, title: "BLOOD Tokens", desc: "Earn 10 tokens per donation" },
    { icon: <Star className="w-6 h-6" />, title: "NFT Certificates", desc: "Unique digital certificates for each donation" },
    { icon: <Shield className="w-6 h-6" />, title: "Blockchain Security", desc: "Immutable donation records" },
    { icon: <Heart className="w-6 h-6" />, title: "Life Impact", desc: "Save lives with verified donations" },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative px-6 py-6">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Users className="w-5 h-5 text-accent" />
            <span className="text-accent font-semibold">Join the Revolution</span>
          </div>
          <h1 className="text-5xl font-bold text-gradient mb-6">
            Become a Verified Blood Donor
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of donors earning blockchain rewards while saving lives. 
            Get verified, donate blood, and earn BLOOD tokens and NFT certificates.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-glass backdrop-blur-md border-white/10 card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gradient">
                Donor Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-6">
                    Please connect your MetaMask wallet to register as a donor
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType" className="text-white">Blood Type *</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}>
                      <SelectTrigger className="bg-secondary/50 border-white/20 text-white focus:border-accent">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-white">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="65"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="25"
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-white">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="50"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="70"
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State, ZIP"
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-white">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      placeholder="Emergency contact name & phone"
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory" className="text-white">Medical History (Optional)</Label>
                    <Textarea
                      id="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                      placeholder="Any relevant medical conditions or medications..."
                      className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <Button 
                      type="submit"
                      disabled={registrationMutation.isPending}
                      className="w-full gradient-gold hover:opacity-90 transition-all duration-300 transform hover:scale-105 btn-glow"
                    >
                      {registrationMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Register as Donor
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}