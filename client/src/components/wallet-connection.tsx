import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWeb3 } from "@/hooks/use-web3";
import { Wallet, ChevronDown, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { formatAddress } from "@/lib/blockchain-utils";
import { useToast } from "@/hooks/use-toast";

export function WalletConnection() {
  const { account, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWeb3();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openExplorer = () => {
    if (account) {
      window.open(`https://mumbai.polygonscan.com/address/${account}`, '_blank');
    }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-glass backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-mono">{formatAddress(account)}</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="p-2"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Wallet Connected</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
                <p className="font-mono text-sm break-all">{account}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={copyAddress} variant="outline" size="sm" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </Button>
                <Button onClick={openExplorer} variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
              
              <Button onClick={disconnectWallet} variant="destructive" className="w-full">
                Disconnect Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        disabled={isConnecting}
        className="gradient-accent hover:opacity-90 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 animate-glow btn-glow"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gradient">
              Connect Your Wallet
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 bg-secondary/50 border border-white/10 rounded-lg hover:border-accent/50 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">MetaMask</p>
                  <p className="text-xs text-muted-foreground">Connect using browser wallet</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground rotate-270" />
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By connecting a wallet, you agree to our terms of service
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
