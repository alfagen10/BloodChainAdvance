import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartContracts } from "@/hooks/use-smart-contracts";
import { useWeb3 } from "@/context/web3-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Code, Plus, ExternalLink, Zap } from "lucide-react";
import { BLOOD_TYPES } from "@shared/schema";
import { CONTRACT_ADDRESSES } from "@/lib/web3-config";

export function SmartContractPanel() {
  const { logDonation, isContractsReady } = useSmartContracts();
  const { isConnected, account } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [donationForm, setDonationForm] = useState({
    bloodType: '',
    quantity: 1,
    hospital: '',
  });

  const logDonationMutation = useMutation({
    mutationFn: async (data: typeof donationForm) => {
      if (!account) throw new Error('Wallet not connected');
      
      // Log donation on blockchain
      const receipt = await logDonation(data.bloodType, data.quantity, data.hospital);
      
      // Store in database
      await apiRequest('POST', '/api/donations', {
        donorId: account,
        bloodType: data.bloodType,
        quantity: data.quantity,
        hospital: data.hospital,
        location: 'Default Location', // In real app, this would come from user profile
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        rewardTokens: (data.quantity * 10).toString(),
      });

      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      setDonationForm({ bloodType: '', quantity: 1, hospital: '' });
      toast({
        title: "Success!",
        description: "Donation logged successfully on blockchain and database",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log donation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.bloodType || !donationForm.hospital) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    logDonationMutation.mutate(donationForm);
  };

  return (
    <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
          <Code className="w-5 h-5 text-accent" />
          <span>Smart Contract Interaction</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Donation Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-accent flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Log New Donation</span>
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="bloodType" className="text-sm text-muted-foreground">Blood Type</Label>
                <Select 
                  value={donationForm.bloodType} 
                  onValueChange={(value) => setDonationForm(prev => ({ ...prev, bloodType: value }))}
                >
                  <SelectTrigger className="bg-secondary/50 border-white/10 text-white focus:border-accent">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity" className="text-sm text-muted-foreground">Quantity (units)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={donationForm.quantity}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                  className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                />
              </div>
              
              <div>
                <Label htmlFor="hospital" className="text-sm text-muted-foreground">Hospital</Label>
                <Input
                  id="hospital"
                  value={donationForm.hospital}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, hospital: e.target.value }))}
                  placeholder="General Hospital"
                  className="bg-secondary/50 border-white/20 text-white placeholder:text-gray-400 focus:border-accent"
                />
              </div>
              
              <Button 
                type="submit"
                disabled={!isConnected || !isContractsReady || logDonationMutation.isPending}
                className="w-full gradient-accent hover:opacity-90 transition-all duration-300 transform hover:scale-105 btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                {logDonationMutation.isPending ? "Logging..." : "Log Donation"}
              </Button>
            </form>
          </div>

          {/* Contract Status */}
          <div className="space-y-4">
            <h4 className="font-semibold text-accent flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Contract Status</span>
            </h4>
            
            <div className="space-y-3">
              <ContractStatusItem
                label="BloodDonation Contract"
                address={CONTRACT_ADDRESSES.BLOOD_DONATION}
              />
              <ContractStatusItem
                label="BLOOD Token Contract"
                address={CONTRACT_ADDRESSES.BLOOD_TOKEN}
              />
              <ContractStatusItem
                label="NFT Certificate Contract"
                address={CONTRACT_ADDRESSES.DONATION_NFT}
              />
              
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-white/5">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm text-green-400">Polygon Mumbai</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-white/5">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Connected</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => window.open('https://mumbai.polygonscan.com/', '_blank')}
                className="w-full bg-glass border-white/20 hover:border-accent/50 transition-all duration-300"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Block Explorer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractStatusItem({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-white/5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono text-accent">{address.slice(0, 6)}...{address.slice(-4)}</span>
    </div>
  );
}
