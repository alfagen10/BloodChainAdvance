import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/hooks/use-web3";
import { useSmartContracts } from "@/hooks/use-smart-contracts";
import { useState } from "react";
import { 
  Code, 
  ExternalLink, 
  Copy, 
  Activity, 
  Zap, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/lib/web3-config";
import { useToast } from "@/hooks/use-toast";

export default function SmartContracts() {
  const { isConnected, account } = useWeb3();
  const { getDonorInfo } = useSmartContracts();
  const { toast } = useToast();
  
  const [selectedContract, setSelectedContract] = useState<string>('blood-donation');
  const [interactionInput, setInteractionInput] = useState('');

  const { data: contractEvents } = useQuery({
    queryKey: ['/api/blockchain/events'],
  });

  const { data: tokenTransactions } = useQuery({
    queryKey: ['/api/tokens/transactions'],
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const contracts = [
    {
      id: 'blood-donation',
      name: 'BloodDonation',
      address: CONTRACT_ADDRESSES.BLOOD_DONATION,
      description: 'Main contract for managing blood donations and donor registration',
      status: 'active',
      version: 'v1.0.0',
      gasUsed: '2,847,392',
      functions: [
        'registerDonor(address,string,string)',
        'logDonation(string,uint256,string)',
        'getDonorInfo(address)',
        'getTotalDonations()',
      ]
    },
    {
      id: 'blood-token',
      name: 'BloodToken (BLOOD)',
      address: CONTRACT_ADDRESSES.BLOOD_TOKEN,
      description: 'ERC-20 token for rewarding blood donors',
      status: 'active',
      version: 'v1.0.0',
      gasUsed: '1,234,567',
      functions: [
        'transfer(address,uint256)',
        'approve(address,uint256)',
        'mint(address,uint256)',
        'balanceOf(address)',
      ]
    },
    {
      id: 'donation-nft',
      name: 'DonationNFT',
      address: CONTRACT_ADDRESSES.DONATION_NFT,
      description: 'ERC-721 NFT certificates for donation records',
      status: 'active',
      version: 'v1.0.0',
      gasUsed: '987,654',
      functions: [
        'mint(address,string)',
        'tokenURI(uint256)',
        'ownerOf(uint256)',
        'balanceOf(address)',
      ]
    }
  ];

  const mockEvents = [
    {
      id: "1",
      eventType: "DonationLogged",
      contractAddress: CONTRACT_ADDRESSES.BLOOD_DONATION,
      transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
      blockNumber: 28394752,
      eventData: JSON.stringify({
        donor: "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
        bloodType: "A+",
        quantity: 2,
        hospital: "General Hospital"
      }),
      processedAt: new Date().toISOString(),
    },
    {
      id: "2",
      eventType: "TokenMinted",
      contractAddress: CONTRACT_ADDRESSES.BLOOD_TOKEN,
      transactionHash: "0xabcdef1234567890abcdef1234567890abcdef12",
      blockNumber: 28394751,
      eventData: JSON.stringify({
        to: "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
        amount: "50000000000000000000"
      }),
      processedAt: new Date().toISOString(),
    },
  ];

  const displayEvents = contractEvents || mockEvents;

  return (
    <div className="min-h-screen bg-gradient-primary text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient">Smart Contracts</h1>
          <p className="text-xl text-muted-foreground">
            Interact with deployed blockchain contracts and monitor activity
          </p>
        </div>

        {/* Contract Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <Card key={contract.id} className="bg-glass backdrop-blur-md border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{contract.name}</h3>
                      <p className="text-xs text-muted-foreground">{contract.version}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{contract.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Address:</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono text-accent">{contract.address.slice(0, 6)}...{contract.address.slice(-4)}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(contract.address, 'Contract address')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gas Used:</span>
                    <span className="text-white">{contract.gasUsed}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`https://mumbai.polygonscan.com/address/${contract.address}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Explorer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedContract(contract.id)}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Interact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-glass border-white/10">
            <TabsTrigger value="events">Contract Events</TabsTrigger>
            <TabsTrigger value="transactions">Token Transactions</TabsTrigger>
            <TabsTrigger value="interactions">Contract Interactions</TabsTrigger>
            <TabsTrigger value="analytics">Gas Analytics</TabsTrigger>
          </TabsList>

          {/* Contract Events */}
          <TabsContent value="events">
            <Card className="bg-glass backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-accent" />
                  <span>Recent Contract Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(displayEvents as any).length > 0 ? (displayEvents as any).map((event: any) => (
                    <Card key={event.id} className="bg-secondary/30 border-white/5">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-accent border-accent/50">
                                {event.eventType}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Block #{event.blockNumber?.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Contract: </span>
                              <span className="font-mono text-accent">
                                {event.contractAddress?.slice(0, 10)}...{event.contractAddress?.slice(-4)}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Tx Hash: </span>
                              <span className="font-mono text-accent">
                                {event.transactionHash?.slice(0, 10)}...{event.transactionHash?.slice(-4)}
                              </span>
                            </div>
                            {event.eventData && (
                              <div className="text-xs bg-muted/50 p-2 rounded font-mono max-w-md overflow-hidden">
                                {event.eventData}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.processedAt).toLocaleString()}
                            </p>
                            <Button size="sm" variant="ghost" className="mt-1">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No contract events found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Transactions */}
          <TabsContent value="transactions">
            <Card className="bg-glass backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span>Token Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'mint', from: null, to: account, amount: '50.0', hash: '0xabc123...def456', time: '2 min ago' },
                    { type: 'transfer', from: account, to: '0x123...789', amount: '25.0', hash: '0xdef456...abc123', time: '1 hour ago' },
                    { type: 'mint', from: null, to: account, amount: '30.0', hash: '0x789abc...123def', time: '3 hours ago' },
                  ].map((tx, index) => (
                    <Card key={index} className="bg-secondary/30 border-white/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'mint' ? 'bg-green-400/20 text-green-400' : 'bg-blue-400/20 text-blue-400'
                            }`}>
                              {tx.type === 'mint' ? '+' : '→'}
                            </div>
                            <div>
                              <p className="font-semibold text-white capitalize">{tx.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {tx.from ? `From ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : 'Minted'} 
                                {tx.to && ` to ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">{tx.hash}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-accent">{tx.amount} BLOOD</p>
                            <p className="text-xs text-muted-foreground">{tx.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contract Interactions */}
          <TabsContent value="interactions">
            <Card className="bg-glass backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-accent" />
                  <span>Contract Interactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected && (
                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-yellow-400">Connect your wallet to interact with smart contracts</p>
                  </div>
                )}
                
                {contracts.map((contract) => (
                  <Card key={contract.id} className="bg-secondary/30 border-white/5">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-3">{contract.name}</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`${contract.id}-input`} className="text-sm text-muted-foreground">
                            Function Parameters
                          </Label>
                          <Input
                            id={`${contract.id}-input`}
                            placeholder="Enter parameters..."
                            value={interactionInput}
                            onChange={(e) => setInteractionInput(e.target.value)}
                            className="bg-input border-white/10"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {contract.functions.slice(0, 4).map((func, index) => (
                            <Button 
                              key={index}
                              size="sm" 
                              variant="outline"
                              className="text-xs"
                              disabled={!isConnected}
                            >
                              {func.split('(')[0]}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gas Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-glass backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span>Gas Usage Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Gas Price</p>
                      <p className="text-xl font-bold text-white">24.5 gwei</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Gas Used</p>
                      <p className="text-xl font-bold text-white">5.2M</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">BloodDonation</span>
                      <span className="text-sm font-semibold">45%</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div className="bg-gradient-accent h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">BloodToken</span>
                      <span className="text-sm font-semibold">35%</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div className="bg-gradient-gold h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">DonationNFT</span>
                      <span className="text-sm font-semibold">20%</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div className="bg-purple h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-glass backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-accent" />
                    <span>Security Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Audit Status</span>
                      </div>
                      <Badge className="bg-green-400/20 text-green-400">Verified</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Multi-sig Protection</span>
                      </div>
                      <Badge className="bg-green-400/20 text-green-400">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">Timelock</span>
                      </div>
                      <Badge className="bg-yellow-400/20 text-yellow-400">24h Delay</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
