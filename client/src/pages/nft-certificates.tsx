import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWeb3 } from "@/context/web3-context";
import { useSmartContracts } from "@/hooks/use-smart-contracts";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Award, Plus, ExternalLink, Share2, Download, Eye, QrCode } from "lucide-react";
import { generateNFTMetadata } from "@/lib/blockchain-utils";

export default function NFTCertificates() {
  const { account, isConnected } = useWeb3();
  const { mintNFTCertificate } = useSmartContracts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [isMintDialogOpen, setIsMintDialogOpen] = useState(false);
  const [mintForm, setMintForm] = useState({
    donorName: '',
    bloodType: 'A+',
    quantity: 1,
    hospital: '',
  });

  const { data: nftCertificates, isLoading } = useQuery({
    queryKey: ['/api/nft-certificates'],
  });

  const { data: userNFTs } = useQuery({
    queryKey: ['/api/nft-certificates/donor', account],
    enabled: !!account,
  });

  const mintNFTMutation = useMutation({
    mutationFn: async (data: typeof mintForm) => {
      if (!account) throw new Error('Wallet not connected');
      
      const metadata = generateNFTMetadata(
        data.donorName,
        data.bloodType,
        data.quantity,
        data.hospital,
        new Date()
      );
      
      // Create metadata URI (in production, upload to IPFS)
      const metadataUri = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;
      
      const receipt = await mintNFTCertificate(account, metadataUri);
      
      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nft-certificates'] });
      setIsMintDialogOpen(false);
      setMintForm({ donorName: '', bloodType: 'A+', quantity: 1, hospital: '' });
      toast({
        title: "NFT Minted Successfully!",
        description: "Your donation certificate NFT has been minted and recorded on the blockchain.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT certificate",
        variant: "destructive",
      });
    },
  });

  // Mock NFT data for demo
  const mockNFTs = [
    {
      id: "1",
      tokenId: "1247",
      donorAddress: account || "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
      metadataUri: "ipfs://QmNFT1...",
      imageUri: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=400",
      mintedAt: "2024-01-15T10:30:00Z",
      metadata: {
        name: "BloodChain Donation Certificate #1247",
        description: "Official donation certificate for 2 units of A+ blood donated at General Hospital.",
        attributes: [
          { trait_type: "Blood Type", value: "A+" },
          { trait_type: "Quantity", value: 2 },
          { trait_type: "Hospital", value: "General Hospital" },
          { trait_type: "Donation Date", value: "2024-01-15" },
        ]
      }
    },
    {
      id: "2",
      tokenId: "1248", 
      donorAddress: account || "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
      metadataUri: "ipfs://QmNFT2...",
      imageUri: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=400",
      mintedAt: "2024-01-10T14:20:00Z",
      metadata: {
        name: "BloodChain Donation Certificate #1248",
        description: "Official donation certificate for 1 unit of O- blood donated at City Medical Center.",
        attributes: [
          { trait_type: "Blood Type", value: "O-" },
          { trait_type: "Quantity", value: 1 },
          { trait_type: "Hospital", value: "City Medical Center" },
          { trait_type: "Donation Date", value: "2024-01-10" },
        ]
      }
    },
  ];

  const displayNFTs = nftCertificates || mockNFTs;

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintForm.donorName || !mintForm.hospital) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    mintNFTMutation.mutate(mintForm);
  };

  return (
    <div className="min-h-screen bg-gradient-primary text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient">NFT Certificates</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Blockchain-verified donation certificates as NFTs
            </p>
          </div>
          
          <Dialog open={isMintDialogOpen} onOpenChange={setIsMintDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gradient-accent hover:opacity-90 btn-glow"
                disabled={!isConnected}
              >
                <Plus className="w-4 h-4 mr-2" />
                Mint Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Mint New NFT Certificate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMint} className="space-y-4">
                <div>
                  <Label htmlFor="donorName">Donor Name</Label>
                  <Input
                    id="donorName"
                    value={mintForm.donorName}
                    onChange={(e) => setMintForm(prev => ({ ...prev, donorName: e.target.value }))}
                    placeholder="Enter donor name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <select
                    id="bloodType"
                    value={mintForm.bloodType}
                    onChange={(e) => setMintForm(prev => ({ ...prev, bloodType: e.target.value }))}
                    className="w-full mt-1 p-2 bg-input border border-border rounded-md"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity (units)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={mintForm.quantity}
                    onChange={(e) => setMintForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input
                    id="hospital"
                    value={mintForm.hospital}
                    onChange={(e) => setMintForm(prev => ({ ...prev, hospital: e.target.value }))}
                    placeholder="Enter hospital name"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full gradient-accent"
                  disabled={mintNFTMutation.isPending}
                >
                  {mintNFTMutation.isPending ? "Minting..." : "Mint NFT Certificate"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-glass backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Award className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{(displayNFTs as any).length}</p>
                  <p className="text-muted-foreground">Total Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-glass backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <ExternalLink className="w-8 h-8 text-gold" />
                <div>
                  <p className="text-2xl font-bold">{(userNFTs as any)?.length || 0}</p>
                  <p className="text-muted-foreground">Your Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Share2 className="w-8 h-8 text-purple" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-muted-foreground">Shared Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <QrCode className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-muted-foreground">Verification Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-glass backdrop-blur-md border-white/10 animate-pulse">
                <CardContent className="p-6">
                  <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (displayNFTs as any).length > 0 ? (
            (displayNFTs as any).map((nft: any) => (
              <Card key={nft.id} className="nft-card cursor-pointer" onClick={() => setSelectedNFT(nft)}>
                <CardContent className="p-0">
                  <div className="aspect-square rounded-t-lg overflow-hidden">
                    <img 
                      src={nft.imageUri} 
                      alt={nft.metadata?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-white truncate">
                        {nft.metadata?.name || `Certificate #${nft.tokenId}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Token ID: {nft.tokenId}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {nft.metadata?.attributes?.slice(0, 2).map((attr: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {attr.value}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(nft.mintedAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No NFT Certificates Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start donating blood to earn your first certificate NFT
              </p>
              <Button 
                onClick={() => setIsMintDialogOpen(true)}
                className="gradient-accent"
                disabled={!isConnected}
              >
                <Plus className="w-4 h-4 mr-2" />
                Mint Your First Certificate
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <Dialog open={!!selectedNFT} onOpenChange={() => setSelectedNFT(null)}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle>{selectedNFT.metadata?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={selectedNFT.imageUri} 
                  alt={selectedNFT.metadata?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedNFT.metadata?.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Attributes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNFT.metadata?.attributes?.map((attr: any, index: number) => (
                      <div key={index} className="bg-secondary/30 p-2 rounded">
                        <p className="text-xs text-muted-foreground">{attr.trait_type}</p>
                        <p className="text-sm font-semibold">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => window.open(`https://mumbai.polygonscan.com/token/${selectedNFT.tokenId}`, '_blank')}
                    variant="outline" 
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
