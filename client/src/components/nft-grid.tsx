import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/context/web3-context";
import { Award, ExternalLink, Plus } from "lucide-react";

export function NFTGrid() {
  const { account } = useWeb3();
  
  const { data: nftCertificates, isLoading } = useQuery({
    queryKey: ['/api/nft-certificates'],
    enabled: !!account,
  });

  const nftImageStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  // Mock data for demo
  const mockNFTs = [
    {
      id: "1",
      tokenId: "1247",
      donorAddress: account || "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
      title: "Donation Certificate #1247",
      bloodType: "A+",
      quantity: 2,
      hospital: "General Hospital",
      date: "2024-01-15",
      imageUri: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=300",
    },
    {
      id: "2", 
      tokenId: "1248",
      donorAddress: account || "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
      title: "Donation Certificate #1248",
      bloodType: "O-",
      quantity: 1,
      hospital: "City Medical Center",
      date: "2024-01-10", 
      imageUri: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=300",
    },
    {
      id: "3",
      tokenId: "1249", 
      donorAddress: account || "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
      title: "Donation Certificate #1249",
      bloodType: "B+",
      quantity: 3,
      hospital: "Regional Hospital",
      date: "2024-01-05",
      imageUri: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=300",
    },
  ];

  const displayNFTs = (nftCertificates as any)?.length ? nftCertificates : mockNFTs;

  return (
    <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-accent" />
            <span>NFT Certificates</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-accent hover:text-gold">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary/30 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (displayNFTs as any).length > 0 ? (
          <div className="space-y-4">
            {(displayNFTs as any).slice(0, 3).map((nft: any) => (
              <Card key={nft.id} className="nft-card cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* NFT Image */}
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center group-hover:animate-glow relative overflow-hidden">
                      <div 
                        className="w-full h-full rounded-lg" 
                        style={nftImageStyle}
                      >
                        <div className="w-full h-full bg-gradient-accent/80 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* NFT Details */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{nft.title}</h4>
                      <p className="text-sm text-muted-foreground">{nft.date}</p>
                      <p className="text-xs text-accent font-mono">
                        Token ID: {nft.tokenId}
                      </p>
                    </div>
                    
                    {/* NFT Stats */}
                    <div className="text-right">
                      <Badge variant="outline" className="text-gold border-gold/50 mb-1">
                        {nft.bloodType}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {nft.quantity} {nft.quantity === 1 ? 'unit' : 'units'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No NFT certificates yet</p>
            <p className="text-sm text-muted-foreground">
              Donate blood to earn your first certificate NFT
            </p>
          </div>
        )}
        
        <Button className="w-full gradient-accent hover:opacity-90 transition-all duration-300 btn-glow">
          <Plus className="w-4 h-4 mr-2" />
          Mint New Certificate
        </Button>
      </CardContent>
    </Card>
  );
}
