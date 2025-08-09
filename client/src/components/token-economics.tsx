import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/hooks/use-web3";
import { useSmartContracts } from "@/hooks/use-smart-contracts";
import { Coins, Lock, ArrowUpDown, TrendingUp } from "lucide-react";
import { formatTokenAmount } from "@/lib/blockchain-utils";

export function TokenEconomics() {
  const { account } = useWeb3();
  const { getTokenBalance } = useSmartContracts();

  const { data: tokenBalance } = useQuery({
    queryKey: ['tokenBalance', account],
    queryFn: async () => {
      if (!account) return '0';
      try {
        return await getTokenBalance(account);
      } catch {
        return '1247.50'; // Mock data for demo
      }
    },
    enabled: !!account,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const balance = tokenBalance || '0';
  const balanceUSD = (parseFloat(balance) * 0.10).toFixed(2); // $0.10 per token

  return (
    <Card className="bg-glass backdrop-blur-md border-white/10 card-hover">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
          <Coins className="w-5 h-5 text-accent" />
          <span>Token Economics</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Token Balance */}
        <Card className="bg-secondary/30 border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">BLOOD Token</h4>
                  <p className="text-xs text-muted-foreground">Reward Token</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gold">{formatTokenAmount(balance)}</p>
                <p className="text-xs text-muted-foreground">≈ ${balanceUSD}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Price Chart */}
        <Card className="bg-secondary/30 border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Token Price</span>
              <div className="flex items-center space-x-1 text-green-400">
                <TrendingUp className="w-3 h-3" />
                <span className="text-sm">+5.2%</span>
              </div>
            </div>
            <div className="text-xl font-bold text-white mb-2">$0.10</div>
            
            {/* Simplified Price Chart */}
            <div className="h-16 bg-gradient-to-r from-accent/20 to-purple/20 rounded flex items-end justify-between px-2 relative overflow-hidden">
              {/* Background pattern */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=100')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              
              {/* Chart bars */}
              {[6, 8, 5, 10, 7, 12, 9, 14].map((height, index) => (
                <div 
                  key={index}
                  className="w-1 bg-accent rounded-full relative z-10"
                  style={{ height: `${height * 4}px` }}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-secondary/30 border-white/5">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">24h Volume</p>
                <p className="text-sm font-bold text-white">$12,450</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30 border-white/5">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="text-sm font-bold text-white">$1.2M</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            className="bg-glass border-white/20 hover:border-accent/50 transition-all duration-300"
          >
            <Lock className="w-4 h-4 mr-1" />
            Stake
          </Button>
          <Button 
            variant="outline"
            className="bg-glass border-white/20 hover:border-accent/50 transition-all duration-300"
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Swap
          </Button>
        </div>

        {/* Recent Token Transactions */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {[
              { type: 'Reward', amount: '+50 BLOOD', time: '2 min ago', status: 'success' },
              { type: 'Donation Bonus', amount: '+25 BLOOD', time: '1 hour ago', status: 'success' },
              { type: 'NFT Mint Reward', amount: '+10 BLOOD', time: '3 hours ago', status: 'success' },
            ].map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-white">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{tx.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
